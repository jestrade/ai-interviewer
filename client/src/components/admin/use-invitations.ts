import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiFunctions } from "@/services/api";
import { notifyError } from "@/services/sentry";

const KEY = ["invitations"];

/** Invitee list plus the invite/revoke actions, kept in sync through the query cache. */
export const useInvitations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const list = useQuery({ queryKey: KEY, queryFn: apiFunctions.listInvitations });

  const onError = (title: string) => (error: unknown) => {
    notifyError(`${title}: ${error}`);
    toast({ title, description: "Please try again.", variant: "destructive" });
  };
  const refresh = () => queryClient.invalidateQueries({ queryKey: KEY });

  const invite = useMutation({
    mutationFn: apiFunctions.inviteUser,
    onSuccess: ({ created, email }) => {
      toast({
        title: created ? "Invitation added" : "Already invited",
        description: email ?? "",
      });
      return refresh();
    },
    onError: onError("Could not invite the user"),
  });

  const revoke = useMutation({
    mutationFn: apiFunctions.revokeInvitation,
    onSuccess: () => {
      toast({ title: "Invitation revoked" });
      return refresh();
    },
    onError: onError("Could not revoke the invitation"),
  });

  return { list, invite, revoke };
};
