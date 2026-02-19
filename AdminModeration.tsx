import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Check, X, Loader2, Shield, Crown, Users, UserPlus, UserMinus } from "lucide-react";

export default function AdminModeration() {
  const [activeTab, setActiveTab] = useState<"pictures" | "memberships">("memberships");

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage members, memberships, and moderation</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-border pb-2">
          <Button
            variant={activeTab === "memberships" ? "default" : "ghost"}
            onClick={() => setActiveTab("memberships")}
            className="gap-2"
          >
            <Crown className="w-4 h-4" />
            Memberships
          </Button>
          <Button
            variant={activeTab === "pictures" ? "default" : "ghost"}
            onClick={() => setActiveTab("pictures")}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            Profile Pictures
          </Button>
        </div>

        {activeTab === "memberships" && <MembershipManagement />}
        {activeTab === "pictures" && <ProfilePictureModeration />}
      </div>
    </DashboardLayout>
  );
}

function MembershipManagement() {
  const { data: allMembers, isLoading } = trpc.users.getAllMembers.useQuery();
  const utils = trpc.useUtils();

  const grantMutation = trpc.membership.adminGrant.useMutation({
    onSuccess: () => {
      toast.success("Membership granted successfully");
      utils.users.getAllMembers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to grant membership");
    },
  });

  const revokeMutation = trpc.membership.adminRevoke.useMutation({
    onSuccess: () => {
      toast.success("Membership revoked");
      utils.users.getAllMembers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to revoke membership");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-sky-500" />
            Membership Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Grant or revoke Inner Circle memberships for users. Granted memberships do not require Stripe payment.
          </p>
        </CardHeader>
        <CardContent>
          {!allMembers || allMembers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No members found</p>
          ) : (
            <div className="divide-y divide-border">
              {allMembers.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: member.avatarBackgroundColor || "#3b82f6" }}
                    >
                      {member.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.name || "Unknown"}</span>
                        {member.role === "admin" && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Admin</span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{member.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-sky-600 border-sky-300 hover:bg-sky-50"
                      onClick={() => grantMutation.mutate({ userId: member.id, membershipType: "inner_circle" })}
                      disabled={grantMutation.isPending || revokeMutation.isPending}
                    >
                      <UserPlus className="w-3 h-3" />
                      Grant Inner Circle
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => revokeMutation.mutate({ userId: member.id })}
                      disabled={grantMutation.isPending || revokeMutation.isPending}
                    >
                      <UserMinus className="w-3 h-3" />
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfilePictureModeration() {
  const { data: pendingPictures, isLoading } = trpc.admin.getPendingProfilePictures.useQuery();
  const utils = trpc.useUtils();

  const approveMutation = trpc.admin.approveProfilePicture.useMutation({
    onSuccess: () => {
      toast.success("Profile picture approved");
      utils.admin.getPendingProfilePictures.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve");
    },
  });

  const rejectMutation = trpc.admin.rejectProfilePicture.useMutation({
    onSuccess: () => {
      toast.success("Profile picture rejected");
      utils.admin.getPendingProfilePictures.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!pendingPictures || pendingPictures.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Check className="w-12 h-12 mx-auto text-green-500 mb-3" />
          <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
          <p className="text-muted-foreground">
            No profile pictures pending review at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {pendingPictures.map((user) => (
        <Card key={user.id}>
          <CardHeader>
            <CardTitle className="text-lg">{user.name || "Unknown User"}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                className="flex-1"
                onClick={() => approveMutation.mutate({ userId: user.id })}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => rejectMutation.mutate({ userId: user.id })}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
