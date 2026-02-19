import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("messages.like", () => {
  let testUserId: number;
  let testMessageId: number;

  beforeEach(async () => {
    // Create test user
    await db.upsertUser({
      openId: "test-like-user",
      name: "Like Test User",
      email: "liketest@example.com",
    });
    const user = await db.getUserByOpenId("test-like-user");
    if (!user) throw new Error("Failed to create test user");
    testUserId = user.id;

    // Create test message
    await db.createMessage({
      userId: testUserId,
      content: "Test message for likes " + Date.now(), // Make unique to avoid conflicts
      room: "testimony",
    });
    const messages = await db.getMessagesByRoom("testimony");
    const testMessage = messages[0]; // Get the most recent message
    if (!testMessage) throw new Error("Failed to create test message");
    testMessageId = testMessage.id;
  });

  it("allows authenticated users to like a message", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-like-user", name: "Like Test User", email: "liketest@example.com" },
      req: { headers: {} } as any,
      res: {} as any,
    });

    const result = await caller.messages.like({ messageId: testMessageId });
    expect(result.success).toBe(true);

    const likeStatus = await caller.messages.likeStatus({ messageId: testMessageId, userId: testUserId });
    expect(likeStatus.likeCount).toBe(1);
    expect(likeStatus.hasLiked).toBe(true);
  });

  it("allows users to unlike a message", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-like-user", name: "Like Test User", email: "liketest@example.com" },
      req: { headers: {} } as any,
      res: {} as any,
    });

    // First like
    await caller.messages.like({ messageId: testMessageId });
    
    // Then unlike
    const result = await caller.messages.unlike({ messageId: testMessageId });
    expect(result.success).toBe(true);

    const likeStatus = await caller.messages.likeStatus({ messageId: testMessageId, userId: testUserId });
    expect(likeStatus.likeCount).toBe(0);
    expect(likeStatus.hasLiked).toBe(false);
  });

  it("returns correct like count for multiple users", async () => {
    // Create second user
    await db.upsertUser({
      openId: "test-like-user-2",
      name: "Like Test User 2",
      email: "liketest2@example.com",
    });
    const user2 = await db.getUserByOpenId("test-like-user-2");
    if (!user2) throw new Error("Failed to create second test user");

    const caller1 = appRouter.createCaller({
      user: { id: testUserId, openId: "test-like-user", name: "Like Test User", email: "liketest@example.com" },
      req: { headers: {} } as any,
      res: {} as any,
    });

    const caller2 = appRouter.createCaller({
      user: { id: user2.id, openId: "test-like-user-2", name: "Like Test User 2", email: "liketest2@example.com" },
      req: { headers: {} } as any,
      res: {} as any,
    });

    // Both users like
    await caller1.messages.like({ messageId: testMessageId });
    await caller2.messages.like({ messageId: testMessageId });

    const likeStatus = await caller1.messages.likeStatus({ messageId: testMessageId, userId: testUserId });
    expect(likeStatus.likeCount).toBe(2);
  });

  it("prevents unauthenticated users from liking", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { headers: {} } as any,
      res: {} as any,
    });

    await expect(caller.messages.like({ messageId: testMessageId })).rejects.toThrow();
  });
});
