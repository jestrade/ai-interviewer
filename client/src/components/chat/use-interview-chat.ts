import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { INTERVIEW_END_CODE } from "@/lib/constants";
import { interruptSpeech, speakText } from "@/lib";
import { useInterviewApi } from "@/services/api";
import { notifyError } from "@/services/sentry";
import { Message } from "./types";

const INITIAL_MESSAGE = "Start conversation";

const createMessage = (role: Message["role"], content: string): Message => ({
  id: crypto.randomUUID(),
  role,
  content,
  timestamp: new Date(),
});

/** Owns the conversation state and the round trips to the interviewer. */
export const useInterviewChat = () => {
  const { toast } = useToast();
  const { sendMessage } = useInterviewApi();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const started = useRef(false);

  const ask = useCallback(
    async (text: string) => {
      setIsWaiting(true);
      interruptSpeech();
      try {
        const result = await sendMessage.mutateAsync(text);

        if (result.code === INTERVIEW_END_CODE) {
          setIsEnded(true);
          toast({
            title: "Interview ended",
            description: "Please log out to start a new interview",
            duration: 10000,
          });
        }

        if (result.text) {
          setMessages((prev) => [...prev, createMessage("assistant", result.text)]);
          speakText(result.text);
        }
      } catch (error) {
        notifyError("Error sending message:" + error);
        toast({
          title: "Something went wrong",
          description: "The message could not be sent. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsWaiting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sendMessage.mutateAsync, toast]
  );

  const send = useCallback(
    (text: string) => {
      const content = text.trim();
      if (!content) return;
      setMessages((prev) => [...prev, createMessage("user", content)]);
      return ask(content);
    },
    [ask]
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    ask(INITIAL_MESSAGE);
    return interruptSpeech;
  }, [ask]);

  return { messages, isWaiting, isEnded, send };
};
