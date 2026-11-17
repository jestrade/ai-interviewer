import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth/hooks";
import config from "@/config";
import Logo from "@/assets/img/logo.svg";
import GoogleLogo from "@/assets/img/google-logo.svg";
import LoginButton from "./login-button";
import { RoleSelect } from "./role-select";

const Auth = () => {
  const { isLoading, signInWithGoogle, signInWithDevMode } = useAuth();
  const [role, setRole] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="absolute inset-0 bg-gradient-primary opacity-5" />

      <Card className="w-full max-w-md relative animate-fade-in shadow-medium border-border/50">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-soft">
            <img src={Logo} alt="logo" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Interview Practice
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to start your AI-powered interview session
          </CardDescription>
        </CardHeader>

        <RoleSelect onChange={setRole} />

        <CardContent className="space-y-4">
          <LoginButton
            isLoading={isLoading}
            signInFunction={signInWithGoogle}
            role={role}
            text="Continue with Google"
            logo={GoogleLogo}
          />
          {config.mode.isDevelopment && (
            <LoginButton
              isLoading={isLoading}
              signInFunction={signInWithDevMode}
              role={role}
              text="Continue with fake login (only dev mode)"
              logo={Logo}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
