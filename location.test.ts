import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import { calculateDistance } from "./geocoding";

describe("Location Features", () => {
  let testUserId: number;
  let testUser2Id: number;

  beforeAll(async () => {
    // Create test user with location
    await db.upsertUser({
      openId: "test-location-user-1",
      name: "Location Test User 1",
      email: "locationtest1@example.com",
      loginMethod: "oauth",
    });

    const user1 = await db.getUserByOpenId("test-location-user-1");
    testUserId = user1!.id;

    // Set location with coordinates (New York)
    await db.updateUserProfile(testUserId, {
      location: "New York, NY",
      latitude: "40.7128",
      longitude: "-74.0060",
    });

    // Create second test user with location
    await db.upsertUser({
      openId: "test-location-user-2",
      name: "Location Test User 2",
      email: "locationtest2@example.com",
      loginMethod: "oauth",
    });

    const user2 = await db.getUserByOpenId("test-location-user-2");
    testUser2Id = user2!.id;

    // Set location with coordinates (Philadelphia - about 95 miles from NY)
    await db.updateUserProfile(testUser2Id, {
      location: "Philadelphia, PA",
      latitude: "39.9526",
      longitude: "-75.1652",
    });
  });

  afterAll(async () => {
    // Clean up test users
    await db.deleteUser(testUserId);
    await db.deleteUser(testUser2Id);
  });

  describe("Distance Calculation", () => {
    it("should calculate distance between two points correctly", () => {
      // Distance between New York and Philadelphia
      const distance = calculateDistance(40.7128, -74.006, 39.9526, -75.1652);
      
      // Should be approximately 80-85 miles
      expect(distance).toBeGreaterThan(75);
      expect(distance).toBeLessThan(85);
    });

    it("should return 0 for same location", () => {
      const distance = calculateDistance(40.7128, -74.006, 40.7128, -74.006);
      expect(distance).toBe(0);
    });
  });

  describe("getUsersWithLocations", () => {
    it("should return users who have set their location", async () => {
      const users = await db.getUsersWithLocations();
      
      expect(users.length).toBeGreaterThanOrEqual(2);
      
      const testUser = users.find(u => u.id === testUserId);
      expect(testUser).toBeDefined();
      expect(testUser?.location).toBe("New York, NY");
      expect(testUser?.latitude).toBe("40.7128000");
      expect(testUser?.longitude).toBe("-74.0060000");
    });

    it("should not return users without coordinates", async () => {
      // Create user without location
      await db.upsertUser({
        openId: "test-no-location",
        name: "No Location User",
        email: "nolocation@example.com",
        loginMethod: "oauth",
      });

      const noLocUser = await db.getUserByOpenId("test-no-location");
      const users = await db.getUsersWithLocations();
      
      expect(users.find(u => u.id === noLocUser!.id)).toBeUndefined();
      
      // Clean up
      await db.deleteUser(noLocUser!.id);
    });
  });

  describe("members.getWithLocations", () => {
    it("should return all members with locations", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const members = await caller.members.getWithLocations();
      
      expect(Array.isArray(members)).toBe(true);
      expect(members.length).toBeGreaterThanOrEqual(2);
      
      const testMember = members.find(m => m.id === testUserId);
      expect(testMember).toBeDefined();
      expect(testMember?.location).toBe("New York, NY");
    });
  });

  describe("members.getNearby", () => {
    it("should return nearby members sorted by distance", async () => {
      // Verify user profiles have coordinates set
      const user1Profile = await db.getUserById(testUserId);
      const user2Profile = await db.getUserById(testUser2Id);
      expect(user1Profile?.latitude).toBeTruthy();
      expect(user2Profile?.latitude).toBeTruthy();

      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: "test-location-user-1",
          name: "Location Test User 1",
          email: "locationtest1@example.com",
          role: "user",
        },
        req: {} as any,
        res: {} as any,
      });

      const nearbyMembers = await caller.members.getNearby({
        maxDistance: 100,
        limit: 50,
      });

      expect(Array.isArray(nearbyMembers)).toBe(true);
      
      // Should not include the current user
      expect(nearbyMembers.find(m => m.id === testUserId)).toBeUndefined();
      
      // Should include user 2 (within 100 miles)
      const user2 = nearbyMembers.find(m => m.id === testUser2Id);
      expect(user2).toBeDefined();
      if (user2) {
        expect(user2.distance).toBeGreaterThan(70);
        expect(user2.distance).toBeLessThan(100);
      }
    });

    it("should filter by max distance", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: "test-location-user-1",
          name: "Location Test User 1",
          email: "locationtest1@example.com",
          role: "user",
        },
        req: {} as any,
        res: {} as any,
      });

      const nearbyMembers = await caller.members.getNearby({
        maxDistance: 50, // Philadelphia is ~95 miles away
        limit: 10,
      });

      // Should not include user 2 (too far)
      expect(nearbyMembers.find(m => m.id === testUser2Id)).toBeUndefined();
    });

    it("should return empty array if user has no location", async () => {
      // Create user without location
      await db.upsertUser({
        openId: "test-no-coords",
        name: "No Coords User",
        email: "nocoords@example.com",
        loginMethod: "oauth",
      });

      const noCoordsUser = await db.getUserByOpenId("test-no-coords");

      const caller = appRouter.createCaller({
        user: {
          id: noCoordsUser!.id,
          openId: "test-no-coords",
          name: "No Coords User",
          email: "nocoords@example.com",
          role: "user",
        },
        req: {} as any,
        res: {} as any,
      });

      const nearbyMembers = await caller.members.getNearby({
        maxDistance: 100,
        limit: 10,
      });

      expect(nearbyMembers).toEqual([]);
      
      // Clean up
      await db.deleteUser(noCoordsUser!.id);
    });
  });
});
