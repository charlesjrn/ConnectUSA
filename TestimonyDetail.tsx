import { useAuth } from "@/_core/hooks/useAuth";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { CreatorBadge } from "@/components/CreatorBadge";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { CommentLikeButton } from "@/components/CommentLikeButton";

export default function TestimonyDetail() {
  const [, params] = useRoute("/testimony/:id");
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { data: isOwner } = trpc.auth.isOwner.useQuery();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  const messageId = params?.id ? parseInt(params.id) : 0;

  const { data: messages } = trpc.messages.all.useQuery();
  const { data: comments, refetch: refetchComments } = trpc.comments.byMessageId.useQuery(
    { messageId },
    { enabled: messageId > 0 }
  );

  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      toast.success("Comment added successfully!");
      setCommentContent("");
      refetchComments();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add comment");
    },
  });

  const deleteMutation = trpc.messages.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted successfully!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete post");
    },
  });

  const deleteCommentMutation = trpc.comments.deleteComment.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted successfully!");
      refetchComments();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });

  const editCommentMutation = trpc.comments.editComment.useMutation({
    onSuccess: () => {
      toast.success("Comment updated successfully!");
      setEditingCommentId(null);
      setEditCommentContent("");
      refetchComments();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update comment");
    },
  });

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentContent("");
  };

  const handleSaveEdit = (commentId: number) => {
    if (!editCommentContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    editCommentMutation.mutate({
      commentId,
      content: editCommentContent,
    });
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate({ commentId });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refetchComments();
    }, 3000);
    return () => clearInterval(interval);
  }, [refetchComments]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const testimony = messages?.find((m) => m.id === messageId);

  if (!testimony) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="container max-w-4xl py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Testimony not found</p>
            <Button onClick={() => setLocation("/dashboard")} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Feed
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const [title, ...contentParts] = testimony.content.split("\n\n");
  const content = contentParts.join("\n\n") || title;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAddComment = () => {
    if (!commentContent.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    if (createComment.isPending) {
      return;
    }

    createComment.mutate({
      messageId,
      content: commentContent,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <main className="container max-w-4xl py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Button>

        {/* Testimony Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-700">
                    {getInitials(testimony.userName || "Anonymous")}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p
                      className="font-semibold hover:text-primary cursor-pointer"
                      onClick={() => setLocation(`/user/${testimony.userId}`)}
                    >
                      {testimony.userName}
                    </p>
                    {isOwner && testimony.userId === user?.id && <CreatorBadge />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(testimony.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-yellow-100 text-yellow-800">
                {testimony.room === "chatroom" ? "Chat" : testimony.room}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-4">{title}</h1>
            <p className="text-foreground whitespace-pre-wrap text-lg leading-relaxed">{content}</p>
            
            {/* Social Sharing Buttons */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <SocialShareButtons
                    title={title}
                    content={content}
                    url={`/testimony/${testimony.id}`}
                  />
                </div>
                {user && (user.id === testimony.userId || user.role === "admin") && (
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

        {/* Comments Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Comments</h2>

          {/* Add Comment Form */}
          <Card>
            <CardContent className="pt-6">
              {user ? (
                <>
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={3}
                    className="mb-4"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={createComment.isPending}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {createComment.isPending ? "Adding..." : "Add Comment"}
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">Join the community to share your thoughts</p>
                  <Button
                    onClick={() => window.location.href = "/login"}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Join to Comment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments List */}
          {comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-gray-700">
                          {getInitials(comment.userName || "Anonymous")}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{comment.userName}</p>
                            {isOwner && comment.userId === user?.id && <CreatorBadge />}
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            {comment.isEdited && (
                              <span className="text-xs text-muted-foreground italic">(edited)</span>
                            )}
                          </div>
                          {user && (comment.userId === user.id || user.role === "admin") && (
                            <div className="flex gap-2">
                              {comment.userId === user.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditComment(comment)}
                                  className="h-8 px-2"
                                >
                                  Edit
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComment(comment.id)}
                                className="h-8 px-2 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {editingCommentId === comment.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editCommentContent}
                              onChange={(e) => setEditCommentContent(e.target.value)}
                              className="min-h-[80px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleSaveEdit(comment.id)}
                                size="sm"
                              >
                                Save
                              </Button>
                              <Button
                                onClick={handleCancelEdit}
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-foreground whitespace-pre-wrap mb-2">{comment.content}</p>
                            <CommentLikeButton commentId={comment.id} userId={user?.id} />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No comments yet. Be the first to share your thoughts!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
