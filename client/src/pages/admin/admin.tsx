import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteForm } from "@/components/admin/invite-form";
import { InviteesTable } from "@/components/admin/invitees-table";
import { useInvitations } from "@/components/admin/use-invitations";

const Admin = () => {
  const { list, invite, revoke } = useInvitations();

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      <header className="bg-card border-b border-border/50 shadow-soft">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Admin</h1>
            <p className="text-xs text-muted-foreground">Invite people and follow their practice</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle>Invite a user</CardTitle>
              <CardDescription>Only invited Google accounts can sign in.</CardDescription>
            </CardHeader>
            <CardContent>
              <InviteForm isPending={invite.isPending} onInvite={invite.mutateAsync} />
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle>Invited users</CardTitle>
            </CardHeader>
            <CardContent>
              {list.isPending ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto my-8 text-primary" />
              ) : list.isError ? (
                <p className="text-sm text-destructive py-8 text-center">Could not load the invitations.</p>
              ) : (
                <InviteesTable invitees={list.data} onRevoke={revoke.mutate} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
