import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Likes Visibility Feature", () => {
  let testUserId1: number;
  let testUserId2: number;
  let testMessageId: number;

  beforeAll(async () => {
    // Create test users
    await db.upsertUser({
      openId: "test-user-likes-1",
      name: "Test User 1",
      email: "testuser1@example.com",
    });
    await db.upsertUser({
      openId: "test-user-likes-2",
      name: "Test User 2",
      email: "testuser2@example.com",
    });

    const user1 = await db.getUserByEmail("testuser1@example.com");
    const user2 = await db.getUserByEmail("testuser2@example.com");
    
    if (!user1 || !user2) throw new Error("Failed to create test users");
    
    testUserId1 = user1.id;
    testUserId2 = user2.id;

    // Create a test message
    await db.createMessage({
      userId: testUserId1,
      content: "Test message for likes",
      room: "testimony",
    });

    const messages = await db.getAllMessages(1);
    if (!messages || messages.length === 0) throw new Error("Failed to create test message");
    testMessageId = messages[0].id;
  });

  it("should return empty array when no likes exist", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const likes = await caller.messages.getLikes({ messageId: testMessageId });
    expect(Array.isArray(likes)).toBe(true);
    expect(likes.length).toBe(0);
  });

  it("should return list of users who liked a message", async () => {
    // Add likes from both users
    await db.likeMessage(testUserId1, testMessageId);
    await db.likeMessage(testUserId2, testMessageId);

    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const likes = await caller.messages.getLikes({ messageId: testMessageId });
    
    expect(likes.length).toBe(2);
    expect(likes[0]).toHaveProperty("userId");
    expect(likes[0]).toHaveProperty("userName");
    expect(likes[0]).toHaveProperty("userEmail");
    
    // Check that both users are in the list
    const userIds = likes.map(like => like.userId);
    expect(userIds).toContain(testUserId1);
    expect(userIds).toContain(testUserId2);
  });

  it("should include user profile information in likes", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const likes = await caller.messages.getLikes({ messageId: testMessageId });
    
    const user1Like = likes.find(like => like.userId === testUserId1);
    expect(user1Like).toBeDefined();
    expect(user1Like?.userName).toBe("Test User 1");
    expect(user1Like?.userEmail).toBe("testuser1@example.com");
  });

  it("should order likes by most recent first", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const likes = await caller.messages.getLikes({ messageId: testMessageId });
    
    // Verify likes are ordered (most recent first)
    expect(likes.length).toBe(2);
    expect(likes[0]).toHaveProperty("createdAt");
    expect(likes[1]).toHaveProperty("createdAt");
    
    // Most recent like should have a timestamp >= earlier like
    const firstLikeTime = new Date(likes[0].createdAt!).getTime();
    const secondLikeTime = new Date(likes[1].createdAt!).getTime();
    expect(firstLikeTime).toBeGreaterThanOrEqual(secondLikeTime);
  });
});
