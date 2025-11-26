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
      className="w-full h-12 bg-white text-gray-900 hover:bg-gray-50 hover:text-blue-300 border border-border shadow-sm transition-all duration-300 hover:shadow-soft hover:ring-2 hover:ring-blue-300/50 hover:ring-offset-[1px] cursor-pointer"
      variant="outline"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {logo && <img src={logo} alt="login logo" className="w-5 h-5 mr-3" />}
          {text}
        </>
      )}
    </Button>
  );
};

export default LoginButton;
