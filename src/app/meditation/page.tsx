import PageHeader from "@/components/page-header";
import { Music } from "lucide-react";

export default function MeditationPage() {
    return (
        <div className="flex flex-1 flex-col">
          <PageHeader title="Meditation Music" />
          <div className="flex flex-1 flex-col items-center justify-center text-center gap-4 p-4 md:gap-8 md:p-6">
              <div className="max-w-sm">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-blue-400/20 rounded-full">
                      <Music className="size-16 text-blue-500" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold">Coming Soon!</h2>
                  <p className="text-muted-foreground mt-2">
                    A peaceful sanctuary of calming music and guided meditations is being prepared for you.
                  </p>
              </div>
          </div>
        </div>
    );
}