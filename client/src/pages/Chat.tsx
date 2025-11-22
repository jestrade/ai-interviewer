import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth/AuthContext";
import { Send, LogOut, Loader2, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import config from "@/config";
import { speakText } from "@/lib/utils";
import { notifyError } from "@/services/sentry";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  played: boolean;
}

const INITIAL_MESSAGE =
  "Hello! I'm your AI interviewer today. I'll be asking you questions to assess your skills and experience. Are you ready to begin?";

const Chat = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: INITIAL_MESSAGE,
      timestamp: new Date(),
      played: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessingARequest, setIsProcessingARequest] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setTimeout(() => {
      if (!messages[0].played) {
        speakText(messages[0].content);
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[0].played = true;
          return newMessages;
        });
      }
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSignOut = async () => {
    await logOut();
    navigate("/auth");
  };

  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsMicEnabled(true);
      toast({
        title: "Microphone enabled",
        description: "You can now use voice to communicate",
      });
      // Stop the stream immediately, we'll create a new one when recording
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice features",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    if (!isMicEnabled) {
      await requestMicrophoneAccess();
      return;
    }

    try {
      // -------------------------------
      // 1. Setup Web Speech Recognition
      // -------------------------------
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.warn("Web Speech API not supported");
      }

      let recognition = null;
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.continuous = true;

        recognition.onresult = async (event) => {
          const transcript =
            event.results[event.results.length - 1][0].transcript.trim();

          await processVoiceInput(transcript);

          setIsTyping(true);

          try {
            setIsProcessingARequest(false);
            const response = await fetch(`${config.api.url}/interview`, {
              method: "POST",
              body: JSON.stringify({ text: transcript }),
              headers: {
                "Content-Type": "application/json",
              },
            });

            if (!response.ok) {
              notifyError(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            await processAIResponse(data.text);
            speakText(data.text);
          } catch (error) {
            notifyError("Error sending audio or processing response:", error);
          } finally {
            setIsProcessingARequest(false);
            setIsTyping(false);
          }
        };

        recognition.onerror = (err) =>
          notifyError("Speech recognition error:", err);
      }

      // -------------------------------
      // 2. Setup MediaRecorder (Audio)
      // -------------------------------
      /*
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        stream.getTracks().forEach((track) => track.stop());

        // ---- stop speech recognition too ----
        if (recognition) recognition.stop();

        const formData = new FormData();
        formData.append("audio", audioBlob, "user_answer.webm");

        setIsTyping(true);

        try {
          setIsProcessingARequest(false);
          const response = await fetch(
            `${config.api.url}/interview`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            notifyError(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          await processAIResponse(data.text);
          speakText(data.text);
        } catch (error) {
          notifyError("Error sending audio or processing response:", error);
        } finally {
          setIsProcessingARequest(false);
        }

        setIsTyping(false);
      };

      // Start both: recorder + speech recognition
      mediaRecorder.start(); */
      if (recognition) recognition.start();

      setIsRecording(true);
      toast({
        title: "Recording...",
        description: "Speak your answer",
      });
    } catch (error) {
      notifyError("Recording failed:", error);
      toast({
        title: "Recording failed",
        description: "Could not start recording",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const processVoiceInput = async (transcription: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: transcription,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
  };

  const processAIResponse = async (userMessage: string) => {
    const aiMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: userMessage,
      timestamp: new Date(),
      played: true,
    };

    setMessages((prev) => [...prev, aiMessage]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      played: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      setIsProcessingARequest(true);

      const response = await fetch(`${config.api.url}/interview`, {
        method: "POST",
        body: JSON.stringify({ text: userMessage.content }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        notifyError(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      await processAIResponse(data.text);
      speakText(data.text);
    } catch (error) {
      notifyError("Error sending audio or processing response:", error);
    } finally {
      setIsProcessingARequest(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border/50 shadow-soft">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                AI Interviewer
              </h1>
              <p className="text-xs text-muted-foreground">
                Practice your interview skills
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {/* Desktop view: "Hello, {name}" on left */}
            <span className="hidden md:inline text-sm text-muted-foreground italic">
              <span className="font-serif">Hello, </span>
              {user.name}
            </span>

            {/* Mobile + Desktop avatar */}
            <div className="flex items-center gap-2">
              <Avatar className="w-9 h-9 border-2 border-primary/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>

              {/* Mobile-only username next to avatar */}
              <span className="md:hidden text-sm text-muted-foreground italic">
                {user.name}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="bg-card border-b border-border/50 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-primary/30 shadow-medium">
              <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </Avatar>
            {isTyping && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center shadow-soft animate-pulse">
                <Mic className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <h2 className="mt-4 text-xl font-semibold text-foreground">
            AI Interviewer
          </h2>
          <p className="text-sm text-muted-foreground">
            Ready to assess your skills
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-fade-in ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Avatar className="w-8 h-8 mt-1">
                {message.role === "assistant" ? (
                  <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                ) : (
                  <>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name[0]}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>

              <div
                className={`flex flex-col max-w-[80%] ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 shadow-soft transition-all duration-300 hover:shadow-medium ${
                    message.role === "user"
                      ? "bg-gradient-primary text-white"
                      : "bg-card text-card-foreground border border-border/50"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1 px-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <Avatar className="w-8 h-8 mt-1">
                <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </Avatar>
              <div className="bg-card rounded-2xl px-4 py-3 shadow-soft border border-border/50">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm shadow-soft">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-3">
            {!isMicEnabled && (
              <div className="bg-muted/50 border border-border/50 rounded-lg p-3 flex items-center gap-3">
                <Mic className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground flex-1">
                  Enable your microphone to use voice responses
                </p>
                <Button
                  onClick={requestMicrophoneAccess}
                  variant="outline"
                  size="sm"
                  className="border-primary/50 hover:bg-primary/10"
                >
                  Enable Mic
                </Button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-3">
              {isRecording ? (
                <Button
                  type="button"
                  onClick={stopRecording}
                  className="h-12 px-6 bg-destructive hover:bg-destructive/90 animate-pulse shadow-soft hover:shadow-medium"
                >
                  <MicOff className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={startRecording}
                  disabled={isTyping}
                  className="h-12 px-4 bg-secondary hover:opacity-90 shadow-soft transition-all duration-300 hover:shadow-medium"
                >
                  <Mic className="w-5 h-5" />
                </Button>
              )}

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isRecording
                    ? "Recording... Click 'Stop Recording' when done"
                    : "Type your response or use voice..."
                }
                className="flex-1 h-12 bg-background border-border/50 focus-visible:ring-primary transition-all duration-300"
                disabled={isTyping || isRecording || isProcessingARequest}
              />

              <Button
                type="submit"
                disabled={
                  !input.trim() ||
                  isTyping ||
                  isRecording ||
                  isProcessingARequest
                }
                className="h-12 px-6 bg-gradient-primary hover:opacity-90 shadow-soft transition-all duration-300 hover:shadow-medium"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
