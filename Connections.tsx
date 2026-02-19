import { useAuth } from "@/_core/hooks/useAuth";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, UserMinus } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Connections() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: following, refetch: refetchFollowing } = trpc.follows.getFollowing.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: followers } = trpc.follows.getFollowers.useQuery(
    undefined,
    { enabled: !!user }
  );

  const unfollowMutation = trpc.follows.unfollow.useMutation({
    onSuccess: () => {
      refetchFollowing();
    },
  });

  const handleUnfollow = async (userId: number) => {
    await unfollowMutation.mutateAsync({ userId });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view your connections</p>
          <Button onClick={() => setLocation("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <main className="container max-w-6xl py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Connections</h1>
          <p className="text-muted-foreground">
            Connect with fellow believers and build your spiritual community
          </p>
        </div>

        <Tabs defaultValue="following" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="following">
              Following ({following?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="followers">
              Followers ({followers?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="following" className="mt-6">
            {!following || following.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    You're not following anyone yet
                  </p>
                  <Button onClick={() => setLocation("/members")}>
                    Discover Members
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {following.map((member) => (
                  <Card key={member.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div
                          className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-3 cursor-pointer"
                          onClick={() => setLocation(`/user/${member.id}`)}
                        >
                          {member.profilePicture ? (
                            <img
                              src={member.profilePicture}
                              alt={member.name || "User"}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-gray-700">
                              {getInitials(member.name || "Anonymous")}
                            </span>
                          )}
                        </div>
                        
                        <h3
                          className="font-bold text-lg mb-1 cursor-pointer hover:text-primary"
                          onClick={() => setLocation(`/user/${member.id}`)}
                        >
                          {member.name || "Anonymous"}
                        </h3>
                        
                        {member.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{member.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <Calendar className="w-3 h-3" />
                          <span>Following since {formatDate(member.followedAt)}</span>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnfollow(member.id)}
                          disabled={unfollowMutation.isPending}
                          className="w-full"
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          Unfollow
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="followers" className="mt-6">
            {!followers || followers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No one is following you yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {followers.map((member) => (
                  <Card key={member.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div
                          className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-3 cursor-pointer"
                          onClick={() => setLocation(`/user/${member.id}`)}
                        >
                          {member.profilePicture ? (
                            <img
                              src={member.profilePicture}
                              alt={member.name || "User"}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-gray-700">
                              {getInitials(member.name || "Anonymous")}
                            </span>
                          )}
                        </div>
                        
                        <h3
                          className="font-bold text-lg mb-1 cursor-pointer hover:text-primary"
                          onClick={() => setLocation(`/user/${member.id}`)}
                        >
                          {member.name || "Anonymous"}
                        </h3>
                        
                        {member.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{member.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <Calendar className="w-3 h-3" />
                          <span>Following since {formatDate(member.followedAt)}</span>
                        </div>
                        
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setLocation(`/user/${member.id}`)}
                          className="w-full"
                        >
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
