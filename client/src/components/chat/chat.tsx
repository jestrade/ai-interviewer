import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/hooks";
import { AvatarPanel } from "@/components/avatar/avatar-panel";
import { AvatarProvider } from "@/components/avatar/avatar-provider";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { InterviewEndedPanel } from "./interview-ended-panel";
import { MessageList } from "./message-list";
import { useInterviewChat } from "./use-interview-chat";

const ChatContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { messages, isWaiting, isEnded, send } = useInterviewChat();

  if (!user) return null;

  return (
    <>
      <ChatHeader role={user.role} isTyping={isWaiting} />
      <AvatarPanel />
      <MessageList messages={messages} isTyping={isWaiting} user={user} />
      {isEnded ? (
        <InterviewEndedPanel onShowFeedback={() => navigate("/feedback")} />
      ) : (
        <ChatInput disabled={isEnded} isWaiting={isWaiting} onSend={send} />
      )}
    </>
  );
};

const Chat = () => (
  <AvatarProvider>
    <ChatContent />
  </AvatarProvider>
);

export default Chat;
