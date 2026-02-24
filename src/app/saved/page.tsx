import PageHeader from "@/components/page-header";
import { Bookmark } from "lucide-react";

export default function SavedPage() {
    return (
        <div className="flex flex-1 flex-col">
          <PageHeader title="Saved Items" />
          <div className="flex flex-1 flex-col items-center justify-center text-center gap-4 p-4 md:gap-8 md:p-6">
              <div className="max-w-sm">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-green-400/20 rounded-full">
                      <Bookmark className="size-16 text-green-500" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold">Coming Soon!</h2>
                  <p className="text-muted-foreground mt-2">
                    A special place to keep all your favorite lines and inspirations is on its way.
                  </p>
              </div>
          </div>
        </div>
    );
}