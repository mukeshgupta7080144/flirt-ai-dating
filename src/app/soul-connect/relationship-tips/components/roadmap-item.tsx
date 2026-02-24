'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface RoadmapItemProps {
  icon: React.ElementType;
  title: string;
  tip: string;
  advice: string;
  actionText?: string;
  isLast?: boolean;
  isUnlocked: boolean;
  onApply: () => void;
  isApplied: boolean;
  iconColor: string;
}

export function RoadmapItem({
  icon: Icon,
  title,
  tip,
  advice,
  actionText,
  isLast = false,
  isUnlocked,
  onApply,
  isApplied,
  iconColor,
}: RoadmapItemProps) {
  return (
    <div className="relative flex items-start">
      <div className="flex flex-col items-center mr-4">
        <div className={cn("flex items-center justify-center size-12 rounded-full border-2", 
            isUnlocked ? "bg-white shadow-md border-gray-200" : "bg-gray-100 border-gray-200"
        )}>
          <Icon className={cn("size-6", isUnlocked ? iconColor : "text-gray-400")} />
        </div>
        {!isLast && (
          <div className="w-0.5 h-32 bg-gray-200 border-l-2 border-dashed border-gray-300 my-2" />
        )}
      </div>

      <div className={cn("flex-1 pt-2 transition-opacity", !isUnlocked && "opacity-50 blur-sm")}>
         <Accordion type="single" collapsible disabled={!isUnlocked}>
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="p-4 rounded-xl bg-white shadow-md data-[state=open]:rounded-b-none hover:no-underline [&[data-state=open]>svg]:text-primary">
                   <div className="text-left">
                        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                        <p className="text-sm text-muted-foreground">{tip}</p>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-white rounded-b-xl shadow-md space-y-4">
                    <p className="text-gray-600">{advice}</p>
                    {actionText && (
                        <div className="p-3 bg-secondary rounded-lg">
                            <p className="font-semibold text-secondary-foreground">{actionText}</p>
                        </div>
                    )}
                    <Button onClick={onApply} disabled={isApplied} className="w-full">
                        {isApplied ? (
                            <>
                                <Check className="mr-2"/>
                                Applied
                            </>
                        ) : "Mark as Applied"}
                    </Button>
                </AccordionContent>
            </AccordionItem>
         </Accordion>
      </div>
    </div>
  );
}
