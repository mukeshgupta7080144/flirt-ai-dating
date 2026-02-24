"use client";

import { useState } from "react";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile, Frown, Meh, Laugh, Angry } from "lucide-react";

const moods = [
    { name: "Happy", icon: Laugh, color: "text-yellow-500" },
    { name: "Okay", icon: Smile, color: "text-green-500" },
    { name: "Neutral", icon: Meh, color: "text-gray-500" },
    { name: "Sad", icon: Frown, color: "text-blue-500" },
    { name: "Angry", icon: Angry, color: "text-red-500" },
]

export default function MoodJournalPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <PageHeader title="Mood Journal" />

            <div className="grid gap-8 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Your Emotional Calendar</CardTitle>
                        <CardDescription>Select a day to log your mood. See your patterns over time.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                         <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                        />
                    </CardContent>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Log Today&apos;s Mood</CardTitle>
                        <CardDescription>
                            {date ? `How are you feeling on ${date.toLocaleDateString()}?` : 'Select a date'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-center gap-4">
                        <div className="grid grid-cols-3 gap-4">
                            {moods.map(mood => (
                                <Button
                                    key={mood.name}
                                    variant={selectedMood === mood.name ? "default" : "outline"}
                                    className={`flex h-20 flex-col gap-2`}
                                    onClick={() => setSelectedMood(mood.name)}
                                >
                                    <mood.icon className={`size-8 ${mood.color}`} />
                                    <span>{mood.name}</span>
                                </Button>
                            ))}
                        </div>
                        <Button className="w-full mt-4">Save Mood</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
