import { FormEvent, useState } from "react";
import { Loader2, Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMicrophone } from "@/hooks/use-microphone";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { notifyError } from "@/services/sentry";

export const ChatInput = ({
  disabled,
  isWaiting,
  onSend,
}: {
  disabled: boolean;
  isWaiting: boolean;
  onSend: (text: string) => void;
}) => {
  const [input, setInput] = useState("");
  const microphone = useMicrophone();
  const recognition = useSpeechRecognition(onSend);

  const toggleRecording = async () => {
    if (recognition.isListening) return recognition.stop();
    if (!microphone.isEnabled) return microphone.request();
    try {
      recognition.start();
    } catch (error) {
      notifyError("Recording failed:" + error);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const blocked = disabled || isWaiting || recognition.isListening;

  return (
    <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-3">
        {!microphone.isEnabled && (
          <div className="bg-muted/50 border border-border/50 rounded-lg p-3 flex items-center gap-3">
            <Mic className="w-5 h-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground flex-1">
              Enable your microphone to use voice responses
            </p>
            <Button
              onClick={microphone.request}
              variant="outline"
              size="sm"
              className="border-primary/50 hover:bg-primary/10"
            >
              Enable Mic
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-3">
          {recognition.isListening ? (
            <Button
              type="button"
              onClick={toggleRecording}
              className="h-12 px-6 bg-destructive hover:bg-destructive/90 animate-pulse"
            >
              <MicOff className="w-5 h-5 mr-2" />
              Stop Recording
            </Button>
          ) : (
            <Button
              type="button"
              onClick={toggleRecording}
              disabled={isWaiting || disabled}
              aria-label="Record answer"
              className="h-12 px-4 bg-secondary hover:opacity-90"
            >
              <Mic className="w-5 h-5" />
            </Button>
          )}

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              recognition.isListening
                ? "Recording... Click 'Stop Recording' when done"
                : "Type your response or use voice..."
            }
            className="flex-1 h-12 bg-background border-border/50 focus-visible:ring-primary"
            disabled={blocked}
          />

          <Button
            type="submit"
            disabled={!input.trim() || blocked}
            className="h-12 px-6 bg-primary hover:opacity-90"
          >
            {isWaiting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" aria-label="Send" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
