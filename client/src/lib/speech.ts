const isSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

const PREFERRED_VOICE = /samantha|google us english|jenny|aria|zira|allison|ava|serena/i;

/** English (US) only, preferring a natural-sounding female voice when present. */
const pickEnglishVoice = (): SpeechSynthesisVoice | undefined => {
  const voices = window.speechSynthesis.getVoices();
  const usVoices = voices.filter((voice) => voice.lang.replace("_", "-") === "en-US");
  return (
    usVoices.find((voice) => PREFERRED_VOICE.test(voice.name)) ??
    usVoices[0] ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
  );
};

export interface SpeakHandlers {
  onStart?: () => void;
  /** Called at each word boundary with the character index in `text`. */
  onBoundary?: (charIndex: number) => void;
  /** Called when speech finishes, fails or is interrupted. */
  onEnd?: () => void;
}

/** Reads `text` aloud in en-US, cancelling any speech already in progress. */
export const speakText = (text: string, handlers: SpeakHandlers = {}) => {
  if (!text?.trim() || !isSupported()) {
    handlers.onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  const voice = pickEnglishVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.onstart = () => handlers.onStart?.();
  utterance.onboundary = (event) => handlers.onBoundary?.(event.charIndex);
  utterance.onend = () => handlers.onEnd?.();
  utterance.onerror = () => handlers.onEnd?.();
  window.speechSynthesis.speak(utterance);
};

export const interruptSpeech = () => {
  if (isSupported()) window.speechSynthesis.cancel();
};
