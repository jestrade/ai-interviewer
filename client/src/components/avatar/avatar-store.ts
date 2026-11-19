import { interruptSpeech, speakText } from "@/lib";
import type { Emotion } from "./emotions";
import { SpeechTrack } from "./speech-track";

/**
 * Mutable state shared between the chat (which says things) and the 3D scene
 * (which draws them every frame). Kept outside React state on purpose: the
 * scene reads it at 60fps and must not trigger re-renders.
 */
export interface AvatarStore {
  readonly emotion: Emotion;
  readonly track: SpeechTrack | null;
  say(text: string, emotion: Emotion): void;
  stop(): void;
}

export const createAvatarStore = (): AvatarStore => {
  let emotion: Emotion = "neutral";
  let track: SpeechTrack | null = null;

  const finishCurrent = () => {
    track?.finish();
    track = null;
  };

  return {
    get emotion() {
      return emotion;
    },
    get track() {
      return track;
    },
    say(text, nextEmotion) {
      finishCurrent();
      emotion = nextEmotion;
      const current = new SpeechTrack(text);
      track = current;
      speakText(text, {
        onStart: () => current.start(),
        onBoundary: (charIndex) => current.boundary(charIndex),
        // An interrupted utterance reports its own end; ignore it if replaced.
        onEnd: () => {
          current.finish();
          if (track === current) track = null;
        },
      });
    },
    stop() {
      finishCurrent();
      interruptSpeech();
    },
  };
};
