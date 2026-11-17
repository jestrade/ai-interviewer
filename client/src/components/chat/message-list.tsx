import { useEffect, useRef } from "react";
import { User } from "@/contexts/auth/types";
import { MessageBubble, TypingIndicator } from "./message-bubble";
import { Message } from "./types";

export const MessageList = ({
  messages,
  isTyping,
  user,
}: {
  messages: Message[];
  isTyping: boolean;
  user: User;
}) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} user={user} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={endRef} />
      </div>
    </div>
  );
};
