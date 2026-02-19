import { useAuth } from "@/_core/hooks/useAuth";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { LikeButton } from "@/components/LikeButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Plus, Heart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type Room = "gift" | "vision" | "encounter" | "testimony" | "prayer" | "missions" | "meetup" | "chatroom" | "prayer-requests";

interface CategoryPageProps {
  category: Room;
  title: string;
  description: string;
}

export default function CategoryPage({ category, title, description }: CategoryPageProps) {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testimonyTitle, setTestimonyTitle] = useState("");
  const [testimonyContent, setTestimonyContent] = useState("");

  const { data: messages, isLoading, refetch } = trpc.messages.byRoom.useQuery({ room: category });
  const sendMessage = trpc.messages.send.useMutation({
    onSuccess: () => {
      toast.success("Testimony shared successfully!");
      setTestimonyTitle("");
      setTestimonyContent("");
      setDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to share testimony");
    },
  });

  const deleteMutation = trpc.messages.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete post");
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 3000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  const handleShare = () => {
    if (!testimonyTitle.trim() || !testimonyContent.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    if (sendMessage.isPending) {
      return; // Prevent duplicate submissions
    }

    sendMessage.mutate({
      room: category,
      content: `${testimonyTitle}\n\n${testimonyContent}`,
    });
  };

  const getCategoryBadgeColor = (cat: Room) => {
    const colors: Record<Room, string> = {
      gift: "bg-purple-100 text-purple-800",
      vision: "bg-blue-100 text-blue-800",
      encounter: "bg-green-100 text-green-800",
      testimony: "bg-yellow-100 text-yellow-800",
      prayer: "bg-pink-100 text-pink-800",
      missions: "bg-teal-100 text-teal-800",
      meetup: "bg-indigo-100 text-indigo-800",
      chatroom: "bg-cyan-100 text-cyan-800",
      "prayer-requests": "bg-rose-100 text-rose-800",
    };
    return colors[cat] || "bg-gray-100 text-gray-800";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <main className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {/* Category Guideline Banner */}
        {messages && messages.length > 0 && (() => {
          const guideline = messages.find(m => 
            ((m as any).title || m.content.split("\n\n")[0]).startsWith("Category Guidelines:")
          );
          if (!guideline) return null;
          
          const guidelineTitle = (guideline as any).title || guideline.content.split("\n\n")[0];
          const guidelineContent = (guideline as any).title 
            ? guideline.content 
            : guideline.content.split("\n\n").slice(1).join("\n\n");
          
          return (
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-primary mb-3">📋 Category Guidelines</h3>
                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {guidelineContent}
                </p>
              </CardContent>
            </Card>
          );
        })()}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mb-8 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-5 h-5 mr-2" />
              Share Testimony
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Share Your Testimony</DialogTitle>
              <DialogDescription>
                Share what God has shown you with the community.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Give your testimony a title"
                  value={testimonyTitle}
                  onChange={(e) => setTestimonyTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="story">Your Story</Label>
                <Textarea
                  id="story"
                  placeholder="Share what God has shown you..."
                  value={testimonyContent}
                  onChange={(e) => setTestimonyContent(e.target.value)}
                  rows={6}
                />
              </div>
            </div>
            <Button
              onClick={handleShare}
              disabled={sendMessage.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {sendMessage.isPending ? "Publishing..." : "Publish Testimony"}
            </Button>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading testimonies...</div>
        ) : (() => {
          const filteredMessages = messages?.filter((message) => {
            const title = (message as any).title || message.content.split("\n\n")[0];
            return !title.startsWith("Category Guidelines:");
          }) || [];
          
          return filteredMessages.length > 0 ? (
            <div className="space-y-6">
              {filteredMessages.map((message) => {
              const [msgTitle, ...contentParts] = message.content.split("\n\n");
              const msgContent = contentParts.join("\n\n") || msgTitle;

              return (
                <Card 
                  key={message.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setLocation(`/testimony/${message.id}`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-700">
                            {getInitials(message.userName || "Anonymous")}
                          </span>
                        </div>
                        <div>
                          <p 
                            className="font-semibold hover:text-primary cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(`/user/${message.userId}`);
                            }}
                          >
                            {message.userName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(message.createdAt).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getCategoryBadgeColor(message.room as Room)}`}
                      >
                        {message.room === "chatroom" ? "Chat" : message.room}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-2">{msgTitle}</h3>
                    <p className="text-foreground whitespace-pre-wrap mb-4">{msgContent}</p>
                    <div className="flex items-center justify-between">
                      <LikeButton messageId={message.id} userId={user?.id} />
                      {user && (user.id === message.userId || user.role === "admin") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Are you sure you want to delete this post?")) {
                              deleteMutation.mutate({ messageId: message.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No testimonies yet. Be the first to share!
              </p>
            </CardContent>
          </Card>
        );
        })()}
      </main>
    </div>
  );
}
