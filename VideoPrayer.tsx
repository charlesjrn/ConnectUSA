import { useState } from "react";
import { Video, Plus, Users, X, Heart, Shield, Clock } from "lucide-react";
import { trpc } from "../lib/trpc";
import { useAuth } from "../_core/hooks/useAuth";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

export default function VideoPrayer() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");

  const { data: activeRooms = [], refetch } = trpc.videoRoom.getActive.useQuery(
    undefined,
    { refetchInterval: 10000 }
  );

  // Filter to only show 1:1 prayer rooms (maxParticipants === 2)
  const prayerRooms = activeRooms.filter(
    (room: any) =>
      room.maxParticipants === 2 &&
      room.roomName.toLowerCase().includes("prayer")
  );

  const createRoomMutation = trpc.videoRoom.create.useMutation({
    onSuccess: (data: { success: boolean; roomUrl: string }) => {
      toast.success("Prayer room created! Opening now...");
      setShowCreateDialog(false);
      setRoomName("");
      setDescription("");
      refetch();
      window.open(data.roomUrl, "_blank");
    },
    onError: () => {
      toast.error("Failed to create prayer room");
    },
  });

  const endRoomMutation = trpc.videoRoom.end.useMutation({
    onSuccess: () => {
      toast.success("Prayer room ended");
      refetch();
    },
    onError: () => {
      toast.error("Failed to end prayer room");
    },
  });

  const handleCreateRoom = () => {
    const name = roomName.trim() || "1:1 Prayer Session";
    createRoomMutation.mutate({
      roomName: `🙏 Prayer: ${name}`,
      description:
        description.trim() ||
        "A one-on-one video prayer session. Join to pray together.",
      maxParticipants: 2,
    });
  };

  const handleJoinRoom = (roomUrl: string) => {
    window.open(roomUrl, "_blank");
  };

  const handleEndRoom = (roomId: number) => {
    if (confirm("Are you sure you want to end this prayer room?")) {
      endRoomMutation.mutate({ id: roomId });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <main className="container max-w-4xl py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              🙏 1:1 Video Prayer
            </h1>
            <p className="text-muted-foreground">
              Connect one-on-one with a fellow believer for personal prayer
            </p>
          </div>
          {user && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Start Prayer Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start a 1:1 Prayer Room</DialogTitle>
                  <DialogDescription>
                    Create a dedicated video room for one-on-one prayer with
                    another believer. Only 2 people can join.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="prayerRoomName">
                      Prayer Topic (optional)
                    </Label>
                    <Input
                      id="prayerRoomName"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="e.g. Healing prayer, Guidance, Encouragement"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prayerDescription">
                      What would you like prayer for? (optional)
                    </Label>
                    <Textarea
                      id="prayerDescription"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Share a brief note so your prayer partner knows how to pray with you..."
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={createRoomMutation.isPending}
                    className="w-full"
                  >
                    {createRoomMutation.isPending
                      ? "Creating..."
                      : "Create & Join Prayer Room"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* How It Works */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              1. Start a Room
            </h3>
            <p className="text-sm text-muted-foreground">
              Create a personal prayer room and share what you need prayer for
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              2. A Partner Joins
            </h3>
            <p className="text-sm text-muted-foreground">
              Another member sees your room and joins to pray with you
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              3. Pray Together
            </h3>
            <p className="text-sm text-muted-foreground">
              Connect face-to-face in a secure, personal video call
            </p>
          </div>
        </div>

        {/* Sign In Prompt */}
        {!user && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8 text-center">
            <p className="text-foreground">
              <a
                href="/login"
                className="text-primary hover:underline font-semibold"
              >
                Sign in
              </a>{" "}
              to create or join a 1:1 prayer room
            </p>
          </div>
        )}

        {/* Active Prayer Rooms */}
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Open Prayer Rooms
        </h2>

        {prayerRooms.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Video className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Open Prayer Rooms
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {user
                ? "Be the first to start a prayer room. Someone will join you soon."
                : "Sign in to create or join a prayer room."}
            </p>
            {user && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Start a Prayer Room
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prayerRooms.map((room: any) => (
              <div
                key={room.id}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Video className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {room.roomName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Hosted by {room.hostName}
                      </p>
                    </div>
                  </div>
                  {user && user.id === room.hostId && (
                    <button
                      onClick={() => handleEndRoom(room.id)}
                      className="text-destructive hover:text-destructive/80 p-1"
                      title="End room"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {room.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {room.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    Personal (1:1)
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(room.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <Button
                  onClick={() => handleJoinRoom(room.roomUrl)}
                  className="w-full"
                  disabled={!user}
                >
                  Join Prayer Room
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-accent/30 border border-border rounded-xl p-6">
          <h3 className="font-semibold text-lg text-foreground mb-3">
            About 1:1 Video Prayer
          </h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>
                Personal and secure — only you and your prayer partner can join
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Video className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>
                Video, audio, and chat — works directly in your browser, no
                downloads needed
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Heart className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>
                Pray for healing, guidance, encouragement, or anything on your
                heart
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>
                No time limit — take as long as you need in prayer together
              </span>
            </li>
          </ul>
        </div>

        {/* Scripture */}
        <div className="mt-8 text-center">
          <blockquote className="text-sm italic text-muted-foreground">
            "For where two or three gather in my name, there am I with them."
          </blockquote>
          <p className="text-xs font-semibold text-primary mt-1">
            — Matthew 18:20
          </p>
        </div>
      </main>
    </div>
  );
}
