import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const LoginButton = ({
  isLoading,
  signInFunction,
  role,
  text,
  logo,
}: {
  isLoading: boolean;
  signInFunction: (role: string) => void;
  role: string;
  text: string;
  logo?: string;
}) => {
  const handleClick = () => {
    signInFunction(role);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || !role}
      className="w-full h-12 bg-card text-foreground hover:bg-accent"
      variant="outline"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {logo && <img src={logo} alt="" className="w-5 h-5" />}
          {text}
        </>
      )}
    </Button>
  );
};

export default LoginButton;
