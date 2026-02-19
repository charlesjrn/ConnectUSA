import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";
import { sendWeeklyDigest } from "../_core/weeklyDigest";
import type { DigestData } from "../_core/weeklyDigest";

export const weeklyDigestRouter = router({
  // Manual trigger for testing or admin use
  sendToAll: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Only allow admins to trigger manual digest
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can trigger weekly digest");
      }

      const weekEnd = new Date();
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 7);

      // Get users who opted in
      const users = await db.getUsersOptedIntoWeeklyDigest();
      
      // Get digest data
      const topTestimonies = await db.getTopTestimoniesForWeek(weekStart, 5);
      const newMembers = await db.getNewMembersForWeek(weekStart, 5);

      let successCount = 0;
      let failCount = 0;

      // Send digest to each user
      for (const user of users) {
        if (!user.email) continue;

        // Get unread notifications for this user
        const unreadCount = await db.getUnreadNotificationCount(user.id);

        const digestData: DigestData = {
          topTestimonies: topTestimonies.map(t => ({
            id: t.id,
            content: t.content,
            userName: t.userName || 'Anonymous',
            likesCount: t.likesCount,
            commentsCount: t.commentsCount,
            createdAt: t.createdAt,
          })),
          newMembers: newMembers.map(m => ({
            id: m.id,
            name: m.name || 'New Member',
            bio: m.bio,
            createdAt: m.createdAt,
          })),
          unreadNotifications: unreadCount,
          weekStart,
          weekEnd,
        };

        const success = await sendWeeklyDigest(
          user.id,
          user.email,
          user.name || 'Member',
          digestData
        );

        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      return {
        success: true,
        message: `Sent ${successCount} digests successfully, ${failCount} failed`,
        stats: {
          totalUsers: users.length,
          successCount,
          failCount,
          topTestimoniesCount: topTestimonies.length,
          newMembersCount: newMembers.length,
        },
      };
    }),
});
