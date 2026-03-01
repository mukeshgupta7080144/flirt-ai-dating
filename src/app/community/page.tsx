"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wand2, Loader, Copy } from "lucide-react";

import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAds } from "@/providers/AdProvider";
import { useLanguage } from "@/hooks/useLanguage";
import { uiTranslations } from "@/lib/translations";
// 🔐 मास्टर API क्लाइंट को यहाँ इम्पोर्ट किया
import { callAI } from "@/lib/api-client";

const commentFormSchema = z.object({
  photoDescription: z
    .string()
    .min(10, { message: "Please describe the photo in at least 10 characters." }),
});

type CommentState = {
  result?: {
    funny: string;
    respectful: string;
    short: string;
  };
  error?: string;
};

function SubmitButton({
  isPending,
  buttonText,
  loadingText,
}: {
  isPending: boolean;
  buttonText: string;
  loadingText: string;
}) {
  return (
    <Button
      type="submit"
      disabled={isPending}
      className="w-full bg-primary h-12 text-base font-bold"
    >
      {isPending ? (
        <>
          <Loader className="mr-2 size-5 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          <Wand2 className="mr-2 size-5" />
          {buttonText}
        </>
      )}
    </Button>
  );
}

const ResultCard = ({
  titleKey,
  localizedTitle,
  text,
  onCopy,
}: {
  titleKey: string;
  localizedTitle: string;
  text: string;
  onCopy: (text: string) => void;
}) => {
  const emojiMap: Record<string, string> = {
    funny: "🤣",
    respectful: "😇",
    short: "✨",
  };

  return (
    <div className="relative rounded-2xl bg-white/60 p-4 shadow-md backdrop-blur-sm border border-white/20">
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-8">
          <h4 className="font-bold text-gray-800">
            {emojiMap[titleKey]} {localizedTitle}
          </h4>
          <p className="mt-1 text-gray-700 text-lg">{text}</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-9 w-9"
          onClick={() => onCopy(text)}
        >
          <Copy className="size-5 text-gray-500" />
        </Button>
      </div>
    </div>
  );
};

export default function CommentGeneratorPage() {
  const { toast } = useToast();
  const { showBanner, hideBanner, showInterstitialAd } = useAds();
  const { language } = useLanguage();
  const content = useMemo(() => uiTranslations[language], [language]);

  const [state, setState] = useState<CommentState>({});
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: { photoDescription: "" },
  });

  // Banner Ad
  useEffect(() => {
    showBanner();
    return () => hideBanner();
  }, [showBanner, hideBanner]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: content.toastCopiedTitle,
      description: content.toastCopiedDescription,
    });
  };

  const onSubmit = async (data: z.infer<typeof commentFormSchema>) => {
    setIsPending(true);
    setState({});

    try {
      // ✅ पुराने fetch को हटाकर मास्टर callAI लगाया (Key अपने आप चली जाएगी)
      const resData = await callAI("comment", {
        photoDescription: data.photoDescription,
        language,
      });

      if (resData.error) {
        toast({
          variant: "destructive",
          title: content.toastErrorTitle || "Error",
          description: resData.error,
        });
        setState({ error: resData.error });
      } else if (resData.result) {
        setState({ result: resData.result });
        form.reset();

        try {
          showInterstitialAd?.();
        } catch (e) {
          console.warn("Ad failed:", e);
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: error.message || "Please check your internet connection.",
      });
      setState({ error: "Network Error" });
    }

    setIsPending(false);
  };

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-gray-50 to-pink-50">
      <PageHeader title={content.commentPageTitle || "Smart Comment Generator"} />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
        <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-2xl bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold font-playfair text-gray-800">
              {content.commentTitleL1}
              <br />
              {content.commentTitleL2}
            </CardTitle>
            <CardDescription className="text-center">
              {content.commentDesc}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="photoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        {content.commentFormLabel || "Describe the photo"}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={content.commentPlaceholder}
                          className="min-h-[120px] rounded-xl text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <SubmitButton
                  isPending={isPending}
                  buttonText={content.commentBtn}
                  loadingText={content.commentLoading}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        {state.result && (
          <div className="w-full max-w-2xl mx-auto mt-8 space-y-4">
            <h3 className="text-xl font-bold text-center text-gray-800">
              {content.commentResultsTitle}
            </h3>

            <ResultCard
              titleKey="funny"
              localizedTitle={content.commentFunny}
              text={state.result.funny}
              onCopy={handleCopy}
            />

            <ResultCard
              titleKey="respectful"
              localizedTitle={content.commentRespectful}
              text={state.result.respectful}
              onCopy={handleCopy}
            />

            <ResultCard
              titleKey="short"
              localizedTitle={content.commentShort}
              text={state.result.short}
              onCopy={handleCopy}
            />
          </div>
        )}
      </main>
    </div>
  );
}