"use client";
import AvatarCanvas from "@/components/avatar-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";

export default function AvatarPage({ avatarId }: { avatarId: string }) {
  const [text, setText] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lipSyncRef = useRef<boolean>(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const startSpeaking = () => {
    if (!text.trim()) return;

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    // create a new SpeechSynthesisUtterance instance
    utteranceRef.current = new SpeechSynthesisUtterance(text);

    // language setting
    utteranceRef.current.lang = "en-US";

    // event listener for when the speech starts
    utteranceRef.current.onstart = () => {
      console.log("Speech synthesis started");
      // emit speechStart event to start lip sync
      window.dispatchEvent(new CustomEvent("speechStart"));
    };

    // event listener for when the speech ends
    utteranceRef.current.onend = () => {
      console.log("Speech synthesis ended");
      setIsSpeaking(false);
      lipSyncRef.current = false;

      // emit speechEnd event to stop lip sync
      window.dispatchEvent(new CustomEvent("speechEnd"));
    };

    // set lip sync flag to true
    lipSyncRef.current = true;

    // set speaking flag to true
    setIsSpeaking(true);

    // emit lipSync event to start lip sync
    window.dispatchEvent(
      new CustomEvent("lipSync", {
        detail: { active: true, text: text },
      })
    );

    // wait for lip sync setup to complete before starting speech
    // this is a workaround to ensure that the lip sync setup is complete
    setTimeout(() => {
      // start speaking
      window.speechSynthesis.speak(utteranceRef.current!);
    }, 100);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    lipSyncRef.current = false;

    window.dispatchEvent(
      new CustomEvent("lipSync", {
        detail: { active: false },
      })
    );

    window.dispatchEvent(new CustomEvent("speechEnd"));
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="grid grid-cols-2 gap-4 items-center sm:items-start">
          <AvatarCanvas model={avatarId} />
          <div className="w-full flex flex-col gap-4">
            <Input
              placeholder="Enter text to speak"
              value={text}
              onChange={handleTextChange}
              className="w-full"
            />
            <div className="flex gap-2">
              <Button
                onClick={startSpeaking}
                className={`cursor-pointer ${
                  isSpeaking
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isSpeaking ? "Speaking" : "Speak"}
              </Button>
              {isSpeaking && (
                <Button
                  className="cursor-pointer"
                  onClick={stopSpeaking}
                  variant="outline"
                >
                  Stop
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
