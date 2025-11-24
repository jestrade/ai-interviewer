import { Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth/hooks";
import Chat from "../../components/chat/chat";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Private = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
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

      <Routes>
        <Route path="/" element={<Chat />} />
      </Routes>
    </div>
  );
};

export default Private;
