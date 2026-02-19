import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { LikesDialog } from "@/components/LikesDialog";
import { useState } from "react";

export function LikeButton({ messageId, userId }: { messageId: number; userId?: number }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: likeInfo, refetch } = trpc.messages.getPostLikeInfo.useQuery(
    { postId: messageId, userId },
    { enabled: true }
  );
  
  const toggleLikeMutation = trpc.messages.togglePostLike.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => toast.error(error.message || "Failed to update like"),
  });

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If user is logged in, toggle like
    if (userId) {
      toggleLikeMutation.mutate({ postId: messageId });
      return;
    }
    
    // If user is not logged in, show who liked (if there are likes)
    if (!userId) {
      if ((likeInfo?.likeCount || 0) > 0) {
        setDialogOpen(true);
      } else {
        toast.error("Please sign in to like testimonies");
      }
    }
  };

  const handleCountClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((likeInfo?.likeCount || 0) > 0) {
      setDialogOpen(true);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <LikesDialog 
        messageId={messageId} 
        likeCount={likeInfo?.likeCount || 0}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleHeartClick}
          className="gap-2"
          disabled={toggleLikeMutation.isPending}
        >
          <Heart
            className={`w-5 h-5 ${
              likeInfo?.userLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
            }`}
          />
        </Button>
      </LikesDialog>
      <button 
        className="text-sm hover:underline cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
        onClick={handleCountClick}
      >
        {likeInfo?.likeCount || 0}
      </button>
    </div>
  );
}
