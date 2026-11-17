import { LogOut, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@/contexts/auth/types";
import { formatClock, useElapsedTimer } from "@/hooks/use-elapsed-timer";
import { BrandMark } from "@/components/brand/brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const AppHeader = ({
  user,
  onSignOut,
  onAdmin,
}: {
  user: User;
  onSignOut: () => void;
  onAdmin?: () => void;
}) => {
  const elapsed = useElapsedTimer();

  return (
    <header className="bg-card border-b border-border/50">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div>
            <h1 className="text-lg font-semibold text-foreground">AI Interviewer</h1>
            <p className="text-xs text-muted-foreground">Practice your interview skills</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
            {formatClock(elapsed)}
          </span>

          <span className="text-sm text-muted-foreground italic">
            <span className="hidden md:inline font-serif">Hello, </span>
            {user.name}
          </span>

          <Avatar className="w-9 h-9 border-2 border-primary/20">
            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.name?.[0]}
            </AvatarFallback>
          </Avatar>

          <ThemeToggle />

          {onAdmin && (
            <Button variant="outline" size="sm" onClick={onAdmin}>
              <ShieldCheck />
              Admin
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onSignOut}
            aria-label="Sign out"
            className="hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
