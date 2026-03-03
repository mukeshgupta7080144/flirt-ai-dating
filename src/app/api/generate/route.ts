import { NextResponse } from 'next/server';
import { generateSmartComment } from '@/ai/flows/comment-generator';
import { generateReply } from '@/ai/flows/reply-generator';
import { analyzeStory } from '@/ai/flows/story-analyzer';
import { getRelationshipCoachAdvice } from '@/ai/flows/relationship-coach';
import { generateNewLine } from '@/ai/flows/line-generator';
import { generateAllNewLines } from '@/ai/flows/all-lines-generator';

/* ================================================= */
/* CONFIG                         */
/* ================================================= */

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_IP = 20; 
const MAX_BODY_SIZE = 15_000;
const MAX_CONCURRENT_REQUESTS = 15;
const CACHE_DURATION = 60 * 1000;

/* 🔐 SECRET KEY */
const API_SECRET = process.env.API_SECRET_KEY || 'SUPER_SECRET_KEY';

const allowedFlows = new Set([
  'comment',
  'reply',
  'story',
  'relationship',
  'newLine',
  'allNewLines'
]);

/* ================================================= */
/* MEMORY STORES                     */
/* ================================================= */

const ipStore = new Map<string, { count: number; timestamp: number }>();
const cacheStore = new Map<string, { data: unknown; expiry: number }>();
const activeRequests = new Map<string, number>();

/* ================================================= */
/* UTILITIES                       */
/* ================================================= */

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('origin') || '';
  const isAllowedOrigin = origin.includes('localhost') || origin === 'https://flirt-ai-app.vercel.app';
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin && origin ? origin : 'https://flirt-ai-app.vercel.app',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  };
}

// ✅ FIX 2: Unknown IP को "global" बना दिया ताकि रेट लिमिट न टूटे
function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'global'; 
}

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipStore.get(ip);

  if (!record) {
    ipStore.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (now - record.timestamp > RATE_LIMIT_WINDOW) {
    ipStore.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_IP) {
    return true;
  }

  record.count++;
  return false;
}

// ✅ FIX 1: Cache और IP Store की Memory Leak रोकी गई
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, value] of cacheStore.entries()) {
    if (value.expiry < now) {
      cacheStore.delete(key);
    }
  }
  
  // Memory Leak Prevention (Cache)
  if (cacheStore.size > 500) {
    cacheStore.clear();
  }

  // Memory Leak Prevention (IP Store)
  if (ipStore.size > 5000) {
    ipStore.clear();
  }
}

function handleFlowError(error: unknown, corsHeaders: any) {
  let errorMessage = "Something went wrong.";
  let statusCode = 500;

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    if (msg.includes('quota')) {
      errorMessage = "AI busy. Please try again shortly.";
      statusCode = 429;
    } else if (msg.includes('network') || msg.includes('fetch')) {
      errorMessage = "AI service temporarily unavailable.";
      statusCode = 503;
    } else if (msg.includes('invalid')) {
      errorMessage = "Invalid request.";
      statusCode = 400;
    }
  }

  console.error("AI Flow Error:", error);
  return NextResponse.json({ error: errorMessage }, { status: statusCode, headers: corsHeaders });
}

/* ================================================= */
/* OPTIONS HANDLER (CORS Preflight)                  */
/* ================================================= */
export async function OPTIONS(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

/* ================================================= */
/* POST HANDLER                     */
/* ================================================= */

export async function POST(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  const ip = getClientIP(request);

  /* 🔐 SECRET KEY CHECK */
  const clientSecret = request.headers.get('x-api-key');
  if (clientSecret !== API_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized request.' },
      { status: 401, headers: corsHeaders }
    );
  }

  /* 1️⃣ Rate Limit */
  if (rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: corsHeaders }
    );
  }

  /* 2️⃣ Concurrency Protection */
  const currentActive = activeRequests.get(ip) ?? 0;

  if (currentActive >= MAX_CONCURRENT_REQUESTS) {
    return NextResponse.json(
      { error: "Too many parallel requests." },
      { status: 429, headers: corsHeaders }
    );
  }

  activeRequests.set(ip, currentActive + 1);

  try {
    cleanExpiredCache();

    /* 3️⃣ Body Size Protection */
    const rawBody = await request.text();

    if (rawBody.length > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Request too large." },
        { status: 413, headers: corsHeaders }
      );
    }

    let body: { flow: string; payload?: any };

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format." },
        { status: 400, headers: corsHeaders }
      );
    }

    const { flow, payload } = body;

    if (!flow || !allowedFlows.has(flow)) {
      return NextResponse.json(
        { error: "Invalid flow type." },
        { status: 400, headers: corsHeaders }
      );
    }

    /* 4️⃣ Cache Check */
    const cacheKey = JSON.stringify({ flow, payload });
    const cached = cacheStore.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return NextResponse.json({ result: cached.data }, { headers: corsHeaders });
    }

    let result: unknown;

    /* 5️⃣ Flow Execution */
    switch (flow) {
      case 'comment':
        if (!payload?.photoDescription) {
          return NextResponse.json(
            { error: "Missing photo description." },
            { status: 400, headers: corsHeaders }
          );
        }
        result = await generateSmartComment(payload);
        break;

      case 'reply':
        result = await generateReply(payload);
        break;

      case 'story':
        result = await analyzeStory(payload);
        break;

      case 'relationship':
        result = await getRelationshipCoachAdvice(payload);
        break;

      case 'newLine':
        result = await generateNewLine();
        break;

      case 'allNewLines': {
        const record = ipStore.get(ip);
        const currentCount = record?.count ?? 0;

        if (currentCount > 10) {
          return NextResponse.json(
            { error: "Heavy request limit reached." },
            { status: 429, headers: corsHeaders }
          );
        }

        result = await generateAllNewLines();
        break;
      }

      default:
        return NextResponse.json(
          { error: "Unsupported flow." },
          { status: 400, headers: corsHeaders }
        );
    }

    /* 6️⃣ Cache Store */
    cacheStore.set(cacheKey, {
      data: result,
      expiry: Date.now() + CACHE_DURATION
    });

    return NextResponse.json({ result }, { headers: corsHeaders });

  } catch (error) {
    return handleFlowError(error, corsHeaders);
  } finally {
    /* 🔥 Always Release Concurrency */
    const current = activeRequests.get(ip) ?? 1;

    if (current <= 1) {
      activeRequests.delete(ip);
    } else {
      activeRequests.set(ip, current - 1);
    }
  }
}