import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

function createTestContext(userId: number, userOpenId: string, userName: string): TrpcContext {
  return {
    user: {
      id: userId,
      openId: userOpenId,
      email: `${userOpenId}@test.com`,
      name: userName,
      passwordHash: null,
      loginMethod: "oauth",
      role: "user",
      profilePicture: null,
      chosenDate: null,
      bio: null,
      spiritualGifts: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      location: null,
      latitude: null,
      longitude: null,
      lastSeen: new Date(),
    },
    req: {} as any,
    res: {} as any,
  };
}

describe("Follow System", () => {
  let testUser1: { id: number; openId: string };
  let testUser2: { id: number; openId: string };
  let testUser3: { id: number; openId: string };
  let ctx1: TrpcContext;
  let ctx2: TrpcContext;
  let ctx3: TrpcContext;

  beforeAll(async () => {
    // Create test users
    const openId1 = `test-follow-user1-${Date.now()}`;
    const openId2 = `test-follow-user2-${Date.now()}`;
    const openId3 = `test-follow-user3-${Date.now()}`;

    await db.upsertUser({
      openId: openId1,
      email: `followtest1-${Date.now()}@test.com`,
      name: "Follow Test User 1",
      loginMethod: "oauth",
    });

    await db.upsertUser({
      openId: openId2,
      email: `followtest2-${Date.now()}@test.com`,
      name: "Follow Test User 2",
      loginMethod: "oauth",
    });

    await db.upsertUser({
      openId: openId3,
      email: `followtest3-${Date.now()}@test.com`,
      name: "Follow Test User 3",
      loginMethod: "oauth",
    });

    const user1 = await db.getUserByOpenId(openId1);
    const user2 = await db.getUserByOpenId(openId2);
    const user3 = await db.getUserByOpenId(openId3);

    if (!user1 || !user2 || !user3) throw new Error("Failed to create test users");

    testUser1 = { id: user1.id, openId: openId1 };
    testUser2 = { id: user2.id, openId: openId2 };
    testUser3 = { id: user3.id, openId: openId3 };

    ctx1 = createTestContext(testUser1.id, testUser1.openId, "Follow Test User 1");
    ctx2 = createTestContext(testUser2.id, testUser2.openId, "Follow Test User 2");
    ctx3 = createTestContext(testUser3.id, testUser3.openId, "Follow Test User 3");
  });

  afterAll(async () => {
    // Cleanup - tests will clean up follows automatically via cascade delete
    // User cleanup happens at database level
  });

  it("should allow user to follow another user", async () => {
    const caller = appRouter.createCaller(ctx1);
    
    const result = await caller.follows.follow({ userId: testUser2.id });
    
    expect(result.success).toBe(true);
  });

  it("should check if user is following another user", async () => {
    const caller = appRouter.createCaller(ctx1);
    
    const isFollowing = await caller.follows.isFollowing({ userId: testUser2.id });
    
    expect(isFollowing).toBe(true);
  });

  it("should return false for not following", async () => {
    const caller = appRouter.createCaller(ctx1);
    
    const isFollowing = await caller.follows.isFollowing({ userId: testUser3.id });
    
    expect(isFollowing).toBe(false);
  });

  it("should get list of users being followed", async () => {
    const caller = appRouter.createCaller(ctx1);
    
    const following = await caller.follows.getFollowing();
    
    expect(following.length).toBeGreaterThan(0);
    expect(following.some(u => u.id === testUser2.id)).toBe(true);
  });

  it("should get list of followers", async () => {
    const caller = appRouter.createCaller(ctx2);
    
    const followers = await caller.follows.getFollowers();
    
    expect(followers.length).toBeGreaterThan(0);
    expect(followers.some(u => u.id === testUser1.id)).toBe(true);
  });

  it("should get follower and following counts", async () => {
    const caller = appRouter.createCaller(ctx1);
    
    const counts = await caller.follows.getCounts({ userId: testUser1.id });
    
    expect(counts.following).toBeGreaterThanOrEqual(1);
    expect(counts.followers).toBeGreaterThanOrEqual(0);
  });

  it("should allow user to unfollow another user", async () => {
    const caller = appRouter.createCaller(ctx1);
    
    const result = await caller.follows.unfollow({ userId: testUser2.id });
    
    expect(result.success).toBe(true);
  });

  it("should verify user is no longer following after unfollow", async () => {
    const caller = appRouter.createCaller(ctx1);
    
    const isFollowing = await caller.follows.isFollowing({ userId: testUser2.id });
    
    expect(isFollowing).toBe(false);
  });

  it("should prevent user from following themselves", async () => {
    const caller = appRouter.createCaller(ctx1);
    
    await expect(
      caller.follows.follow({ userId: testUser1.id })
    ).rejects.toThrow();
  });

  it("should handle multiple follows correctly", async () => {
    const caller = appRouter.createCaller(ctx1);
    
    // Follow user3 (user2 was already unfollowed in previous test)
    await caller.follows.follow({ userId: testUser3.id });
    
    const following = await caller.follows.getFollowing();
    
    expect(following.length).toBeGreaterThanOrEqual(1);
    expect(following.some(u => u.id === testUser3.id)).toBe(true);
    
    // Cleanup
    await caller.follows.unfollow({ userId: testUser3.id });
  });

  it("should update follower counts correctly", async () => {
    const caller3 = appRouter.createCaller(ctx3);
    
    // User3 follows User2
    await caller3.follows.follow({ userId: testUser2.id });
    
    const counts = await caller3.follows.getCounts({ userId: testUser2.id });
    
    // User2 should have at least 1 follower (user3)
    expect(counts.followers).toBeGreaterThanOrEqual(1);
    // User2's following count (how many they follow) can be 0
    expect(counts.following).toBeGreaterThanOrEqual(0);
    
    // Cleanup
    await caller3.follows.unfollow({ userId: testUser2.id });
  });
});
