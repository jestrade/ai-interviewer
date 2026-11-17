import { Loader2, Lock, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/contexts/auth/hooks";
import GoogleLogo from "@/assets/img/google-logo.svg";

/** Separate entry point for the administrator: no role, no interview session. */
const AdminLogin = () => {
  const { isLoading, signInAsAdmin } = useAuth();

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <aside className="hidden lg:flex flex-col justify-between bg-[hsl(210_29%_24%)] text-[hsl(192_15%_94%)] p-12">
        <div className="flex items-center gap-3 text-lg font-bold">
          <ShieldCheck className="w-7 h-7 text-[hsl(168_76%_42%)]" aria-hidden="true" />
          AI Interviewer
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black">Admin console</h2>
          <p className="text-[hsl(204_12%_70%)] max-w-sm">
            Invite people, revoke access and follow how each person is practicing.
          </p>
        </div>
        <p className="text-sm text-[hsl(204_12%_70%)]">Restricted area</p>
      </aside>

      <main className="relative flex items-center justify-center p-6">
        <ThemeToggle className="absolute top-4 right-4" />

        <div className="w-full max-w-sm space-y-6 animate-fade-in">
          <div className="space-y-2 text-center lg:text-left">
            <div className="mx-auto lg:mx-0 w-14 h-14 rounded-xl bg-[hsl(210_29%_24%)] text-[hsl(168_76%_42%)] flex items-center justify-center">
              <Lock className="w-7 h-7" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-black text-foreground">Admin sign in</h1>
            <p className="text-muted-foreground">
              Use the Google account of the administrator.
            </p>
          </div>

          <Button
            onClick={signInAsAdmin}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 bg-card"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <img src={GoogleLogo} alt="" className="w-5 h-5" />}
            Sign in with Google
          </Button>

          <Button asChild variant="ghost" className="w-full text-muted-foreground">
            <Link to="/">
              <ArrowLeft />
              Back to interview sign in
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
