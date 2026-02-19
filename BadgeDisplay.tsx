import { trpc } from "@/lib/trpc";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BadgeDisplayProps {
  userId: number;
  limit?: number; // Optional limit on number of badges to show
}

export function BadgeDisplay({ userId, limit }: BadgeDisplayProps) {
  const { data: userBadges, isLoading } = trpc.badges.getUserBadges.useQuery({ userId });

  if (isLoading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-12 h-12 rounded-full bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!userBadges || userBadges.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No badges earned yet
      </div>
    );
  }

  const displayBadges = limit ? userBadges.slice(0, limit) : userBadges;
  const remainingCount = limit && userBadges.length > limit ? userBadges.length - limit : 0;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 flex-wrap">
        {displayBadges.map((badge) => (
          <Tooltip key={badge.id}>
            <TooltipTrigger>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors">
                <img
                  src={badge.icon}
                  alt={badge.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <p className="font-semibold">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Earned {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        {remainingCount > 0 && (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
            +{remainingCount}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
