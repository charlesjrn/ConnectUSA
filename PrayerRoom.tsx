import { useAuth } from "@/_core/hooks/useAuth";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Heart, Send, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function PrayerRoom() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prayerRequest, setPrayerRequest] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Fetch prayer room messages with auto-refresh every 5 seconds
  const { data: prayers, refetch } = trpc.messages.byRoom.useQuery(
    { room: "prayer-requests" },
    {
      enabled: !!user,
      refetchInterval: 5000, // Auto-refresh every 5 seconds
    }
  );

  // Count unique active users
  const activeUsers = prayers
    ? new Set(prayers.map((p) => p.userId)).size
    : 0;

  const utils = trpc.useUtils();

  const sendPrayerMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      setPrayerRequest("");
      toast.success("Prayer request shared");
      utils.messages.byRoom.invalidate({ room: "prayer-requests" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to share prayer request");
    },
  });

  const prayForMutation = trpc.messages.like.useMutation({
    onSuccess: () => {
      toast.success("🙏 Praying with you");
      utils.messages.byRoom.invalidate({ room: "prayer-requests" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerRequest.trim()) return;

    sendPrayerMutation.mutate({
      content: prayerRequest,
      room: "prayer-requests",
      isAnonymous,
    });
  };

  const handlePray = (messageId: number) => {
    prayForMutation.mutate({ messageId });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <main className="container max-w-4xl py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                🙏 Live Prayer Room
              </h1>
              <p className="text-muted-foreground">
                Join fellow believers in real-time prayer and intercession
              </p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span className="font-medium">{activeUsers} praying</span>
            </div>
          </div>
        </div>

        {/* Prayer Request Form */}
        <Card className="p-6 mb-8 border-2 border-primary/20">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Share Your Prayer Request
                </label>
                <Textarea
                  value={prayerRequest}
                  onChange={(e) => setPrayerRequest(e.target.value)}
                  placeholder="Type your prayer request here... The community will pray with you."
                  className="min-h-[100px] resize-none"
                  maxLength={1000}
                />
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded"
                    />
                    Post anonymously
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {prayerRequest.length}/1000
                  </span>
                </div>
              </div>
              <Button
                type="submit"
                disabled={!prayerRequest.trim() || sendPrayerMutation.isPending}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendPrayerMutation.isPending ? "Sharing..." : "Share Prayer Request"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Prayer Requests Feed */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Active Prayer Requests</h2>
          
          {!prayers || prayers.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No prayer requests yet. Be the first to share!
              </p>
            </Card>
          ) : (
            prayers.map((prayer) => (
              <Card key={prayer.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {prayer.isAnonymous ? (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        🙏
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: "#D4AF37" }}
                      >
                        {prayer.userName?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-foreground">
                        {prayer.isAnonymous ? "Anonymous" : prayer.userName || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(prayer.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap break-words mb-4">
                      {prayer.content}
                    </p>
                    
                    {/* Pray Button */}
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePray(prayer.id)}
                        disabled={prayForMutation.isPending}
                        className="text-primary hover:text-primary/80"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        Praying ({prayer.viewCount || 0})
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
