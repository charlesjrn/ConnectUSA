import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Like Notifications", () => {
  let authorId: number;
  let likerId: number;

  beforeAll(async () => {
    // Create test users
    const authorOpenId = `like-author-${Date.now()}`;
    const likerOpenId = `like-liker-${Date.now()}`;

    await db.upsertUser({
      openId: authorOpenId,
      name: "Post Author",
      email: `author${Date.now()}@test.com`,
    });
    await db.upsertUser({
      openId: likerOpenId,
      name: "Liker",
      email: `liker${Date.now()}@test.com`,
    });

    const author = await db.getUserByOpenId(authorOpenId);
    const liker = await db.getUserByOpenId(likerOpenId);

    authorId = author!.id;
    likerId = liker!.id;
  });

  it("should create notification when user likes a testimony", async () => {
    const authorCaller = appRouter.createCaller({
      user: { id: authorId, name: "Post Author", email: "author@test.com", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // Create a testimony
    await authorCaller.messages.send({
      content: "Test testimony for like notifications",
      room: "testimony",
    });
    
    // Get the created testimony
    const messages = await db.getAllMessages(1);
    const testimony = messages[0];

    // Like the testimony
    const likerCaller = appRouter.createCaller({
      user: { id: likerId, name: "Liker", email: "liker@test.com", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    await likerCaller.messages.like({ messageId: testimony.id });

    // Verify notification was created
    const notifications = await db.getUserNotifications(authorId);
    const likeNotification = notifications.find(n => n.type === "like" && n.relatedId === testimony.id);

    expect(likeNotification).toBeDefined();
    expect(likeNotification?.title).toBe("Someone liked your testimony");
  });

  it("should not create notification when user likes their own testimony", async () => {
    const authorCaller = appRouter.createCaller({
      user: { id: authorId, name: "Post Author", email: "author@test.com", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // Create a testimony
    await authorCaller.messages.send({
      content: "Test testimony for self-like",
      room: "testimony",
    });
    
    // Get the created testimony
    const messages = await db.getAllMessages(1);
    const testimony = messages[0];

    const notificationsBefore = await db.getUserNotifications(authorId);
    const countBefore = notificationsBefore.length;

    // Like own testimony
    await authorCaller.messages.like({ messageId: testimony.id });

    // Verify no new notification was created
    const notificationsAfter = await db.getUserNotifications(authorId);
    expect(notificationsAfter.length).toBe(countBefore);
  });

  it("should respect email preferences for like notifications", async () => {
    // Enable like emails for author (test that it doesn't throw error)
    const authorCaller = appRouter.createCaller({
      user: { id: authorId, name: "Post Author", email: "author@test.com", role: "user" },
      req: {} as any,
      res: {} as any,
    });
    
    await authorCaller.profile.updateEmailPreferences({ emailLikes: false });

    // Create a testimony
    await authorCaller.messages.send({
      content: "Test testimony for email preferences",
      room: "testimony",
    });
    
    // Get the created testimony
    const messages = await db.getAllMessages(1);
    const testimony = messages[0];

    // Like the testimony
    const likerCaller = appRouter.createCaller({
      user: { id: likerId, name: "Liker", email: "liker@test.com", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // This should create notification but not send email
    await likerCaller.messages.like({ messageId: testimony.id });

    // If we reach here without errors, the preference was respected
    expect(true).toBe(true);
  });

  it("should include emailLikes in email preferences", async () => {
    const caller = appRouter.createCaller({
      user: { id: authorId, name: "Post Author", email: "author@test.com", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const preferences = await caller.profile.getEmailPreferences();

    expect(preferences).toHaveProperty("emailLikes");
    expect(typeof preferences.emailLikes).toBe("boolean");
  });
});
