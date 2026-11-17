import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/app-header";
import Chat from "@/components/chat/chat";
import { useAuth } from "@/contexts/auth/hooks";
import { useInterviewApi } from "@/services/api";
import { notifyError } from "@/services/sentry";

const Private = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const { endInterview } = useInterviewApi();

  const handleSignOut = async () => {
    try {
      await endInterview.mutateAsync();
    } catch (error) {
      notifyError("Error ending interview:" + error);
    } finally {
      await logOut();
      navigate("/");
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      <AppHeader
        user={user}
        onSignOut={handleSignOut}
        onAdmin={user.isAdmin ? () => navigate("/admin") : undefined}
      />
      <Chat />
    </div>
  );
};

export default Private;
