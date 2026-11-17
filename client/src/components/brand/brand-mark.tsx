import { BotMessageSquare } from "lucide-react";
import { cn } from "@/lib";

/** App logo: a flat rounded square with the interviewer glyph. */
export const BrandMark = ({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) => (
  <div
    className={cn(
      "w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center",
      className
    )}
  >
    <BotMessageSquare className={cn("w-6 h-6", iconClassName)} strokeWidth={2.25} aria-hidden="true" />
  </div>
);
