import * as db from "./db";
import { sendEmailNotification } from "./_core/emailNotification";
import { generateWeeklyPrayerDigestEmailTemplate } from "./_core/email-templates/weeklyPrayerDigest";

export async function sendWeeklyPrayerDigest() {
  try {
    console.log("[Weekly Digest] Starting weekly prayer digest generation...");
    
    // Get digest data
    const digestData = await db.getWeeklyPrayerDigestData();
    
    // Get all users who have email digest enabled
    const users = await db.getAllUsers();
    const eligibleUsers = users.filter(user => {
      const prefs = db.getUserEmailPreferences(user.id);
      return user.email && prefs;
    });
    
    console.log(`[Weekly Digest] Found ${eligibleUsers.length} eligible users`);
    
    // Get date range for this week
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weekStart = oneWeekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const weekEnd = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    // Send digest to each user
    let sentCount = 0;
    for (const user of eligibleUsers) {
      try {
        const prefs = await db.getUserEmailPreferences(user.id);
        if (!prefs.emailWeeklyDigest) continue;
        
        const emailHtml = generateWeeklyPrayerDigestEmailTemplate({
          recipientName: user.name || 'Member',
          urgentPrayers: digestData.urgentPrayers.map(p => ({
            id: p.id,
            content: p.content,
            authorName: p.authorName || 'Anonymous',
            prayerCount: p.prayerCount,
          })),
          answeredPrayers: digestData.answeredPrayers.map(p => ({
            id: p.id,
            content: p.content,
            authorName: p.authorName || 'Anonymous',
            answeredTestimony: p.answeredTestimony || '',
          })),
          mostPrayedFor: digestData.mostPrayedFor.map(p => ({
            id: p.id,
            content: p.content,
            authorName: p.authorName || 'Anonymous',
            prayerCount: p.prayerCount,
          })),
          weekStart,
          weekEnd,
        });
        
        await sendEmailNotification({
          to: user.email!,
          subject: `Your Weekly Prayer Digest from Chosen Connect`,
          htmlContent: emailHtml,
        });
        
        sentCount++;
      } catch (error) {
        console.error(`[Weekly Digest] Failed to send to ${user.email}:`, error);
      }
    }
    
    console.log(`[Weekly Digest] Successfully sent ${sentCount} digests`);
    return { success: true, sentCount };
  } catch (error) {
    console.error("[Weekly Digest] Error generating digest:", error);
    throw error;
  }
}

// This function can be called manually or scheduled via cron
export async function triggerWeeklyDigest() {
  console.log("[Weekly Digest] Manual trigger received");
  return await sendWeeklyPrayerDigest();
}
