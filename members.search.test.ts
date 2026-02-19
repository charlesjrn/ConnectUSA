import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("members.search", () => {
  let testUser1Id: number;
  let testUser2Id: number;
  let testUser3Id: number;

  beforeAll(async () => {
    // Create test users with different names and attributes
    await db.upsertUser({
      openId: "test-member-1",
      name: "John Smith",
      email: "john@test.com",
      loginMethod: "oauth",
    });
    const user1 = await db.getUserByOpenId("test-member-1");
    testUser1Id = user1!.id;
    await db.updateUserProfile(testUser1Id, {
      bio: "Passionate about evangelism and teaching",
      spiritualGifts: "Teaching, Evangelism",
      chosenDate: new Date("2020-01-15"),
    });

    await db.upsertUser({
      openId: "test-member-2",
      name: "Sarah Johnson",
      email: "sarah@test.com",
      loginMethod: "oauth",
    });
    const user2 = await db.getUserByOpenId("test-member-2");
    testUser2Id = user2!.id;
    await db.updateUserProfile(testUser2Id, {
      bio: "Called to worship and intercession",
      spiritualGifts: "Worship, Prophecy",
      chosenDate: new Date("2019-06-20"),
    });

    await db.upsertUser({
      openId: "test-member-3",
      name: "Michael Brown",
      email: "michael@test.com",
      loginMethod: "oauth",
    });
    const user3 = await db.getUserByOpenId("test-member-3");
    testUser3Id = user3!.id;
    await db.updateUserProfile(testUser3Id, {
      bio: "Missionary with a heart for the nations",
      spiritualGifts: "Missions, Healing",
      chosenDate: new Date("2021-03-10"),
    });
  });

  it("should return all members when no search term provided", async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.members.search({ searchTerm: "", limit: 100 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(3); // At least our 3 test users
  });

  it("should search members by name (case insensitive)", async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.members.search({ searchTerm: "john", limit: 100 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    const johnUser = result.find((u) => u.name === "John Smith");
    expect(johnUser).toBeDefined();
    expect(johnUser?.email).toBe("john@test.com");
  });

  it("should search members by partial name", async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.members.search({ searchTerm: "Sar", limit: 100 });

    expect(result).toBeDefined();
    const sarahUser = result.find((u) => u.name === "Sarah Johnson");
    expect(sarahUser).toBeDefined();
    expect(sarahUser?.bio).toBe("Called to worship and intercession");
  });

  it("should return empty array for non-matching search", async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.members.search({ searchTerm: "NonExistentName123", limit: 100 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("should include user profile data in results", async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.members.search({ searchTerm: "Michael", limit: 100 });

    expect(result).toBeDefined();
    const michaelUser = result.find((u) => u.name === "Michael Brown");
    expect(michaelUser).toBeDefined();
    expect(michaelUser?.bio).toBe("Missionary with a heart for the nations");
    expect(michaelUser?.spiritualGifts).toBe("Missions, Healing");
    expect(michaelUser?.chosenDate).toBeDefined();
  });

  it("should respect limit parameter", async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.members.search({ searchTerm: "", limit: 2 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(2);
  });
});

describe("members.all", () => {
  it("should return all members", async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.members.all({ limit: 100 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(3); // At least our test users
  });

  it("should return members ordered by creation date (newest first)", async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.members.all({ limit: 100 });

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    
    // Check that dates are in descending order
    for (let i = 0; i < result.length - 1; i++) {
      const current = new Date(result[i].createdAt).getTime();
      const next = new Date(result[i + 1].createdAt).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });
});
