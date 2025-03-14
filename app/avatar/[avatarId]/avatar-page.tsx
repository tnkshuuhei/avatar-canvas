"use client";
import AvatarCanvas from "@/components/avatar-canvas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ElevenLabsClient } from "elevenlabs";
import { models } from "@/utils/model";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;

const formSchema = z.object({
  question: z
    .string()
    .min(10, {
      message: "Question must be at least 10 characters long",
    })
    .max(50, {
      message: "Question must be at most 50 characters long",
    }),
});

const client = new ElevenLabsClient({
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!,
});

export default function AvatarPage({ avatarId }: { avatarId: string }) {
  const [text, setText] = useState<string>("");
  const [safeHtmlContent, setSafeHtmlContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoadingStream, setIsLoadingStream] = useState<boolean>(false);
  const model = models.find((model) => model.id === avatarId);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "How would you evaluate a project?",
    },
  });
  async function handleSubmit(formData: z.infer<typeof formSchema>) {
    setText("");
    setSafeHtmlContent("");

    const data = {
      text: formData.question,
      user_id: "test_user",
    };
    try {
      setIsLoading(true);
      const response = await fetch(
        `${endpoint}/personalities/${avatarId}/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();

      setText(result.text);
      setIsLoading(false);

      setIsLoadingStream(true);

      const audioStream = await client.textToSpeech.convertAsStream(
        model?.voice as string,
        {
          output_format: "mp3_44100_128",
          text: result.text,
          model_id: "eleven_multilingual_v2",
        }
      );

      const chunks: Buffer[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }
      const content = Buffer.concat(chunks);

      const blob = new Blob([content], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onplay = () => {
        console.log("Audio playback started");
        window.dispatchEvent(new CustomEvent("speechStart"));
        setIsSpeaking(true);

        window.dispatchEvent(
          new CustomEvent("lipSync", {
            detail: { active: true, text: result.text },
          })
        );
      };

      audio.onended = () => {
        console.log("Audio playback ended");
        window.dispatchEvent(new CustomEvent("speechEnd"));
        setIsSpeaking(false);

        window.dispatchEvent(
          new CustomEvent("lipSync", {
            detail: { active: false },
          })
        );

        URL.revokeObjectURL(url);
      };

      audio.play().catch((err) => {
        console.error("Failed to play audio", err);
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsLoadingStream(false);
    }
  }

  useEffect(() => {
    async function sanitizeHtml() {
      const rawHtml = await marked(text || "");
      const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "p",
          "a",
          "ul",
          "ol",
          "li",
          "strong",
          "em",
          "code",
          "pre",
          "blockquote",
        ],
        ALLOWED_ATTR: ["href"],
      });
      setSafeHtmlContent(sanitizedHtml);
    }
    sanitizeHtml();
  }, [text]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="w-full lg:w-2/5 flex justify-center">
          <div className="relative w-full max-w-sm h-auto aspect-square">
            <AvatarCanvas model={model?.model as string} />
          </div>
        </div>

        <div className="w-full lg:w-3/5 flex flex-col gap-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Ask Question
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-24 text-base p-3"
                        placeholder="Ask something..."
                      />
                    </FormControl>
                    <FormDescription className="text-sm">
                      Ask a question to the agent
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full p-3 text-base font-medium "
                disabled={isLoading || isLoadingStream || isSpeaking}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                ) : isLoadingStream ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Loading audio...</span>
                  </div>
                ) : isSpeaking ? (
                  <span>Speaking...</span>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-4 bg-white/5 rounded-lg">
            {isLoading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : safeHtmlContent ? (
              <div className="p-4 h-full overflow-y-auto max-h-96">
                <article className="prose prose-invert lg:prose-lg w-full">
                  <div dangerouslySetInnerHTML={{ __html: safeHtmlContent }} />
                </article>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Ask a question to see the response
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
