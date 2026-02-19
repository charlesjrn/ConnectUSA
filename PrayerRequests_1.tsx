import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Heart, Plus, Trash2, CheckCircle2, AlertCircle, Pencil, Sparkles, Crown, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { CreatorBadge } from "@/components/CreatorBadge";

export default function PrayerRequests() {
  const { user, loading } = useAuth();
  const { data: isOwner } = trpc.auth.isOwner.useQuery();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [answeredDialogOpen, setAnsweredDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [answeredTestimony, setAnsweredTestimony] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<{id: number, title?: string, content: string} | null>(null);

  const { data: membershipStatus } = trpc.membership.getStatus.useQuery(
    undefined,
    { enabled: !!user }
  );

  const isFounder = membershipStatus?.isFounder;

  const utils = trpc.useUtils();

  const { data: prayers, isLoading } = trpc.messages.byRoom.useQuery({
    room: "prayer-requests",
  });

  const sendMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      utils.messages.byRoom.invalidate();
      setTitle("");
      setContent("");
      setCategory("");
      setIsAnonymous(false);
      setIsUrgent(false);
      setDialogOpen(false);
      toast.success("Your prayer request has been posted to the community.");
    },
  });

  const deleteMutation = trpc.messages.delete.useMutation({
    onSuccess: () => {
      utils.messages.byRoom.invalidate();
      toast.success("Your prayer request has been removed.");
    },
  });

  const editMutation = trpc.messages.edit.useMutation({
    onSuccess: () => {
      utils.messages.byRoom.invalidate();
      toast.success("Prayer request updated successfully!");
      setEditDialogOpen(false);
      setEditingPrayer(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update prayer request");
    },
  });

  const addPrayerMutation = trpc.messages.addPrayer.useMutation({
    onSuccess: () => {
      utils.messages.byRoom.invalidate();
    },
  });

  const removePrayerMutation = trpc.messages.removePrayer.useMutation({
    onSuccess: () => {
      utils.messages.byRoom.invalidate();
    },
  });

  const markAnsweredMutation = trpc.messages.markAnswered.useMutation({
    onSuccess: () => {
      utils.messages.byRoom.invalidate();
      setAnsweredDialogOpen(false);
      setSelectedRequestId(null);
      setAnsweredTestimony("");
      toast.success("Your testimony of answered prayer has been shared.");
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please provide both a title and prayer request.");
      return;
    }

    sendMutation.mutate({
      content: content.trim(),
      title: title.trim(),
      room: "prayer-requests",
      category: category || undefined,
      isAnonymous,
      isUrgent,
    });
  };

  const handlePrayerToggle = (messageId: number, hasPrayed: boolean) => {
    if (hasPrayed) {
      removePrayerMutation.mutate({ messageId });
    } else {
      addPrayerMutation.mutate({ messageId });
    }
  };

  const handleMarkAnswered = () => {
    if (!selectedRequestId || !answeredTestimony.trim()) {
      toast.error("Please share how God answered this prayer.");
      return;
    }

    markAnsweredMutation.mutate({
      messageId: selectedRequestId,
      answeredTestimony: answeredTestimony.trim(),
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const sortedPrayers = prayers?.sort((a: any, b: any) => {
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    if (a.isAnswered && !b.isAnswered) return 1;
    if (!a.isAnswered && b.isAnswered) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex items-center justify-center">
        <div className="animate-pulse text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="text-white/70 hover:text-white mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663276675485/NYRoGrjvnCQVbZEX.png" 
              alt="Chosen Connect" 
              className="h-10 w-auto cursor-pointer"
              onClick={() => setLocation("/")}
            />
            <span className="text-white font-semibold text-lg hidden sm:block">Chosen Connect</span>
          </div>
          <div className="flex items-center gap-4">
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
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="text-white/70 text-sm">Prayer Community</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Prayer Requests
          </h1>
          <p className="text-white/60">
            Share your prayer needs and pray for others in the community.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="px-4 pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {!user ? (
            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-rose-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">Join the Prayer Community</h2>
                <p className="text-white/60 mb-6">
                  Sign in to share prayer requests and pray for others.
                </p>
                <Button 
                  onClick={() => (window.location.href = getLoginUrl())}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                >
                  Sign In / Join Community
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Share Prayer Request Button */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold" 
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Share Prayer Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-[#1a1a2e] border-white/20 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white">Share Prayer Request</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-white/70">Title</Label>
                      <Input
                        id="title"
                        placeholder="Brief title for your prayer request..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content" className="text-white/70">Prayer Request</Label>
                      <Textarea
                        id="content"
                        placeholder="Share what you need prayer for..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                        className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-white/70">Category (Optional)</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="mt-1 bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-white/20">
                          <SelectItem value="healing">Healing</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="guidance">Guidance</SelectItem>
                          <SelectItem value="provision">Provision</SelectItem>
                          <SelectItem value="ministry">Ministry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="anonymous"
                        checked={isAnonymous}
                        onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                        className="border-white/30"
                      />
                      <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer text-white/70">
                        Post anonymously
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="urgent"
                        checked={isUrgent}
                        onCheckedChange={(checked) => setIsUrgent(checked as boolean)}
                        className="border-white/30"
                      />
                      <Label htmlFor="urgent" className="text-sm font-normal cursor-pointer text-white/70">
                        Mark as urgent (will appear at the top)
                      </Label>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => setDialogOpen(false)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmit} 
                        disabled={sendMutation.isPending}
                        className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white"
                      >
                        {sendMutation.isPending ? "Posting..." : "Post Prayer Request"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Prayer Requests List */}
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-white/60">Loading prayer requests...</p>
                </div>
              ) : sortedPrayers && sortedPrayers.length > 0 ? (
                <div className="space-y-4">
                  {sortedPrayers.map((prayer: any) => (
                    <Card
                      key={prayer.id}
                      className={`bg-gradient-to-br from-white/10 to-white/5 border-white/20 ${
                        prayer.isUrgent && !prayer.isAnswered
                          ? "border-red-500/50 border-2"
                          : prayer.isAnswered
                          ? "border-emerald-500/50 bg-emerald-500/10"
                          : ""
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 cursor-pointer hover:from-rose-500/40 hover:to-purple-500/40 transition-colors"
                            onClick={() => setLocation(`/user/${prayer.userId}`)}
                          >
                            <span className="text-sm font-semibold text-white">
                              {getInitials(prayer.userName)}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span
                                className="font-semibold text-white hover:text-amber-400 cursor-pointer"
                                onClick={() => setLocation(`/user/${prayer.userId}`)}
                              >
                                {prayer.userName}
                              </span>
                              {isOwner && prayer.userId === user?.id && <CreatorBadge />}
                              <span className="text-sm text-white/50">
                                {formatDate(prayer.createdAt)}
                              </span>
                              {prayer.isUrgent && !prayer.isAnswered && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                                  <AlertCircle className="w-3 h-3" />
                                  Urgent
                                </span>
                              )}
                              {prayer.isAnswered && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Answered
                                </span>
                              )}
                              {user.id === prayer.userId && !prayer.isAnswered && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequestId(prayer.id);
                                    setAnsweredDialogOpen(true);
                                  }}
                                  className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Mark Answered
                                </Button>
                              )}
                            </div>

                            {prayer.title && (
                              <div className="mb-4">
                                <h3 className="text-lg font-semibold text-amber-400 mb-3 pb-3 border-b border-white/10">{prayer.title}</h3>
                              </div>
                            )}

                            <p className="text-white/80 whitespace-pre-wrap mb-4">{prayer.content}</p>

                            {prayer.isAnswered && prayer.answeredTestimony && (
                              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                  <span className="font-semibold text-emerald-300">
                                    Prayer Answered!
                                  </span>
                                </div>
                                <p className="text-white/80 whitespace-pre-wrap">
                                  {prayer.answeredTestimony}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-4">
                              <Button
                                variant={prayer.userHasPrayed ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePrayerToggle(prayer.id, prayer.userHasPrayed || false)}
                                disabled={addPrayerMutation.isPending || removePrayerMutation.isPending}
                                className={prayer.userHasPrayed 
                                  ? "bg-rose-500 hover:bg-rose-600 text-white" 
                                  : "border-rose-500/30 text-rose-400 hover:bg-rose-500/10 bg-transparent"
                                }
                              >
                                <Heart
                                  className={`w-4 h-4 mr-1 ${
                                    prayer.userHasPrayed ? "fill-current" : ""
                                  }`}
                                />
                                {prayer.userHasPrayed ? "Praying" : "Pray"}
                                {prayer.prayerCount > 0 && (
                                  <span className="ml-1">({prayer.prayerCount})</span>
                                )}
                              </Button>
                              {user.id === prayer.userId && (
                                <div className="flex gap-2 ml-auto">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingPrayer({ id: prayer.id, title: prayer.title || "", content: prayer.content });
                                      setEditDialogOpen(true);
                                    }}
                                    className="text-white/60 hover:text-white hover:bg-white/10"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteMutation.mutate({ messageId: prayer.id })}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-rose-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No prayer requests yet</h3>
                    <p className="text-white/60 mb-4">
                      Be the first to share a prayer request with the community.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      {/* Mark Answered Dialog */}
      <Dialog open={answeredDialogOpen} onOpenChange={setAnsweredDialogOpen}>
        <DialogContent className="bg-[#1a1a2e] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Mark Prayer as Answered</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="testimony" className="text-white/70">Share how God answered this prayer</Label>
              <Textarea
                id="testimony"
                placeholder="Describe how this prayer was answered..."
                value={answeredTestimony}
                onChange={(e) => setAnsweredTestimony(e.target.value)}
                rows={6}
                className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setAnsweredDialogOpen(false);
                  setSelectedRequestId(null);
                  setAnsweredTestimony("");
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleMarkAnswered} 
                disabled={markAnsweredMutation.isPending}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
              >
                {markAnsweredMutation.isPending ? "Saving..." : "Mark as Answered"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Prayer Request Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#1a1a2e] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Prayer Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title" className="text-white/70">Title (Optional)</Label>
              <Input
                id="edit-title"
                placeholder="Brief title for your prayer request..."
                value={editingPrayer?.title || ""}
                onChange={(e) => setEditingPrayer(prev => prev ? {...prev, title: e.target.value} : null)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div>
              <Label htmlFor="edit-content" className="text-white/70">Prayer Request</Label>
              <Textarea
                id="edit-content"
                placeholder="Share what you need prayer for..."
                value={editingPrayer?.content || ""}
                onChange={(e) => setEditingPrayer(prev => prev ? {...prev, content: e.target.value} : null)}
                rows={8}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <Button
              onClick={() => {
                if (!editingPrayer?.content.trim()) {
                  toast.error("Prayer request content cannot be empty");
                  return;
                }
                editMutation.mutate({
                  messageId: editingPrayer.id,
                  title: editingPrayer.title,
                  content: editingPrayer.content
                });
              }}
              disabled={editMutation.isPending}
              className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white"
            >
              {editMutation.isPending ? "Updating..." : "Update Prayer Request"}
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
