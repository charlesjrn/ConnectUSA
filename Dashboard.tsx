import { useAuth } from "@/_core/hooks/useAuth";
import { LikeButton } from "@/components/LikeButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Plus, Heart, Trash2, Pencil, Sparkles, Crown, Users, Eye, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { LiveVisitorCounter } from "@/components/LiveVisitorCounter";
import { CreatorBadge } from "@/components/CreatorBadge";
import { SocialProofBadge } from "@/components/SocialProofBadge";
import { FeaturedTestimonies } from "@/components/FeaturedTestimonies";
import { VerseOfTheDay } from "@/components/VerseOfTheDay";
import { DonationImpact } from "@/components/DonationImpact";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { MemberSpotlight } from "@/components/MemberSpotlight";
import { DonorBadge } from "@/components/DonorBadge";

// Donor Badge Wrapper Component
function DonorBadgeWrapper({ userId }: { userId: number }) {
  const { data: badgeData } = trpc.users.getDonorBadge.useQuery({ userId });
  if (!badgeData?.tier) return null;
  return <DonorBadge tier={badgeData.tier} showLabel={false} size="sm" />;
}

const CATEGORY_COLORS: Record<string, string> = {
  gift: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  vision: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  encounter: "bg-green-500/20 text-green-300 border-green-500/30",
  testimony: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  prayer: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  missions: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  chatroom: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  meetup: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
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

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<{id: number, title?: string, content: string} | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("testimony");

  const { data: messages, refetch } = trpc.messages.all.useQuery();
  const { data: isOwner } = trpc.auth.isOwner.useQuery();
  const { data: membershipStatus } = trpc.membership.getStatus.useQuery(
    undefined,
    { enabled: !!user }
  );

  const isFounder = membershipStatus?.isFounder;

  const sendMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      toast.success("Testimony shared successfully!");
      setTitle("");
      setContent("");
      setCategory("testimony");
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

  const editMutation = trpc.messages.edit.useMutation({
    onSuccess: () => {
      toast.success("Post updated successfully!");
      setEditDialogOpen(false);
      setEditingMessage(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update post");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex items-center justify-center">
        <div className="animate-pulse text-white/60">Loading...</div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (sendMutation.isPending) {
      return;
    }

    sendMutation.mutate({
      room: category as any,
      content: `${title}\n\n${content}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663276675485/NYRoGrjvnCQVbZEX.png" 
              alt="Chosen Connect" 
              className="h-10 w-auto cursor-pointer"
              onClick={() => setLocation("/")}
            />
            <span className="text-white font-semibold text-lg hidden sm:block">Chosen Connect</span>
          </div>
          <div className="flex items-center gap-4">
            <LiveVisitorCounter />
            {user ? (
              <>
                {isFounder ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 text-sm font-medium hidden sm:inline">Founder</span>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation("/membership")}
                    className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                  >
                    <Crown className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Upgrade</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/profile")}
                  className="text-white/70 hover:text-white"
                >
                  Profile
                </Button>
              </>
            ) : (
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
              >
                Join Free
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-white/70 text-sm">Community Feed</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Community Feed
              </h1>
              <p className="text-white/60">
                Latest testimonies from the chosen ones.
              </p>
            </div>
            <SocialProofBadge />
          </div>
          
          {/* Daily Verse - At the top */}
          <div className="mb-6">
            <VerseOfTheDay />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="px-4 pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Guest Banner */}
          {!user && (
            <Card className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-500/30">
              <CardContent className="py-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Users className="w-6 h-6 text-amber-400" />
                  <h3 className="text-xl font-bold text-white">Welcome, Guest!</h3>
                </div>
                <p className="text-white/70 mb-4">
                  You're viewing the community in preview mode. Join us to share your testimonies, comment, and connect with other believers.
                </p>
                <Button
                  onClick={() => window.location.href = getLoginUrl()}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                >
                  Join the Community - It's Free!
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Featured Testimonies Carousel */}
          <FeaturedTestimonies />

          {/* Welcome Banner for New Visitors */}
          {!user && <WelcomeBanner />}

          {/* Member Spotlight */}
          <MemberSpotlight />

          {/* Share Testimony Button */}
          {user ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Share Testimony
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-[#1a1a2e] border-white/20 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-white">Share Your Testimony</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-white/70">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category" className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-white/20">
                        <SelectItem value="testimony">Revelation</SelectItem>
                        <SelectItem value="gift">Gift</SelectItem>
                        <SelectItem value="vision">Vision</SelectItem>
                        <SelectItem value="encounter">Encounter</SelectItem>
                        <SelectItem value="prayer">Prayer</SelectItem>
                        <SelectItem value="missions">Mission</SelectItem>
                        <SelectItem value="meetup">Meetup</SelectItem>
                        <SelectItem value="chatroom">Chat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white/70">Title</Label>
                    <Input
                      id="title"
                      placeholder="Give your testimony a title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="story" className="text-white/70">Your Story</Label>
                    <Textarea
                      id="story"
                      placeholder="Share what God has shown you..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={8}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={sendMutation.isPending}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold"
                    size="lg"
                  >
                    {sendMutation.isPending ? "Publishing..." : "Publish Testimony"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold"
              onClick={() => window.location.href = getLoginUrl()}
            >
              <Plus className="w-5 h-5 mr-2" />
              Join to Share Your Testimony
            </Button>
          )}

          {/* Testimonies Feed */}
          <div className="space-y-4 mt-6">
            {messages && messages.length > 0 ? (
              messages
                .filter((message) => {
                  const title = (message as any).title || message.content.split("\n\n")[0];
                  return !title.startsWith("Category Guidelines:");
                })
                .map((message) => {
                const messageTitle = (message as any).title || message.content.split("\n\n")[0];
                const messageContent = (message as any).title ? message.content : message.content.split("\n\n").slice(1).join("\n\n");

                return (
                  <Card 
                    key={message.id} 
                    className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 overflow-hidden cursor-pointer hover:border-white/30 transition-all"
                    onClick={() => setLocation(`/testimony/${message.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-purple-500/30 flex items-center justify-center">
                            <span className="text-lg font-semibold text-white">
                              {message.userName?.[0]?.toUpperCase() || "C"}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p
                                className="font-semibold text-white hover:text-amber-400 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLocation(`/user/${message.userId}`);
                                }}
                              >
                                {message.userName || "Anonymous"}
                              </p>
                              {isOwner && message.userId === user?.id && <CreatorBadge />}
                              <DonorBadgeWrapper userId={message.userId} />
                            </div>
                            <p className="text-sm text-white/50">
                              {new Date(message.createdAt).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${
                            CATEGORY_COLORS[message.room] || "bg-white/10 text-white/70 border-white/20"
                          }`}
                        >
                          {CATEGORY_LABELS[message.room] || message.room}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="text-xl font-bold mb-3 text-amber-400">
                        {messageTitle || "Untitled"}
                      </h3>
                      {messageContent && (
                        <p className="text-white/80 whitespace-pre-wrap mb-4 line-clamp-4">
                          {messageContent}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <LikeButton messageId={message.id} userId={user?.id} />
                          <div className="flex items-center gap-4 text-sm text-white/50">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {(message as any).viewCount || 0} views
                            </span>
                          </div>
                          
                          {user?.role === 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-auto gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation('/donations');
                              }}
                            >
                              <Heart className="h-4 w-4" />
                              Support
                            </Button>
                          )}
                        </div>
                        {user && (user.id === message.userId || user.role === "admin") && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingMessage({ id: message.id, title: messageTitle, content: messageContent || message.content });
                                setEditDialogOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
                <CardContent className="py-12 text-center">
                  <p className="text-white/60">
                    No testimonies yet. Be the first to share!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Donation Impact Widget - Admin Only */}
          {user?.role === 'admin' && (
            <div className="mt-8">
              <DonationImpact />
            </div>
          )}
        </div>
      </main>

      {/* Edit Post Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#1a1a2e] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title" className="text-white/70">Title</Label>
              <Input
                id="edit-title"
                placeholder="Title for your post"
                value={(editingMessage as any)?.title || ""}
                onChange={(e) => setEditingMessage(prev => prev ? {...prev, title: e.target.value} as any : null)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div>
              <Label htmlFor="edit-content" className="text-white/70">Content</Label>
              <Textarea
                id="edit-content"
                placeholder="Share your story..."
                value={editingMessage?.content || ""}
                onChange={(e) => setEditingMessage(prev => prev ? {...prev, content: e.target.value} : null)}
                rows={10}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <Button
              onClick={() => {
                if (!editingMessage?.content.trim()) {
                  toast.error("Content cannot be empty");
                  return;
                }
                editMutation.mutate({
                  messageId: editingMessage.id,
                  title: (editingMessage as any).title,
                  content: editingMessage.content
                });
              }}
              disabled={editMutation.isPending}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold"
            >
              {editMutation.isPending ? "Updating..." : "Update Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <p className="text-white/40 text-sm">
            © 2024 Chosen Connect. All rights reserved.
          </p>
          <p className="text-white/30 text-xs max-w-2xl mx-auto">
            Chosen Connect is a for-profit community platform. Profits will be spent to build God's kingdom! Content is shared for fellowship and encouragement, not as professional or pastoral advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
