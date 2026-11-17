import { BotMessageSquare, Mic } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn, getRoleName } from "@/lib";

export const ChatHeader = ({ role, isTyping }: { role: string; isTyping: boolean }) => (
  <div className="bg-card border-b border-border/50 py-8">
    <div className="max-w-5xl mx-auto px-4 flex flex-col items-center">
      <div className="relative">
        <Avatar
          className={cn(
            "w-32 h-32 border-4 border-primary/30",
            isTyping && "animate-pulse"
          )}
        >
          <div className="w-full h-full bg-primary flex items-center justify-center">
            <BotMessageSquare className="w-16 h-16 text-primary-foreground" strokeWidth={1.75} aria-hidden="true" />
          </div>
        </Avatar>
        {isTyping && (
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center animate-bounce">
            <Mic className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>
      <h2 className="mt-4 text-xl font-semibold text-foreground">AI Interviewer</h2>
      <p className="text-sm text-muted-foreground">
        Ready to assess your skills for the{" "}
        <span className="font-bold">{getRoleName(role)}</span> role
      </p>
    </div>
  </div>
);
