import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

interface ReactionPickerProps {
  messageId: number;
  userId?: number;
}

const reactions = [
  { type: "praying" as const, emoji: "🙏", label: "Praying" },
  { type: "amen" as const, emoji: "🔥", label: "Amen" },
  { type: "blessed" as const, emoji: "❤️", label: "Blessed" },
];

export function ReactionPicker({ messageId, userId }: ReactionPickerProps) {
  const utils = trpc.useUtils();
  const [showPicker, setShowPicker] = useState(false);

  const { data: counts } = trpc.messages.reactionCounts.useQuery({ messageId });
  const { data: userReactions = [] } = trpc.messages.userReactions.useQuery(
    { messageId, userId },
    { enabled: !!userId }
  );

  const addReactionMutation = trpc.messages.addReaction.useMutation({
    onSuccess: () => {
      utils.messages.reactionCounts.invalidate({ messageId });
      utils.messages.userReactions.invalidate({ messageId, userId });
    },
  });

  const removeReactionMutation = trpc.messages.removeReaction.useMutation({
    onSuccess: () => {
      utils.messages.reactionCounts.invalidate({ messageId });
      utils.messages.userReactions.invalidate({ messageId, userId });
    },
  });

  const handleReactionClick = (reactionType: "praying" | "amen" | "blessed") => {
    if (!userId) return;

    if (userReactions.includes(reactionType)) {
      removeReactionMutation.mutate({ messageId, reactionType });
    } else {
      addReactionMutation.mutate({ messageId, reactionType });
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {reactions.map((reaction) => {
        const count = counts?.[reaction.type] || 0;
        const isActive = userReactions.includes(reaction.type);

        return (
          <Button
            key={reaction.type}
            variant={isActive ? "default" : "outline"}
            size="sm"
            className={`flex items-center gap-1 ${
              isActive ? "bg-primary text-primary-foreground" : ""
            }`}
            onClick={() => handleReactionClick(reaction.type)}
            disabled={!userId}
          >
            <span className="text-base">{reaction.emoji}</span>
            {count > 0 && <span className="text-xs">{count}</span>}
          </Button>
        );
      })}
    </div>
  );
}
