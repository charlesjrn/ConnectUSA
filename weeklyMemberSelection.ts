import { setFeaturedMember, getMemberSpotlight, getUserById } from "./db";
import { notifyMemberOfWeek } from "./memberOfWeekNotification";

/**
 * Automatically select the most active member from the past 7 days as Member of the Week
 * This function is designed to be called by a scheduled task (cron job)
 */
export async function selectWeeklyMember() {
  try {
    console.log('[Weekly Selection] Starting automatic Member of the Week selection...');
    
    // Get the most active member based on past 7 days
    const topMember = await getMemberSpotlight();
    
    if (!topMember) {
      console.log('[Weekly Selection] No eligible members found for this week');
      return { success: false, reason: 'No eligible members' };
    }
    
    console.log(`[Weekly Selection] Selected member: ${topMember.name} (ID: ${topMember.id})`);
    console.log(`[Weekly Selection] Stats - Testimonies: ${topMember.testimonyCount}, Likes: ${topMember.totalLikes}`);
    
    // Get full user details
    const member = await getUserById(topMember.id);
    
    if (!member) {
      console.error('[Weekly Selection] Failed to retrieve member details');
      return { success: false, reason: 'Member not found' };
    }
    
    // Set as featured member
    await setFeaturedMember(topMember.id);
    console.log(`[Weekly Selection] Successfully set ${topMember.name} as featured member`);
    
    // Send notification
    try {
      await notifyMemberOfWeek(member.name || 'Member', member.email || '');
      console.log('[Weekly Selection] Notification sent successfully');
    } catch (error) {
      console.error('[Weekly Selection] Failed to send notification:', error);
      // Don't fail the whole operation if notification fails
    }
    
    return {
      success: true,
      member: {
        id: topMember.id,
        name: topMember.name,
        testimonyCount: topMember.testimonyCount,
        totalLikes: topMember.totalLikes,
      }
    };
  } catch (error) {
    console.error('[Weekly Selection] Error during automatic selection:', error);
    return { success: false, reason: 'Selection failed', error };
  }
}

/**
 * Get engagement score for a specific member (for testing/debugging)
 */
export async function getMemberEngagementScore(userId: number) {
  const db = await import("./db").then(m => m.getDb());
  if (!db) {
    throw new Error("Database not available");
  }
  
  const { users, messages, likes, comments, sql, eq, ne, and, gte } = await import("../drizzle/schema").then(m => ({
    users: m.users,
    messages: m.messages,
    likes: m.likes,
    comments: m.comments,
    sql: require("drizzle-orm").sql,
    eq: require("drizzle-orm").eq,
    ne: require("drizzle-orm").ne,
    and: require("drizzle-orm").and,
    gte: require("drizzle-orm").gte,
  }));
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const result = await db
    .select({
      testimonyCount: sql<number>`COUNT(DISTINCT ${messages.id})`.as('testimonyCount'),
      totalLikes: sql<number>`COALESCE(SUM(DISTINCT ${likes.id}), 0)`.as('totalLikes'),
      commentCount: sql<number>`COUNT(DISTINCT ${comments.id})`.as('commentCount'),
    })
    .from(users)
    .leftJoin(messages, and(
      eq(messages.userId, users.id),
      ne(messages.room, "chatroom"),
      ne(messages.room, "prayer-room"),
      gte(messages.createdAt, sevenDaysAgo)
    ))
    .leftJoin(likes, eq(likes.messageId, messages.id))
    .leftJoin(comments, and(
      eq(comments.userId, users.id),
      gte(comments.createdAt, sevenDaysAgo)
    ))
    .where(eq(users.id, userId))
    .groupBy(users.id);
  
  if (result.length === 0) {
    return {
      testimonyCount: 0,
      totalLikes: 0,
      commentCount: 0,
      engagementScore: 0,
    };
  }
  
  const stats = result[0];
  const engagementScore = (stats.testimonyCount * 10) + (stats.totalLikes * 2) + (stats.commentCount * 3);
  
  return {
    ...stats,
    engagementScore,
  };
}
