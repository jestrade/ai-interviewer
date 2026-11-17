import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { notifyError } from "@/services/sentry";

/** Requests microphone permission once and remembers whether it was granted. */
export const useMicrophone = () => {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);

  const request = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Permission is all we need here; recognition opens its own stream.
      stream.getTracks().forEach((track) => track.stop());
      setIsEnabled(true);
      toast({
        title: "Microphone enabled",
        description: "You can now use voice to communicate",
        duration: 1000,
      });
    } catch (error) {
      notifyError("Microphone access error:" + error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice features",
        variant: "destructive",
        duration: 1000,
      });
    }
  }, [toast]);

  return { isEnabled, request };
};
