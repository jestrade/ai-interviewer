import { Bot } from "lucide-react";
import { cn } from "@/lib";

export const InterviewerIcon = ({ className }: { className?: string }) => (
  <Bot className={cn("w-5 h-5 text-primary-foreground", className)} aria-hidden="true" />
);
