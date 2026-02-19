import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { Copy, Share2, Users, Award } from "lucide-react";
import { toast } from "sonner";

export default function Referrals() {
  const { data: stats, isLoading } = trpc.referrals.getMyStats.useQuery();
  const { data: leaderboard } = trpc.referrals.getLeaderboard.useQuery({ limit: 10 });
  const generateMutation = trpc.referrals.generateCode.useMutation();

  const handleGenerateCode = async () => {
    try {
      const result = await generateMutation.mutateAsync();
      toast.success("Referral code generated!");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to generate referral code");
    }
  };

  const getReferralLink = () => {
    if (!stats?.referralCode) return "";
    return `${window.location.origin}/login?ref=${stats.referralCode}`;
  };

  const copyLink = () => {
    const link = getReferralLink();
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied to clipboard!");
  };

  const shareLink = async () => {
    const link = getReferralLink();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Chosen Connect",
          text: "Join me on Chosen Connect - a community for believers to share testimonies, prayer requests, and connect with fellow Christians!",
          url: link,
        });
      } catch (error) {
        // User cancelled or share failed
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading referral stats...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Invite Friends</h1>
          <p className="text-muted-foreground">
            Share Chosen Connect with your friends and help grow our community of believers
          </p>
        </div>

        {/* Referral Link Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Your Referral Link
            </CardTitle>
            <CardDescription>
              Share this link with friends to invite them to join Chosen Connect
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.referralCode ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={getReferralLink()}
                    readOnly
                    className="flex-1 px-4 py-2 border rounded-md bg-muted text-sm"
                  />
                  <Button onClick={copyLink} variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={shareLink}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your referral code: <span className="font-mono font-semibold">{stats.referralCode}</span>
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">You don't have a referral code yet</p>
                <Button onClick={handleGenerateCode} disabled={generateMutation.isPending}>
                  {generateMutation.isPending ? "Generating..." : "Generate Referral Code"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Total Invites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats?.totalReferred || 0}</div>
              <p className="text-sm text-muted-foreground mt-1">
                People you've invited to join
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Active Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats?.activeReferred || 0}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Invites who joined and are active
              </p>
              {(stats?.activeReferred || 0) >= 5 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                  <Award className="w-4 h-4" />
                  <span className="font-semibold">Evangelist Badge Earned!</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Leaderboard</CardTitle>
            <CardDescription>
              Top community evangelists who have invited the most members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.userId}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-muted-foreground w-8">
                        #{index + 1}
                      </div>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={entry.profilePicture || undefined} />
                        <AvatarFallback>
                          {entry.userName?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{entry.userName}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.count} {entry.count === 1 ? "referral" : "referrals"}
                        </div>
                      </div>
                    </div>
                    {entry.count >= 5 && (
                      <Award className="w-6 h-6 text-amber-600" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No referrals yet. Be the first to invite friends!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
