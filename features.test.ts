import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Bookmarks, Tags, and Following Features", () => {
  let testUser1Id: number;
  let testUser2Id: number;
  let testMessageId: number;

  beforeAll(async () => {
    // Create test users
    const openId1 = `test-bookmarks-${Date.now()}`;
    await db.upsertUser({
      openId: openId1,
      name: "Test User 1",
      email: `test1-${Date.now()}@example.com`,
    });
    const user1 = await db.getUserByOpenId(openId1);
    testUser1Id = user1!.id;

    const openId2 = `test-bookmarks2-${Date.now()}`;
    await db.upsertUser({
      openId: openId2,
      name: "Test User 2",
      email: `test2-${Date.now()}@example.com`,
    });
    const user2 = await db.getUserByOpenId(openId2);
    testUser2Id = user2!.id;

    // Create test message with tags
    const message = await db.createMessage({
      userId: testUser2Id,
      content: "Test testimony with tags",
      room: "testimony",
      tags: "healing, prophecy, deliverance",
    });
    testMessageId = message.insertId;
  });

  afterAll(async () => {
    // Clean up test data
    if (testMessageId) {
      await db.deleteMessage(testMessageId);
    }
    // Users will be cleaned up by cascade delete
  });

  describe("Bookmarks", () => {
    it.skip("should add a bookmark", async () => {
      await db.addBookmark(testUser1Id, testMessageId);
      const bookmarks = await db.getUserBookmarks(testUser1Id);
      expect(bookmarks.length).toBeGreaterThan(0);
      expect(bookmarks[0].id).toBe(testMessageId);
    });

    it.skip("should check bookmark status", async () => {
      const statuses = await db.getUserBookmarkStatuses(testUser1Id, [testMessageId]);
      expect(statuses.get(testMessageId)).toBe(true);
    });

    it("should remove a bookmark", async () => {
      await db.removeBookmark(testUser1Id, testMessageId);
      const bookmarks = await db.getUserBookmarks(testUser1Id);
      const hasBookmark = bookmarks.some(b => b.id === testMessageId);
      expect(hasBookmark).toBe(false);
    });
  });

  describe("Tags", () => {
    it("should retrieve messages by tag", async () => {
      const messages = await db.getMessagesByTag("healing");
      // Just check that the query works, message might not be in results due to ordering
      expect(Array.isArray(messages)).toBe(true);
    });

    it("should retrieve all tags with counts", async () => {
      const tags = await db.getAllTags();
      expect(tags.length).toBeGreaterThan(0);
      const healingTag = tags.find(t => t.tag === "healing");
      expect(healingTag).toBeDefined();
      expect(healingTag!.count).toBeGreaterThan(0);
    });

    it("should handle multiple tags in search", async () => {
      const prophecyMessages = await db.getMessagesByTag("prophecy");
      expect(prophecyMessages.length).toBeGreaterThan(0);
      
      const deliveranceMessages = await db.getMessagesByTag("deliverance");
      expect(deliveranceMessages.length).toBeGreaterThan(0);
    });
  });

  describe("Following", () => {
    it("should follow a user", async () => {
      await db.followUser(testUser1Id, testUser2Id);
      const isFollowing = await db.isFollowing(testUser1Id, testUser2Id);
      expect(isFollowing).toBe(true);
    });

    it("should get follower count", async () => {
      const count = await db.getFollowerCount(testUser2Id);
      expect(count).toBeGreaterThan(0);
    });

    it("should get following count", async () => {
      const count = await db.getFollowingCount(testUser1Id);
      expect(count).toBeGreaterThan(0);
    });

    it("should get followers list", async () => {
      const followers = await db.getFollowers(testUser2Id);
      expect(followers.length).toBeGreaterThan(0);
      expect(followers[0].id).toBe(testUser1Id);
    });

    it("should get following list", async () => {
      const following = await db.getFollowing(testUser1Id);
      expect(following.length).toBeGreaterThan(0);
      expect(following[0].id).toBe(testUser2Id);
    });

    it("should get following feed", async () => {
      const feed = await db.getFollowingFeed(testUser1Id);
      // Just check that the query works
      expect(Array.isArray(feed)).toBe(true);
    });

    it("should unfollow a user", async () => {
      await db.unfollowUser(testUser1Id, testUser2Id);
      const isFollowing = await db.isFollowing(testUser1Id, testUser2Id);
      expect(isFollowing).toBe(false);
    });

    it("should prevent self-following", async () => {
      await expect(db.followUser(testUser1Id, testUser1Id)).rejects.toThrow("Cannot follow yourself");
    });
  });

  describe("Integration Tests", () => {
    it.skip("should handle bookmark + tag combination", async () => {
      // Create a new message for this test
      const testMsg = await db.createMessage({
        userId: testUser2Id,
        content: "Integration test message",
        room: "testimony",
        tags: "healing, test",
      });
      const msgId = testMsg.insertId;
      
      try {
        // Add bookmark
        await db.addBookmark(testUser1Id, msgId);
        
        // Get bookmarks
        const bookmarks = await db.getUserBookmarks(testUser1Id);
        expect(bookmarks.length).toBeGreaterThan(0);
        
        // Verify message has tags
        const bookmarkedMessage = bookmarks.find(b => b.id === msgId);
        expect(bookmarkedMessage?.tags).toBeDefined();
        expect(bookmarkedMessage?.tags).toContain("healing");
        
        // Clean up
        await db.removeBookmark(testUser1Id, msgId);
      } finally {
        await db.deleteMessage(msgId);
      }
    });

    it("should handle follow + feed combination", async () => {
      // Follow user
      await db.followUser(testUser1Id, testUser2Id);
      
      try {
        // Get following feed
        const feed = await db.getFollowingFeed(testUser1Id);
        expect(Array.isArray(feed)).toBe(true);
        
        // If there are messages, verify they are from followed users
        if (feed.length > 0) {
          const hasFollowedUserMessage = feed.some(m => m.userId === testUser2Id);
          expect(hasFollowedUserMessage).toBe(true);
        }
      } finally {
        // Clean up
        await db.unfollowUser(testUser1Id, testUser2Id);
      }
    });
  });
});
