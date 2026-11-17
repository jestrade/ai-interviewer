import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandMark } from "@/components/brand/brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/contexts/auth/hooks";
import GoogleLogo from "@/assets/img/google-logo.svg";
import LoginButton from "./login-button";
import { RoleSelect } from "./role-select";

const Auth = () => {
  const { isLoading, signInWithGoogle } = useAuth();
  const [role, setRole] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <ThemeToggle className="absolute top-4 right-4" />

      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-2">
          <BrandMark className="mx-auto w-16 h-16 rounded-xl mb-2" iconClassName="w-9 h-9" />
          <CardTitle className="text-3xl text-primary">AI Interview Practice</CardTitle>
          <CardDescription className="text-base">
            Sign in to start your AI-powered interview session
          </CardDescription>
        </CardHeader>

        <RoleSelect onChange={setRole} />

        <CardContent className="space-y-3">
          <LoginButton
            isLoading={isLoading}
            signInFunction={signInWithGoogle}
            role={role}
            text="Continue with Google"
            logo={GoogleLogo}
          />
          <Button asChild variant="ghost" className="w-full text-muted-foreground">
            <Link to="/admin/login">
              <ShieldCheck />
              Admin Login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
