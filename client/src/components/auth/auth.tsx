import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth/hooks";
import { ROLE_LABELS } from "@/lib/constants";
import { SelectGroup } from "@radix-ui/react-select";
import config from "@/config";
import LoginButton from "./login-button";
import Logo from "@/assets/img/logo.svg";
import GoogleLogo from "@/assets/img/google-logo.svg";
import { useAuthApi } from "@/services/api";

const Auth = () => {
  const { user, isLoading, signInWithGoogle, signInWithDevMode } = useAuth();
  const [role, setRole] = useState<string>("");
  const navigate = useNavigate();

  const { wakeup } = useAuthApi();

  useEffect(() => {
    if (user) {
      navigate("/private/chat");
    }
  }, [user, navigate]);

  useEffect(() => {
    wakeup.mutateAsync();
  }, []);

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

        <p className="text-sm text-muted-foreground text-center mb-2 p-4">
          Select the role you are applying for:
          <Select onValueChange={(value) => setRole(value)}>
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                  Engineering Roles
                </div>
                {Object.entries(ROLE_LABELS.engineering).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectGroup>
              <SelectGroup>
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                  Project & Program Management
                </div>
                {Object.entries(ROLE_LABELS.management).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectGroup>
              <SelectGroup>
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                  Leadership & Executive
                </div>
                {Object.entries(ROLE_LABELS.leadership).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </p>

        <CardContent className="space-y-4">
          <LoginButton
            isLoading={isLoading}
            signInFunction={signInWithGoogle}
            role={role}
            text={"Continue with Google"}
            logo={GoogleLogo}
          />
          {config.mode.isDevelopment ? (
            <LoginButton
              isLoading={isLoading}
              signInFunction={signInWithDevMode}
              role={role}
              text={"Continue with fake login (only dev mode)"}
              logo={Logo}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
