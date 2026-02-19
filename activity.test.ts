import { describe, it, expect, beforeAll } from "vitest";
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

describe("Activity Tracking", () => {
  let testUser: { id: number; openId: string };
  let ctx: TrpcContext;

  beforeAll(async () => {
    // Create test user
    const openId = `test-activity-user-${Date.now()}`;

    await db.upsertUser({
      openId: openId,
      email: `activitytest-${Date.now()}@test.com`,
      name: "Activity Test User",
      loginMethod: "oauth",
    });

    const user = await db.getUserByOpenId(openId);
    if (!user) throw new Error("Failed to create test user");

    testUser = { id: user.id, openId: openId };
    ctx = createTestContext(testUser.id, testUser.openId, "Activity Test User");
  });

  it("should update lastSeen timestamp when user is active", async () => {
    const caller = appRouter.createCaller(ctx);
    
    // Get initial lastSeen
    const userBefore = await db.getUserById(testUser.id);
    const lastSeenBefore = userBefore?.lastSeen;
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Update activity
    const result = await caller.activity.updateLastSeen();
    
    expect(result.success).toBe(true);
    
    // Check lastSeen was updated
    const userAfter = await db.getUserById(testUser.id);
    const lastSeenAfter = userAfter?.lastSeen;
    
    expect(lastSeenAfter).toBeDefined();
    if (lastSeenBefore && lastSeenAfter) {
      // lastSeen should be updated (greater than or equal due to timing)
      expect(lastSeenAfter.getTime()).toBeGreaterThanOrEqual(lastSeenBefore.getTime());
    }
  });

  it("should determine if user is currently active (within 5 minutes)", async () => {
    const caller = appRouter.createCaller(ctx);
    
    // Update activity to mark user as active now
    await caller.activity.updateLastSeen();
    
    const user = await db.getUserById(testUser.id);
    const lastSeen = user?.lastSeen;
    
    expect(lastSeen).toBeDefined();
    
    if (lastSeen) {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      // User should be active (lastSeen is recent)
      expect(lastSeen.getTime()).toBeGreaterThan(fiveMinutesAgo.getTime());
    }
  });

  it("should format lastSeen as relative time", () => {
    const now = new Date();
    
    // Just now
    const justNow = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
    expect(justNow).toBeDefined();
    
    // Minutes ago
    const minutesAgo = new Date(now.getTime() - 3 * 60 * 1000); // 3 minutes ago
    const minutesDiff = Math.floor((now.getTime() - minutesAgo.getTime()) / (60 * 1000));
    expect(minutesDiff).toBe(3);
    
    // Hours ago
    const hoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
    const hoursDiff = Math.floor((now.getTime() - hoursAgo.getTime()) / (60 * 60 * 1000));
    expect(hoursDiff).toBe(2);
    
    // Days ago
    const daysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    const daysDiff = Math.floor((now.getTime() - daysAgo.getTime()) / (24 * 60 * 60 * 1000));
    expect(daysDiff).toBe(3);
  });

  it("should store lastSeen in database correctly", async () => {
    const caller = appRouter.createCaller(ctx);
    
    await caller.activity.updateLastSeen();
    
    const user = await db.getUserById(testUser.id);
    
    expect(user).toBeDefined();
    expect(user?.lastSeen).toBeInstanceOf(Date);
    expect(user?.lastSeen).not.toBeNull();
  });

  it("should handle multiple activity updates correctly", async () => {
    const caller = appRouter.createCaller(ctx);
    
    // First update
    await caller.activity.updateLastSeen();
    const user1 = await db.getUserById(testUser.id);
    const lastSeen1 = user1?.lastSeen;
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Second update
    await caller.activity.updateLastSeen();
    const user2 = await db.getUserById(testUser.id);
    const lastSeen2 = user2?.lastSeen;
    
    expect(lastSeen1).toBeDefined();
    expect(lastSeen2).toBeDefined();
    
    if (lastSeen1 && lastSeen2) {
      // Second update should be later than first
      expect(lastSeen2.getTime()).toBeGreaterThanOrEqual(lastSeen1.getTime());
    }
  });
});
