import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Weekly Digest", () => {
  let adminUserId: number;
  let regularUserId: number;

  beforeAll(async () => {
    // Create admin user
    await db.upsertUser({
      openId: "test-admin-digest",
      name: "Admin User",
      email: "admin-digest@test.com",
      role: "admin",
    });

    // Create regular user
    await db.upsertUser({
      openId: "test-regular-digest",
      name: "Regular User",
      email: "regular-digest@test.com",
    });

    const admin = await db.getUserByOpenId("test-admin-digest");
    const regular = await db.getUserByOpenId("test-regular-digest");
    
    if (!admin || !regular) throw new Error("Failed to create test users");
    
    adminUserId = admin.id;
    regularUserId = regular.id;
  });

  it("should get top testimonies for the week", async () => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const topTestimonies = await db.getTopTestimoniesForWeek(weekStart, 5);
    
    expect(Array.isArray(topTestimonies)).toBe(true);
    // Should have engagement scores
    topTestimonies.forEach(testimony => {
      expect(testimony).toHaveProperty('likesCount');
      expect(testimony).toHaveProperty('commentsCount');
      expect(testimony).toHaveProperty('engagementScore');
    });
  });

  it("should get new members for the week", async () => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const newMembers = await db.getNewMembersForWeek(weekStart, 5);
    
    expect(Array.isArray(newMembers)).toBe(true);
    newMembers.forEach(member => {
      expect(member).toHaveProperty('id');
      expect(member).toHaveProperty('name');
      expect(member.createdAt.getTime()).toBeGreaterThanOrEqual(weekStart.getTime());
    });
  });

  it("should only allow admins to trigger weekly digest", async () => {
    const regularCaller = appRouter.createCaller({
      user: { id: regularUserId, openId: "test-regular-digest", name: "Regular User", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    await expect(regularCaller.weeklyDigest.sendToAll()).rejects.toThrow("Only admins can trigger weekly digest");
  });

  it("should allow admins to trigger weekly digest", async () => {
    const adminCaller = appRouter.createCaller({
      user: { id: adminUserId, openId: "test-admin-digest", name: "Admin User", role: "admin" },
      req: {} as any,
      res: {} as any,
    });

    const result = await adminCaller.weeklyDigest.sendToAll();
    
    expect(result.success).toBe(true);
    expect(result).toHaveProperty('stats');
    expect(result.stats).toHaveProperty('totalUsers');
    expect(result.stats).toHaveProperty('successCount');
    expect(result.stats).toHaveProperty('failCount');
  });

  it("should calculate engagement scores correctly", async () => {
    // Create a test user and testimony
    await db.upsertUser({
      openId: "test-engagement-user",
      name: "Engagement Test",
      email: "engagement@test.com",
    });

    const user = await db.getUserByOpenId("test-engagement-user");
    if (!user) throw new Error("Failed to create test user");

    const caller = appRouter.createCaller({
      user: { id: user.id, openId: "test-engagement-user", name: "Engagement Test", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // Create a testimony
    await caller.messages.send({
      content: "Engagement Test\n\nTesting engagement",
      room: "testimony",
    });

    const messages = await db.getAllMessages(1);
    const testimony = messages[0];

    // Add likes and comments
    await db.likeMessage(user.id, testimony.id);
    await db.createComment({
      messageId: testimony.id,
      userId: user.id,
      content: "Test comment",
    });

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 1);

    const topTestimonies = await db.getTopTestimoniesForWeek(weekStart, 5);
    
    // Should have engagement score = (likes * 2) + (comments * 3)
    const ourTestimony = topTestimonies.find(t => t.id === testimony.id);
    if (ourTestimony) {
      expect(ourTestimony.engagementScore).toBe((ourTestimony.likesCount * 2) + (ourTestimony.commentsCount * 3));
    }
  });
});
