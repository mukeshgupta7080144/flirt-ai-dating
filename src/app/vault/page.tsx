import PageHeader from "@/components/page-header";
import { Lock } from "lucide-react";

export default function VaultPage() {
    return (
        <div className="flex flex-1 flex-col">
          <PageHeader title="The Vault" />
          <div className="flex flex-1 flex-col items-center justify-center text-center gap-4 p-4 md:gap-8 md:p-6">
              <div className="max-w-sm">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-yellow-400/20 rounded-full">
                      <Lock className="size-16 text-yellow-500" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold">Coming Soon!</h2>
                  <p className="text-muted-foreground mt-2">
                    The Vault is a private and secure space for your most precious memories, notes, and plans. 
                    This premium feature is currently under lock and key.
                  </p>
              </div>
          </div>
        </div>
    );
}
