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
    <div className="container flex md:flex-row flex-col p-8 gap-8 sm:grid-cols-2">
      <div className="items-center sm:items-start">
        <AvatarCanvas model={model?.model as string} />
      </div>
      <div className="flex flex-col gap-4 w-full">
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
                  <FormLabel>Ask Question</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>Ask a question to the agent</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full p-2 cursor-pointer"
              disabled={isLoading || isLoadingStream || isSpeaking}
            >
              {isLoading ? (
                <div className="flex items-center flex-row">
                  <span>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  </span>
                  <span>Thinking...</span>
                </div>
              ) : isLoadingStream ? (
                <div className="flex items-center flex-row">
                  <span>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  </span>
                  <span>Loading audio...</span>
                </div>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>
        {isLoading && <Skeleton className="h-[400px] w-full" />}
        {safeHtmlContent && (
          <article className="prose lg:prose-lg p-4">
            <div dangerouslySetInnerHTML={{ __html: safeHtmlContent }} />
          </article>
        )}
      </div>
    </div>
  );
}
