import { Crown } from "lucide-react";

export function CreatorBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm">
      <Crown className="w-3 h-3" />
      Creator
    </span>
  );
}
