import { useState } from "react";
import { AvatarPanel } from "@/components/avatar/avatar-panel";
import { AvatarProvider } from "@/components/avatar/avatar-provider";
import { useAvatarSpeech, useAvatarStore } from "@/components/avatar/avatar-context";
import { EMOTIONS, Emotion } from "@/components/avatar/emotions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SAMPLE =
  "Hello, I'm your interviewer today. Tell me about a project you are proud of, and what made it challenging?";

const Lab = () => {
  const { say, stop } = useAvatarSpeech();
  const store = useAvatarStore();
  const [text, setText] = useState(SAMPLE);
  const [emotion, setEmotion] = useState<Emotion>("friendly");

  const choose = (name: Emotion) => {
    setEmotion(name);
    store?.setEmotion(name); // show it right away, without waiting for Speak
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Avatar lab (emulator only)</h1>
      <AvatarPanel />
      <Textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} />
      <div className="flex flex-wrap gap-2">
        {EMOTIONS.map((name) => (
          <Button
            key={name}
            size="sm"
            variant={name === emotion ? "default" : "outline"}
            onClick={() => choose(name)}
          >
            {name}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => say(text, emotion)}>Speak</Button>
        <Button variant="outline" onClick={stop}>
          Stop
        </Button>
      </div>
    </div>
  );
};

/** Try the avatar without Gemini. Only routed in emulator mode. */
const AvatarLab = () => (
  <AvatarProvider>
    <Lab />
  </AvatarProvider>
);

export default AvatarLab;
