import { ArrowLeft, Loader2, LogOut, MailPlus, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteForm } from "@/components/admin/invite-form";
import { InviteesTable } from "@/components/admin/invitees-table";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { BrandMark } from "@/components/brand/brand-mark";
import { useAuth } from "@/contexts/auth/hooks";
import { useInvitations } from "@/components/admin/use-invitations";

const Admin = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const { list, invite, revoke } = useInvitations();

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      <header className="bg-card border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <BrandMark />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Admin console</h1>
            <p className="text-xs text-muted-foreground">Invite people and follow their practice</p>
          </div>
          {user?.role && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ArrowLeft />
                Interview
              </Link>
            </Button>
          )}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            className="hover:bg-destructive/10 hover:text-destructive"
            onClick={async () => {
              await logOut();
              navigate("/admin/login");
            }}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MailPlus className="w-5 h-5 text-primary" aria-hidden="true" />
                Invite a user
              </CardTitle>
              <CardDescription>Only invited Google accounts can sign in.</CardDescription>
            </CardHeader>
            <CardContent>
              <InviteForm isPending={invite.isPending} onInvite={invite.mutateAsync} />
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="w-5 h-5 text-primary" aria-hidden="true" />
                Invited users
              </CardTitle>
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
