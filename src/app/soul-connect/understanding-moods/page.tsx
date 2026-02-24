
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, UserCheck, Ear, Coffee } from "lucide-react";

const strategies = [
  {
    icon: HelpCircle,
    title: "The Gentle Inquiry",
    description: "Instead of assuming, ask a soft, open-ended question. This shows you've noticed a change and you care, without being pushy.",
    example: `"You seem a little quiet today. Everything okay?"`,
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  },
  {
    icon: UserCheck,
    title: "The Silent Support",
    description: "Sometimes, words aren't needed. Just being present can be the most powerful support. A simple hug or holding their hand can say more than a thousand words.",
    example: `Just sit with them and offer a comforting physical presence. Let them lead if they want to talk.`,
    color: "text-purple-500",
    bgColor: "bg-purple-50"
  },
  {
    icon: Ear,
    title: "The Active Listener",
    description: "If they do talk, listen to understand, not just to reply. Avoid offering immediate solutions. First, validate their feelings.",
    example: `They say: "I'm so stressed about work." You say: "It sounds like work has been really overwhelming for you lately."`,
    color: "text-green-500",
    bgColor: "bg-green-50"
  },
  {
    icon: Coffee,
    title: "The Small Gesture",
    description: "Small acts of kindness can significantly lift someone's mood. It shows you're thinking of them and want to make their life a little easier.",
    example: `Make them a cup of their favorite tea or coffee without them asking.`,
    color: "text-orange-500",
    bgColor: "bg-orange-50"
  },
];

export default function MoodReadingStrategyPage() {
    return (
        <div className="flex flex-1 flex-col bg-gradient-to-b from-gray-50 to-gray-100">
            <PageHeader title="Mood Reading Strategies" />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800">Become an Emotional Expert</h2>
                    <p className="mt-2 text-muted-foreground">
                        Understanding non-verbal cues and responding with empathy is a superpower. Learn how to read and react to your partner's moods.
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
