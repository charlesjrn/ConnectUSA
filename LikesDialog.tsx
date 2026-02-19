import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface LikesDialogProps {
  messageId: number;
  likeCount: number;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LikesDialog({ messageId, likeCount, children, open, onOpenChange }: LikesDialogProps) {
  const { data: likes, isLoading } = trpc.messages.getLikes.useQuery(
    { messageId },
    { enabled: open } // Load when dialog is open
  );

  if (likeCount === 0) {
    return <>{children}</>;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {likeCount} {likeCount === 1 ? "Like" : "Likes"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : likes && likes.length > 0 ? (
            <div className="space-y-3">
              {likes.map((like) => (
                <div
                  key={like.userId}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={like.profilePicture || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {like.userName?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {like.userName || "Anonymous"}
                    </p>
                    {like.userEmail && (
                      <p className="text-xs text-muted-foreground truncate">
                        {like.userEmail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No likes yet</p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
