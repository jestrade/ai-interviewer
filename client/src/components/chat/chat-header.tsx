import { BotMessageSquare, Mic } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarPanel } from "@/components/avatar/avatar-panel";
import { cn, getRoleName } from "@/lib";

/** The robot badge, shown when the 3D avatar can not run. */
const BadgeFigure = ({ isTyping }: { isTyping: boolean }) => (
  <div className="relative">
    <Avatar className={cn("w-24 h-24 border-4 border-primary/30", isTyping && "animate-pulse")}>
      <div className="w-full h-full bg-primary flex items-center justify-center">
        <BotMessageSquare className="w-12 h-12 text-primary-foreground" strokeWidth={1.75} aria-hidden="true" />
      </div>
    </Avatar>
    {isTyping && (
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center animate-bounce">
        <Mic className="w-4 h-4 text-primary-foreground" />
      </div>
    )}
  </div>
);

export const ChatHeader = ({ role, isTyping }: { role: string; isTyping: boolean }) => (
  <div className="bg-card border-b border-border/50 py-4">
    <div className="max-w-5xl mx-auto px-4 flex flex-col items-center">
      <AvatarPanel fallback={<BadgeFigure isTyping={isTyping} />} />
      <h2 className="mt-3 text-lg font-semibold text-foreground">AI Interviewer</h2>
      <p className="text-sm text-muted-foreground">
        Ready to assess your skills for the{" "}
        <span className="font-bold">{getRoleName(role)}</span> role
      </p>
    </div>
  </div>
);
