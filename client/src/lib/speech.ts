const isSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

/** Reads `text` aloud, cancelling any speech already in progress. */
export const speakText = (text: string) => {
  if (!text?.trim() || !isSupported()) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9; // slightly slower for better comprehension
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
};

export const interruptSpeech = () => {
  if (isSupported()) window.speechSynthesis.cancel();
};
