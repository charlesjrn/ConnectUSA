import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Search and Comment Reactions Features", () => {
  let testUserId: number;
  let testMessageId: number;
  let testCommentId: number;

  beforeEach(async () => {
    // Create test user
    await db.upsertUser({
      openId: "test-search-reactions-user",
      name: "Test User",
      email: "test@example.com",
    });
    const user = await db.getUserByEmail("test@example.com");
    testUserId = user!.id;

    // Create test message
    await db.createMessage({
      userId: testUserId,
      content: "This is a testimony about divine healing and miracles",
      room: "testimony",
    });
    const messages = await db.getAllMessages(1);
    testMessageId = messages[0].id;

    // Create test comment
    await db.createComment({
      messageId: testMessageId,
      userId: testUserId,
      content: "This is a test comment about faith and prayer",
    });
    const comments = await db.getCommentsByMessageId(testMessageId);
    testCommentId = comments[0].id;
  });

  afterEach(async () => {
    // Clean up reactions after each test
    await db.removeCommentReaction(testUserId, testCommentId, "praying");
    await db.removeCommentReaction(testUserId, testCommentId, "amen");
    await db.removeCommentReaction(testUserId, testCommentId, "blessed");
  });

  describe("Testimony Search", () => {
    it("should search testimonies by keyword", async () => {
      const caller = appRouter.createCaller({
        user: undefined,
        req: {} as any,
        res: {} as any,
      });

      const results = await caller.messages.search({ searchTerm: "healing" });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].content).toContain("healing");
    });

    it("should return all messages when search term is empty", async () => {
      const caller = appRouter.createCaller({
        user: undefined,
        req: {} as any,
        res: {} as any,
      });

      const results = await caller.messages.search({ searchTerm: "" });
      expect(results.length).toBeGreaterThan(0);
    });

    it("should be case-insensitive", async () => {
      const caller = appRouter.createCaller({
        user: undefined,
        req: {} as any,
        res: {} as any,
      });

      const results = await caller.messages.search({ searchTerm: "HEALING" });
      expect(results.length).toBeGreaterThan(0);
    });

    it("should search across entire content", async () => {
      const caller = appRouter.createCaller({
        user: undefined,
        req: {} as any,
        res: {} as any,
      });

      const results = await caller.messages.search({ searchTerm: "miracles" });
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("Comment Reactions", () => {
    it("should allow user to add a reaction to a comment", async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, name: "Test User", email: "test@example.com", role: "user" } as any,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.comments.addReaction({
        commentId: testCommentId,
        reactionType: "praying",
      });

      expect(result.success).toBe(true);
    });

    it("should get correct reaction counts for comments", async () => {
      // Add reactions
      await db.addCommentReaction(testUserId, testCommentId, "praying");
      await db.addCommentReaction(testUserId, testCommentId, "amen");

      const caller = appRouter.createCaller({
        user: undefined,
        req: {} as any,
        res: {} as any,
      });

      const counts = await caller.comments.getReactionCounts({
        commentIds: [testCommentId],
      });

      expect(counts[testCommentId].praying).toBe(1);
      expect(counts[testCommentId].amen).toBe(1);
      expect(counts[testCommentId].blessed).toBe(0);
    });

    it("should get user reactions for comments", async () => {
      // Add reactions
      await db.addCommentReaction(testUserId, testCommentId, "praying");
      await db.addCommentReaction(testUserId, testCommentId, "blessed");

      const caller = appRouter.createCaller({
        user: { id: testUserId, name: "Test User", email: "test@example.com", role: "user" } as any,
        req: {} as any,
        res: {} as any,
      });

      const reactions = await caller.comments.getUserReactions({
        commentIds: [testCommentId],
      });

      expect(reactions[testCommentId]).toContain("praying");
      expect(reactions[testCommentId]).toContain("blessed");
      expect(reactions[testCommentId]).not.toContain("amen");
    });

    it("should allow user to remove a reaction from a comment", async () => {
      // Add reaction first
      await db.addCommentReaction(testUserId, testCommentId, "praying");

      const caller = appRouter.createCaller({
        user: { id: testUserId, name: "Test User", email: "test@example.com", role: "user" } as any,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.comments.removeReaction({
        commentId: testCommentId,
        reactionType: "praying",
      });

      expect(result.success).toBe(true);

      // Verify reaction was removed
      const counts = await caller.comments.getReactionCounts({
        commentIds: [testCommentId],
      });
      expect(counts[testCommentId].praying).toBe(0);
    });

    it("should handle multiple reaction types on same comment", async () => {
      // Add multiple reactions
      await db.addCommentReaction(testUserId, testCommentId, "praying");
      await db.addCommentReaction(testUserId, testCommentId, "amen");
      await db.addCommentReaction(testUserId, testCommentId, "blessed");

      const caller = appRouter.createCaller({
        user: undefined,
        req: {} as any,
        res: {} as any,
      });

      const counts = await caller.comments.getReactionCounts({
        commentIds: [testCommentId],
      });

      expect(counts[testCommentId].praying).toBe(1);
      expect(counts[testCommentId].amen).toBe(1);
      expect(counts[testCommentId].blessed).toBe(1);
    });

    it("should require authentication to add comment reactions", async () => {
      const caller = appRouter.createCaller({
        user: undefined,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.comments.addReaction({
          commentId: testCommentId,
          reactionType: "praying",
        })
      ).rejects.toThrow();
    });

    it("should require authentication to remove comment reactions", async () => {
      const caller = appRouter.createCaller({
        user: undefined,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.comments.removeReaction({
          commentId: testCommentId,
          reactionType: "praying",
        })
      ).rejects.toThrow();
    });
  });
});
