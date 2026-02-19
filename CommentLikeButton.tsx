import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Heart } from "lucide-react";
import { toast } from "sonner";

export function CommentLikeButton({ commentId, userId }: { commentId: number; userId?: number }) {
  const { data: likeInfo, refetch } = trpc.comments.getCommentLikeInfo.useQuery(
    { commentId, userId },
    { enabled: true }
  );
  
  const toggleLikeMutation = trpc.comments.toggleCommentLike.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => toast.error(error.message || "Failed to update like"),
  });

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If user is logged in, toggle like
    if (userId) {
      toggleLikeMutation.mutate({ commentId });
      return;
    }
    
    // If user is not logged in, show error
    toast.error("Please sign in to like comments");
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleHeartClick}
        className="gap-1 h-7 px-2"
        disabled={toggleLikeMutation.isPending}
      >
        <Heart
          className={`w-4 h-4 ${
            likeInfo?.userLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
          }`}
        />
        <span className="text-xs text-muted-foreground">
          {likeInfo?.likeCount || 0}
        </span>
      </Button>
    </div>
  );
}
