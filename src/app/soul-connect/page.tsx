"use client";

import Link from 'next/link';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, MessageSquare, HeartHandshake } from "lucide-react";

const topics = [
  {
    icon: HeartHandshake,
    title: "Relationship Tips",
    description: "Build a stronger bond with expert advice on communication and trust.",
    color: "text-green-500",
    href: "/soul-connect/relationship-tips",
  },
  {
    icon: MessageSquare,
    title: "Conversation Starters",
    description: "Never run out of things to talk about with these engaging questions.",
    color: "text-blue-500",
    href: "/soul-connect/conversation-starters",
  },
  {
    icon: BrainCircuit,
    title: "Understanding Moods",
    description: "Learn to navigate emotional landscapes and support your partner.",
    color: "text-purple-500",
    href: "/soul-connect/understanding-moods",
  },
];

export default function SoulConnectPage() {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50">
      <PageHeader title="Soul Connect" />
      <div className="flex-1 space-y-8 p-4 md:p-6">
        <div className="text-center max-w-2xl mx-auto">
          <BrainCircuit className="mx-auto size-12 text-indigo-500" />
          <h2 className="mt-4 text-3xl font-bold text-indigo-800">Deepen Your Connection</h2>
          <p className="mt-2 text-muted-foreground">
            Explore the psychology of love, master communication, and build a bond that lasts a lifetime.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Link key={topic.title} href={topic.href} className="block">
                <Card className="text-center h-full transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden">
                  <CardHeader className="bg-white/50">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-white shadow-inner">
                      <Icon className={`size-8 ${topic.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-4">
                    <CardTitle className="text-xl mb-2">{topic.title}</CardTitle>
                    <CardDescription>{topic.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
