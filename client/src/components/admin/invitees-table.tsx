import { CircleCheck, Clock, Hourglass, Mail, Repeat, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRoleName } from "@/lib";
import { Invitee } from "@/services/api";

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Never";

const inviteMailto = (email: string) => {
  const subject = encodeURIComponent("You're invited to AI Interviewer");
  const body = encodeURIComponent(
    `You have been invited to practice interviews.\n\nSign in with this Google account (${email}) at ${window.location.origin}`
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
};

const RevokeButton = ({ email, onRevoke }: { email: string; onRevoke: (email: string) => void }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="ghost" size="icon" aria-label={`Revoke ${email}`} className="hover:text-destructive">
        <Trash2 className="w-4 h-4" />
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Revoke access?</AlertDialogTitle>
        <AlertDialogDescription>
          {email} will no longer be able to sign in. Their interview history is kept.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={() => onRevoke(email)}>Revoke</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export const InviteesTable = ({
  invitees,
  onRevoke,
}: {
  invitees: Invitee[];
  onRevoke: (email: string) => void;
}) => {
  if (!invitees.length) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No invitations yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" aria-hidden="true" />Last access</span>
          </TableHead>
          <TableHead className="text-right">
            <span className="inline-flex items-center gap-1"><Repeat className="w-4 h-4" aria-hidden="true" />Attempts</span>
          </TableHead>
          <TableHead>Roles interviewed for</TableHead>
          <TableHead className="w-24" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitees.map((invitee) => (
          <TableRow key={invitee.email}>
            <TableCell>
              <div className="font-medium">{invitee.email}</div>
              {invitee.name && <div className="text-xs text-muted-foreground">{invitee.name}</div>}
            </TableCell>
            <TableCell>
              <Badge variant={invitee.lastAccessAt ? "default" : "secondary"} className="gap-1">
                {invitee.lastAccessAt ? <CircleCheck className="w-3 h-3" /> : <Hourglass className="w-3 h-3" />}
                {invitee.lastAccessAt ? "Active" : "Pending"}
              </Badge>
            </TableCell>
            <TableCell className="whitespace-nowrap">{formatDate(invitee.lastAccessAt)}</TableCell>
            <TableCell className="text-right">{invitee.attempts}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {invitee.roles.length ? (
                  invitee.roles.map(({ role, count }) => (
                    <Badge key={role} variant="outline">
                      {getRoleName(role) || role} ×{count}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <Button asChild variant="ghost" size="icon" aria-label={`Email ${invitee.email}`}>
                  <a href={inviteMailto(invitee.email)}>
                    <Mail className="w-4 h-4" />
                  </a>
                </Button>
                <RevokeButton email={invitee.email} onRevoke={onRevoke} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
