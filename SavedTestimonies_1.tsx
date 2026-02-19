import { useAuth } from "@/_core/hooks/useAuth";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { LikeButton } from "@/components/LikeButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Bookmark, Trash2, Pin, PinOff } from "lucide-react";
import { SafeHTML } from "@/components/SafeHTML";
import { ReactionPicker } from "@/components/ReactionPicker";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORY_COLORS: Record<string, string> = {
  gift: "bg-blue-100 text-blue-800 border-blue-300",
  vision: "bg-purple-100 text-purple-800 border-purple-300",
  encounter: "bg-green-100 text-green-800 border-green-300",
  testimony: "bg-yellow-100 text-yellow-800 border-yellow-300",
  prayer: "bg-pink-100 text-pink-800 border-pink-300",
  missions: "bg-orange-100 text-orange-800 border-orange-300",
  chatroom: "bg-cyan-100 text-cyan-800 border-cyan-300",
  meetup: "bg-indigo-100 text-indigo-800 border-indigo-300",
};

const CATEGORY_LABELS: Record<string, string> = {
  gift: "Gift",
  vision: "Vision",
  encounter: "Encounter",
  testimony: "Revelation",
  prayer: "Prayer",
  missions: "Mission",
  chatroom: "Chat",
  meetup: "Meetup",
};

export default function SavedTestimonies() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: bookmarkedMessages, refetch } = trpc.messages.getBookmarks.useQuery(undefined, {
    enabled: !!user,
  });

  const removeBookmarkMutation = trpc.messages.removeBookmark.useMutation({
    onSuccess: () => {
      toast.success("Removed from saved testimonies");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove bookmark");
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

  const pinMutation = trpc.messages.pin.useMutation({
    onSuccess: () => {
      toast.success("Post pinned to top of feed");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to pin post");
    },
  });

  const unpinMutation = trpc.messages.unpin.useMutation({
    onSuccess: () => {
      toast.success("Post unpinned");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unpin post");
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const parseTestimony = (content: string) => {
    const parts = content.split("\n\n");
    if (parts.length >= 2) {
      return { title: parts[0], content: parts.slice(1).join("\n\n") };
    }
    return { title: "", content };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3E8]">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F3E8]">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Sign in to view saved testimonies</h2>
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              className="bg-[#d4a017] hover:bg-[#b8900f] text-black font-semibold"
            >
              Sign In
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3E8]">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Saved Testimonies</h1>
            <p className="text-gray-600">Testimonies you've bookmarked for later</p>
          </div>
        </div>

        {bookmarkedMessages && bookmarkedMessages.length > 0 ? (
          <div className="space-y-6">
            {bookmarkedMessages.map((testimony) => {
              const { title, content } = parseTestimony(testimony.content);
              const isWelcomePost = testimony.content.includes("# Welcome to Chosen Connect: A Divine Vision");

              return (
                <Card
                  key={testimony.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setLocation(`/testimony/${testimony.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-gray-700">
                            {getInitials(testimony.userName || "Anonymous")}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(`/user/${testimony.userId}`);
                              }}
                              className="font-semibold hover:underline"
                            >
                              {testimony.userName}
                            </button>
                            <span className="text-sm text-muted-foreground">
                              {new Date(testimony.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full border ${
                                CATEGORY_COLORS[testimony.room]
                              }`}
                            >
                              {CATEGORY_LABELS[testimony.room]}
                            </span>
                            {testimony.isPinned && (
                              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 flex items-center gap-1">
                                <Pin className="w-3 h-3" />
                                Pinned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent onClick={(e) => e.stopPropagation()}>
                    {title && (
                      <h2 className="text-2xl font-bold text-[#d4a017] mb-4">{title}</h2>
                    )}
                    <div className="prose max-w-none mb-4">
                      <SafeHTML html={content} />
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <LikeButton messageId={testimony.id} userId={user?.id} />
                        <ReactionPicker messageId={testimony.id} userId={user?.id} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBookmarkMutation.mutate({ messageId: testimony.id })}
                          className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                        >
                          <Bookmark className="w-4 h-4 mr-1 fill-current" />
                          Saved
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        {user && user.role === "admin" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (testimony.isPinned) {
                                unpinMutation.mutate({ messageId: testimony.id });
                              } else {
                                pinMutation.mutate({ messageId: testimony.id });
                              }
                            }}
                            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                          >
                            {testimony.isPinned ? (
                              <>
                                <PinOff className="w-4 h-4 mr-1" />
                                Unpin
                              </>
                            ) : (
                              <>
                                <Pin className="w-4 h-4 mr-1" />
                                Pin
                              </>
                            )}
                          </Button>
                        )}
                        {user && (user.id === testimony.userId || user.role === "admin") && !isWelcomePost && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this post?")) {
                                deleteMutation.mutate({ messageId: testimony.id });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground text-lg mb-2">No saved testimonies yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Bookmark testimonies to save them for later
              </p>
              <Button
                onClick={() => setLocation("/dashboard")}
                className="bg-primary hover:bg-primary/90"
              >
                Browse Testimonies
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
