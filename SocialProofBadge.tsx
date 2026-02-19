import { trpc } from "@/lib/trpc";
import { Users, TrendingUp } from "lucide-react";

export function SocialProofBadge() {
  const { data: memberData } = trpc.analytics.memberCount.useQuery();
  const { data: activityData } = trpc.analytics.recentActivity.useQuery();

  const memberCount = memberData?.count || 0;
  const newTestimonies = activityData?.newTestimoniesThisWeek || 0;
  const newPrayers = activityData?.newPrayersThisWeek || 0;

  return (
    <div className="flex flex-col gap-2 text-sm">
      {memberCount > 0 && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>Join {memberCount}+ believers</span>
        </div>
      )}
      {(newTestimonies > 0 || newPrayers > 0) && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span>
            {newTestimonies > 0 && `${newTestimonies} new ${newTestimonies === 1 ? 'testimony' : 'testimonies'}`}
            {newTestimonies > 0 && newPrayers > 0 && ' & '}
            {newPrayers > 0 && `${newPrayers} new ${newPrayers === 1 ? 'prayer' : 'prayers'}`}
            {' '}this week
          </span>
        </div>
      )}
    </div>
  );
}
