import { formatDistanceToNow } from "date-fns";

interface ActivityIndicatorProps {
  lastSeen: Date;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ActivityIndicator({ lastSeen, showText = false, size = "sm" }: ActivityIndicatorProps) {
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const minutesAgo = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
  
  // Consider active if seen within last 5 minutes
  const isActive = minutesAgo < 5;
  
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };
  
  if (!showText) {
    return isActive ? (
      <span 
        className={`${sizeClasses[size]} rounded-full bg-green-500 border-2 border-background`}
        title="Active now"
      />
    ) : null;
  }
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {isActive ? (
        <>
          <span className={`${sizeClasses[size]} rounded-full bg-green-500`} />
          <span>Active now</span>
        </>
      ) : (
        <span>Last seen {formatDistanceToNow(lastSeenDate, { addSuffix: true })}</span>
      )}
    </div>
  );
}
