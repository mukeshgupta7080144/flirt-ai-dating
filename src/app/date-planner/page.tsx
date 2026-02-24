import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Bot } from "lucide-react";

export default function DatePlannerPage() {
    return (
        <div className="flex flex-1 flex-col">
            <PageHeader title="AI Date Planner" />
            <div className="flex flex-1 items-center justify-center p-4">
              <Card className="w-full max-w-lg">
                <CardHeader>
                  <CardTitle>Plan the Perfect Date</CardTitle>
                  <CardDescription>Let our AI help you craft an unforgettable experience.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="vibe">What's the vibe?</Label>
                    <Select>
                      <SelectTrigger id="vibe">
                        <SelectValue placeholder="Select a vibe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="romantic">Romantic & Intimate</SelectItem>
                        <SelectItem value="casual">Casual & Fun</SelectItem>
                        <SelectItem value="adventurous">Adventurous & Outdoors</SelectItem>
                        <SelectItem value="foodie">Foodie Experience</SelectItem>
                        <SelectItem value="cozy">Cozy Night In</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget</Label>
                    <Slider defaultValue={[50]} max={100} step={1} id="budget" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>$</span>
                      <span>$$$$</span>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Bot className="mr-2" />
                    Generate Ideas
                  </Button>
                </CardContent>
              </Card>
            </div>
        </div>
    );
}
