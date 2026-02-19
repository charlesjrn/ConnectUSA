import { Crown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface FounderBadgeProps {
  userId: number;
  className?: string;
  showLabel?: boolean;
}

export function FounderBadge({ userId, className, showLabel = false }: FounderBadgeProps) {
  const { data: membershipStatus } = trpc.membership.getStatus.useQuery(
    undefined,
    { enabled: false } // We'll use a different approach
  );

  // For now, we'll create a simpler version that checks via a separate query
  return null; // Placeholder - will be replaced with actual badge
}

// Simpler badge that just displays when passed isFounder prop
export function FounderBadgeDisplay({ 
  isFounder, 
  className,
  size = "sm" 
}: { 
  isFounder: boolean; 
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  if (!isFounder) return null;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6",
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-amber-600 p-0.5",
        className
      )}
      title="Founder Member"
    >
      <Crown className={cn("text-white", sizeClasses[size])} />
    </div>
  );
}

// Badge wrapper that fetches membership status for a specific user
export function FounderBadgeWrapper({ 
  userId,
  className,
  size = "sm"
}: { 
  userId: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  // Query all founders and check if this user is one
  const { data: founders } = trpc.membership.getAllFounders.useQuery();
  
  const isFounder = founders?.some(f => f.id === userId) ?? false;

  return <FounderBadgeDisplay isFounder={isFounder} className={className} size={size} />;
}
