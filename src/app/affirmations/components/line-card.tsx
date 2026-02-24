"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Heart, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface LineCardProps {
  line: string;
  usageTip: string;
}

export function LineCard({ line, usageTip }: LineCardProps) {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(line);
    toast({
      title: "Copied!",
      description: "Ready to share. 😉",
    });
  };

  const handleShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(line)}`;
    window.open(whatsappUrl, '_blank');
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites! ❤️",
    });
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg w-full">
      <CardContent className="flex items-start justify-between p-4">
        <div className="flex-1 pr-4">
          <p className="text-foreground/90 font-playfair text-lg">{line}</p>
          {usageTip && <p className="text-sm text-muted-foreground mt-2 italic">✨ {usageTip}</p>}
        </div>
        <div className="flex flex-col items-center gap-0 -mr-2 -mt-2">
          <Button variant="ghost" size="icon" onClick={toggleFavorite} aria-label="Favorite">
            <Heart className={cn("size-5", isFavorite ? "fill-pink-500 text-pink-500" : "text-muted-foreground")} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share on WhatsApp">
            <Send className="size-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy">
            <Copy className="size-5 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
