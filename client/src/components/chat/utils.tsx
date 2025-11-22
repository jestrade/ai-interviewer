import { useCallback } from "react";
import { speakText } from "@/lib";
import { Message } from "./types";

export const buildUserMessage = ({
  role,
  content,
}: {
  role: string;
  content: string;
}) => {
  return {
    id: Date.now().toString(),
    role,
    content,
    timestamp: new Date(),
    played: true,
  };
};

export const useProcessAIResponse = () => {
  return useCallback(async (responseText: string) => {
    const textToUse =
      responseText || "I'm processing your response. Please give me a moment.";

    const aiMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: textToUse,
      timestamp: new Date(),
      played: true,
    };

    // Add a small delay to ensure the message is rendered before speaking
    setTimeout(() => {
      speakText(textToUse);
    }, 100);

    return aiMessage;
  }, []);
};

export const useProcessVoiceInput = () => {
  return useCallback(async (transcription: string) => {
    return buildUserMessage({
      role: "user",
      content: transcription,
    }) as Message;
  }, []);
};
