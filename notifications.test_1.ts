import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Notification System", () => {
  let testUser1Id: number;
  let testUser2Id: number;
  let testMessageId: number;

  beforeAll(async () => {
    // Create test users
    await db.upsertUser({
      openId: "test-notif-user-1",
      name: "John Doe",
      email: "john.notif@test.com",
      loginMethod: "oauth",
    });
    const user1 = await db.getUserByOpenId("test-notif-user-1");
    testUser1Id = user1!.id;

    await db.upsertUser({
      openId: "test-notif-user-2",
      name: "Jane Smith",
      email: "jane.notif@test.com",
      loginMethod: "oauth",
    });
    const user2 = await db.getUserByOpenId("test-notif-user-2");
    testUser2Id = user2!.id;

    // Create a test message/testimony with unique content
    const uniqueContent = `Test testimony for notifications ${Date.now()}`;
    await db.createMessage({
      userId: testUser1Id,
      content: uniqueContent,
      room: "testimony",
    });
    const messages = await db.getMessagesByRoom("testimony", 50);
    const testMsg = messages.find(m => m.content === uniqueContent);
    if (!testMsg) throw new Error("Failed to create test message");
    testMessageId = testMsg.id;
  });

  describe("Comment Notifications", () => {
    it("should create notification when someone comments on user's testimony", async () => {
      const caller = appRouter.createCaller({
        req: {} as any,
        res: {} as any,
        user: { id: testUser2Id, name: "Jane Smith" } as any,
      });

      // User 2 comments on User 1's testimony
      await caller.comments.create({
        messageId: testMessageId,
        content: "Great testimony!",
      });

      // Check that User 1 received a notification
      const notifications = await db.getUserNotifications(testUser1Id, 50);
      const commentNotif = notifications.find(
        (n) => n.type === "comment" && n.relatedId === testMessageId
      );

      expect(commentNotif).toBeDefined();
      expect(commentNotif?.title).toBe("New comment on your testimony");
      expect(commentNotif?.message).toContain("Jane Smith");
      expect(commentNotif?.isRead).toBe(false);
      expect(commentNotif?.relatedUrl).toBe(`/testimony/${testMessageId}`);
    });

    it("should NOT create notification when user comments on their own testimony", async () => {
      const caller = appRouter.createCaller({
        req: {} as any,
        res: {} as any,
        user: { id: testUser1Id, name: "John Doe" } as any,
      });

      const notifsBefore = await db.getUserNotifications(testUser1Id, 50);
      const countBefore = notifsBefore.length;

      // User 1 comments on their own testimony
      await caller.comments.create({
        messageId: testMessageId,
        content: "Adding more context",
      });

      const notifsAfter = await db.getUserNotifications(testUser1Id, 50);
      const countAfter = notifsAfter.length;

      // Should not create a new notification
      expect(countAfter).toBe(countBefore);
    });
  });

  describe("Direct Message Notifications", () => {
    it("should create notification when user receives a direct message", async () => {
      const caller = appRouter.createCaller({
        req: {} as any,
        res: {} as any,
        user: { id: testUser1Id, name: "John Doe" } as any,
      });

      // User 1 sends DM to User 2
      await caller.directMessages.send({
        receiverId: testUser2Id,
        content: "Hello Jane!",
      });

      // Check that User 2 received a notification
      const notifications = await db.getUserNotifications(testUser2Id, 10);
      const dmNotif = notifications.find(
        (n) => n.type === "direct_message" && n.relatedId === testUser1Id
      );

      expect(dmNotif).toBeDefined();
      expect(dmNotif?.title).toBe("New direct message");
      expect(dmNotif?.message).toContain("John Doe");
      expect(dmNotif?.isRead).toBe(false);
      expect(dmNotif?.relatedUrl).toBe("/messages");
    });
  });

  describe("Notification Queries", () => {
    it("should get all user notifications", async () => {
      const caller = appRouter.createCaller({
        req: {} as any,
        res: {} as any,
        user: { id: testUser1Id } as any,
      });

      const notifications = await caller.notifications.getAll({ limit: 50 });

      expect(notifications).toBeDefined();
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBeGreaterThan(0);
    });

    it("should get unread notification count", async () => {
      const caller = appRouter.createCaller({
        req: {} as any,
        res: {} as any,
        user: { id: testUser1Id } as any,
      });

      const count = await caller.notifications.getUnreadCount();

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should mark notification as read", async () => {
      const caller = appRouter.createCaller({
        req: {} as any,
        res: {} as any,
        user: { id: testUser1Id } as any,
      });

      // Get an unread notification
      const notifications = await db.getUserNotifications(testUser1Id, 50);
      const unreadNotif = notifications.find((n) => !n.isRead);

      if (unreadNotif) {
        const result = await caller.notifications.markAsRead({
          notificationId: unreadNotif.id,
        });

        expect(result.success).toBe(true);

        // Verify it's marked as read
        const updated = await db.getUserNotifications(testUser1Id, 50);
        const readNotif = updated.find((n) => n.id === unreadNotif.id);
        expect(readNotif?.isRead).toBe(true);
      }
    });

    it("should mark all notifications as read", async () => {
      const caller = appRouter.createCaller({
        req: {} as any,
        res: {} as any,
        user: { id: testUser2Id } as any,
      });

      const result = await caller.notifications.markAllAsRead();

      expect(result.success).toBe(true);

      // Verify all are marked as read
      const count = await db.getUnreadNotificationCount(testUser2Id);
      expect(count).toBe(0);
    });
  });

  describe("Notification Authorization", () => {
    it("should require authentication to get notifications", async () => {
      const caller = appRouter.createCaller({
        req: {} as any,
        res: {} as any,
        user: null,
      });

      await expect(caller.notifications.getAll({ limit: 50 })).rejects.toThrow();
    });

    it("should require authentication to mark as read", async () => {
      const caller = appRouter.createCaller({
        req: {} as any,
        res: {} as any,
        user: null,
      });

      await expect(
        caller.notifications.markAsRead({ notificationId: 1 })
      ).rejects.toThrow();
    });
  });
});
