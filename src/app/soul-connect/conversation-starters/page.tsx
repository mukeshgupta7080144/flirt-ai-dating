
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MessageSquareQuote, Users, Gamepad2 } from "lucide-react";

const strategies = [
  {
    icon: Eye,
    title: "The Observation Opener",
    description: "Notice something specific from their profile or a recent post and ask a genuine question about it.",
    example: `"I saw you were hiking at XYZ park! That's one of my favorite spots. What's your favorite trail there?"`,
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  },
  {
    icon: MessageSquareQuote,
    title: "The Story Reply",
    description: "Reply to one of their stories with an open-ended question that can't be answered with a simple 'yes' or 'no'.",
    example: `Story: *posts a picture of a coffee* -> Reply: "That looks amazing! What's the best cafe you've found in the city?"`,
    color: "text-purple-500",
    bgColor: "bg-purple-50"
  },
  {
    icon: Users,
    title: "The Common Ground",
    description: "Find a mutual interest, like a musician, movie, or hobby, and use it as a starting point.",
    example: `"I noticed you listen to [Artist Name]. Their new album is incredible, right? Which song is your favorite?"`,
    color: "text-green-500",
    bgColor: "bg-green-50"
  },
  {
    icon: Gamepad2,
    title: "The Playful Challenge",
    description: "Start with a light-hearted debate or a playful challenge. This creates a fun dynamic.",
    example: `"Controversial opinion: Pineapple on pizza is the best. Agree or disagree?"`,
    color: "text-orange-500",
    bgColor: "bg-orange-50"
  },
];

export default function ConversationStrategyPage() {
    return (
        <div className="flex flex-1 flex-col bg-gradient-to-b from-gray-50 to-gray-100">
            <PageHeader title="Conversation Strategies" />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800">Master the Art of Conversation</h2>
                    <p className="mt-2 text-muted-foreground">
                        Move beyond "Hi" and "Hello". Use these proven strategies to start engaging conversations that lead to deeper connections.
                    </p>
                </div>
                <div className="grid gap-6 max-w-2xl mx-auto">
                    {strategies.map((strategy, index) => {
                        const Icon = strategy.icon;
                        return (
                            <Card key={index} className="overflow-hidden transition-all hover:shadow-lg">
                                <CardHeader className={`flex flex-row items-center gap-4 p-4 ${strategy.bgColor}`}>
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                        <Icon className={`size-6 ${strategy.color}`} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{strategy.title}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-2">
                                    <p className="text-sm text-muted-foreground">{strategy.description}</p>
                                    <div className="p-3 bg-gray-100 rounded-md border border-gray-200">
                                        <p className="text-sm font-semibold text-gray-700 italic">{strategy.example}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </main>
        </div>
    );
}
