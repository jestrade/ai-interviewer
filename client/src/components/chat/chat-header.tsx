import { Mic } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn, getRoleName } from "@/lib";
import LaptopImage from "@/assets/img/laptop.svg";

export const ChatHeader = ({ role, isTyping }: { role: string; isTyping: boolean }) => (
  <div className="bg-card border-b border-border/50 py-8">
    <div className="max-w-5xl mx-auto px-4 flex flex-col items-center">
      <div className="relative">
        <Avatar
          className={cn(
            "w-32 h-32 border-4 border-primary/30 shadow-medium",
            isTyping && "animate-pulse"
          )}
        >
          <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
            <img src={LaptopImage} alt="Laptop" className="w-16 h-16" />
          </div>
        </Avatar>
        {isTyping && (
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center shadow-soft animate-bounce">
            <Mic className="w-4 h-4 text-white" />
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
