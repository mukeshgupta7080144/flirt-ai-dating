import { NextResponse } from 'next/server';
import { generateSmartComment } from '@/ai/flows/comment-generator';
import { generateReply } from '@/ai/flows/reply-generator';
import { analyzeStory } from '@/ai/flows/story-analyzer';
import { getRelationshipCoachAdvice } from '@/ai/flows/relationship-coach';
import { generateNewLine } from '@/ai/flows/line-generator';
import { generateAllNewLines } from '@/ai/flows/all-lines-generator';

// Generic error handler for AI flows
async function handleFlowError(error: any) {
    let errorMessage = "An unexpected error occurred. Please try again later.";
    let statusCode = 500;

    if (typeof error.message === 'string') {
        if (error.message.includes('API key not valid')) {
            errorMessage = "There is an issue with the server configuration. Please contact support.";
            statusCode = 500;
        } else if (error.message.includes('quota')) {
            errorMessage = "The AI assistant is currently very busy. Please try again in a few moments.";
            statusCode = 429;
        } else if (error.message.includes('fetch failed') || error.message.includes('network')) {
            errorMessage = "Could not connect to the AI service. Please check your internet connection and try again.";
            statusCode = 503;
        } else if (error.message.includes('invalid response')) {
            errorMessage = "The AI returned an unexpected response. Please try again later.";
            statusCode = 502;
        } else if (error.status === 400) {
            errorMessage = "Invalid input provided to the AI model.";
            statusCode = 400;
        }
    }
    console.error(`AI Flow Error: ${errorMessage}`, error);
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { flow, payload } = body;
    let result;

    switch (flow) {
      case 'comment':
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
      case 'allNewLines':
        result = await generateAllNewLines();
        break;
      default:
        return NextResponse.json({ error: 'Invalid flow type provided.' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return handleFlowError(error);
  }
}