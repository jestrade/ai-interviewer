import { createContext, useContext, useMemo } from "react";
import { interruptSpeech, speakText } from "@/lib";
import type { AvatarStore } from "./avatar-store";
import type { Emotion } from "./emotions";

export const AvatarContext = createContext<AvatarStore | null>(null);

export const useAvatarStore = () => useContext(AvatarContext);

/** What the chat uses to talk. Without a provider it just reads the text aloud. */
export const useAvatarSpeech = () => {
  const store = useContext(AvatarContext);
  return useMemo(
    () => ({
      say: (text: string, emotion: Emotion = "neutral") =>
        store ? store.say(text, emotion) : speakText(text),
      stop: () => (store ? store.stop() : interruptSpeech()),
    }),
    [store]
  );
};
