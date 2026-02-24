import PageHeader from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Edit, Settings } from "lucide-react";

export default function ProfilePage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <PageHeader title="My Profile" />
            <div className="flex flex-col items-center gap-6 pt-8">
                <Card className="w-full max-w-sm text-center p-6">
                    <Avatar className="h-28 w-28 mb-4 mx-auto">
                        <AvatarImage src="https://i.pravatar.cc/150?u=jessica" alt="User" />
                        <AvatarFallback>J</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-3xl">Jessica</CardTitle>
                    <CardDescription className="mb-6">jessica@email.com</CardDescription>
                    
                    <CardContent className="flex flex-col gap-3">
                         <Button variant="outline">
                            <Edit className="mr-2"/>
                            Edit Profile
                        </Button>
                         <Button>
                            <Crown className="mr-2 text-yellow-400"/>
                            Upgrade to Premium
                        </Button>
                        <Button variant="ghost">
                            <Settings className="mr-2"/>
                            Settings
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
