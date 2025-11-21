import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/contexts/auth/AuthContext";
import { Loader2 } from "lucide-react";
import Logo from "@/assets/img/logo.svg";

const Auth = () => {
  const { user, isLoading, signInWithGoogle } = useAuth();
  const [role, setRole] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/chat");
    }
  }, [user, navigate]);

  const handleSelectRole = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(event.target.value);
  };

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

        <CardContent className="space-y-4">
          <Button
            onClick={() => signInWithGoogle(role)}
            disabled={isLoading || !role}
            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-border shadow-sm transition-all duration-300 hover:shadow-soft"
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center pt-2">
            Select the role you are applying for:
            <Select onValueChange={(value) => setRole(value)}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="junior-software-engineer">
                  Junior Software Engineer
                </SelectItem>
                <SelectItem value="mid-software-engineer">
                  Mid-Level Software Engineer
                </SelectItem>
                <SelectItem value="senior-software-engineer">
                  Senior Software Engineer
                </SelectItem>
                <SelectItem value="staff-software-engineer">
                  Staff Software Engineer
                </SelectItem>
              </SelectContent>
            </Select>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
