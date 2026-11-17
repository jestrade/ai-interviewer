import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib";
import { User } from "@/contexts/auth/types";
import { InterviewerIcon } from "./interviewer-icon";
import { Message } from "./types";

export const MessageBubble = ({ message, user }: { message: Message; user: User }) => {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar className="w-8 h-8 mt-1">
        {isUser ? (
          <>
            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.name?.[0]}
            </AvatarFallback>
          </>
        ) : (
          <div className="w-full h-full bg-primary flex items-center justify-center">
            <InterviewerIcon />
          </div>
        )}
      </Avatar>

      <div className={cn("flex flex-col max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-lg px-4 py-3",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card text-card-foreground border border-border/50"
          )}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};

export const TypingIndicator = () => (
  <div className="flex gap-3 animate-fade-in" aria-label="The interviewer is typing">
    <Avatar className="w-8 h-8 mt-1">
      <div className="w-full h-full bg-primary flex items-center justify-center">
        <InterviewerIcon />
      </div>
    </Avatar>
    <div className="bg-card rounded-lg px-4 py-3 border border-border/50">
      <div className="flex gap-1">
        {[0, 150, 300].map((delay) => (
          <div
            key={delay}
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
);
