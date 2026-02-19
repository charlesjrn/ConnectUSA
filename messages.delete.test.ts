import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("messages.delete", () => {
  let testUserId: number;
  let otherUserId: number;
  let testMessageId: number;

  beforeAll(async () => {
    // Create test users
    await db.upsertUser({
      openId: "test-delete-user",
      name: "Test Delete User",
      email: "delete@test.com",
      loginMethod: "manus",
    });
    const testUser = await db.getUserByOpenId("test-delete-user");
    if (!testUser) throw new Error("Failed to create test user");
    testUserId = testUser.id;

    await db.upsertUser({
      openId: "other-delete-user",
      name: "Other Delete User",
      email: "other@test.com",
      loginMethod: "manus",
    });
    const otherUser = await db.getUserByOpenId("other-delete-user");
    if (!otherUser) throw new Error("Failed to create other user");
    otherUserId = otherUser.id;

    // Create a test message
    await db.createMessage({
      userId: testUserId,
      content: "Test message to delete",
      room: "testimony",
    });

    // Get the message ID
    const messages = await db.getMessagesByRoom("testimony");
    const testMessage = messages.find(m => m.userId === testUserId && m.content === "Test message to delete");
    if (!testMessage) {
      throw new Error("Failed to create test message");
    }
    testMessageId = testMessage.id;
  });

  it("should allow user to delete their own message", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-delete-user", name: "Test Delete User", email: "delete@test.com", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.messages.delete({ messageId: testMessageId });
    expect(result.success).toBe(true);

    // Verify message is deleted
    const message = await db.getMessageById(testMessageId);
    expect(message).toBeNull();
  });

  it("should not allow user to delete another user's message", async () => {
    // Create another message for this test
    await db.createMessage({
      userId: testUserId,
      content: "Another test message",
      room: "testimony",
    });

    const messages = await db.getMessagesByRoom("testimony");
    const newMessage = messages.find(m => m.userId === testUserId && m.content === "Another test message");
    if (!newMessage) {
      throw new Error("Failed to create test message");
    }

    const caller = appRouter.createCaller({
      user: { id: otherUserId, openId: "other-delete-user", name: "Other Delete User", email: "other@test.com", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    await expect(caller.messages.delete({ messageId: newMessage.id })).rejects.toThrow("You can only delete your own posts");
  });

  it("should allow admin to delete any message", async () => {
    // Create a message from test user
    await db.createMessage({
      userId: testUserId,
      content: "Message for admin to delete",
      room: "testimony",
    });

    const messages = await db.getMessagesByRoom("testimony");
    const adminTestMessage = messages.find(m => m.userId === testUserId && m.content === "Message for admin to delete");
    if (!adminTestMessage) {
      throw new Error("Failed to create test message");
    }

    // Admin user tries to delete it
    const adminCaller = appRouter.createCaller({
      user: { id: otherUserId, openId: "admin-user", name: "Admin User", email: "admin@test.com", role: "admin" },
      req: {} as any,
      res: {} as any,
    });

    const result = await adminCaller.messages.delete({ messageId: adminTestMessage.id });
    expect(result.success).toBe(true);

    // Verify message is deleted
    const message = await db.getMessageById(adminTestMessage.id);
    expect(message).toBeNull();
  });

  it("should return error for non-existent message", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-delete-user", name: "Test Delete User", email: "delete@test.com", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    await expect(caller.messages.delete({ messageId: 999999 })).rejects.toThrow("Message not found");
  });
});
