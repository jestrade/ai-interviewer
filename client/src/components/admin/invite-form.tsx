import { FormEvent, useState } from "react";
import { Loader2, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const InviteForm = ({
  isPending,
  onInvite,
}: {
  isPending: boolean;
  onInvite: (email: string) => Promise<unknown>;
}) => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) return;
    try {
      await onInvite(value);
      setEmail("");
    } catch {
      // The error toast is shown by the mutation; keep the input for a retry.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="person@example.com"
        aria-label="Email to invite"
        className="h-11 bg-background"
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending || !email.trim()} className="h-11 bg-primary">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal />}
        Invite
      </Button>
    </form>
  );
};
