import { useCallback, useEffect, useRef, useState } from "react";
import { notifyError } from "@/services/sentry";

interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: unknown) => void) | null;
  start: () => void;
  stop: () => void;
}

type RecognitionConstructor = new () => Recognition;

const getRecognitionConstructor = (): RecognitionConstructor | undefined => {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

/**
 * Wraps the (vendor-prefixed) Web Speech API. `onTranscript` is called with
 * each final, non-empty transcript while listening.
 */
export const useSpeechRecognition = (
  onTranscript: (transcript: string) => void
) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<Recognition | null>(null);
  const handlerRef = useRef(onTranscript);
  handlerRef.current = onTranscript;

  const start = useCallback(() => {
    const Ctor = getRecognitionConstructor();
    if (Ctor) {
      const recognition = new Ctor();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = true;
      recognition.onresult = (event) => {
        const last = event.results[event.results.length - 1];
        const transcript = last[0].transcript.trim();
        if (transcript) handlerRef.current(transcript);
      };
      recognition.onerror = (error) =>
        notifyError("Speech recognition error:" + JSON.stringify(error));
      recognition.start();
      recognitionRef.current = recognition;
    }
    setIsListening(true);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  return { isListening, start, stop };
};
