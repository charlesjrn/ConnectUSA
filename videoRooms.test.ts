import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Video Rooms", () => {
  let testUser: any;
  let testContext: any;

  beforeEach(async () => {
    // Create a test user
    await db.upsertUser({
      openId: "test-video-user",
      name: "Test Video User",
      email: "testvideo@example.com",
    });

    const user = await db.getUserByOpenId("test-video-user");
    testUser = user;

    testContext = {
      user: testUser,
    };
  });

  it("should create a video room", async () => {
    const caller = appRouter.createCaller(testContext);
    
    const result = await caller.videoRooms.create({
      roomName: "Sunday Fellowship",
      description: "Weekly fellowship meeting",
      maxParticipants: 20,
    });

    expect(result.success).toBe(true);
    expect(result.roomUrl).toContain("https://meet.jit.si/ChosenConnect-");
  });

  it("should retrieve active video rooms", async () => {
    const caller = appRouter.createCaller(testContext);
    
    // Create a room
    await caller.videoRooms.create({
      roomName: "Prayer Meeting",
      description: "Evening prayer session",
    });

    // Get active rooms
    const rooms = await caller.videoRooms.getActive();
    
    expect(rooms.length).toBeGreaterThan(0);
    const prayerRoom = rooms.find((r: any) => r.roomName === "Prayer Meeting");
    expect(prayerRoom).toBeDefined();
    expect(prayerRoom?.hostName).toBe("Test Video User");
    expect(prayerRoom?.isActive).toBe(true);
  });

  it("should get video room by ID", async () => {
    const caller = appRouter.createCaller(testContext);
    
    // Create a room
    await caller.videoRooms.create({
      roomName: "Bible Study",
    });

    // Get all rooms to find the ID
    const rooms = await caller.videoRooms.getActive();
    const bibleStudyRoom = rooms.find((r: any) => r.roomName === "Bible Study");
    const roomId = bibleStudyRoom?.id;

    // Get specific room
    const room = await caller.videoRooms.getById({ id: roomId });
    
    expect(room).not.toBeNull();
    expect(room?.roomName).toBe("Bible Study");
  });

  it("should allow host to end their own room", async () => {
    const caller = appRouter.createCaller(testContext);
    
    // Create a room
    await caller.videoRooms.create({
      roomName: "Worship Night",
    });

    // Get the room ID
    const rooms = await caller.videoRooms.getActive();
    const roomId = rooms.find((r: any) => r.roomName === "Worship Night")?.id;

    // End the room
    const result = await caller.videoRooms.end({ id: roomId });
    
    expect(result.success).toBe(true);

    // Verify room is no longer active
    const activeRooms = await caller.videoRooms.getActive();
    const stillActive = activeRooms.find((r: any) => r.id === roomId);
    expect(stillActive).toBeUndefined();
  });

  it("should prevent non-host from ending room", async () => {
    const caller = appRouter.createCaller(testContext);
    
    // Create a room
    await caller.videoRooms.create({
      roomName: "Youth Group",
    });

    // Get the room ID
    const rooms = await caller.videoRooms.getActive();
    const roomId = rooms.find((r: any) => r.roomName === "Youth Group")?.id;

    // Create another user
    await db.upsertUser({
      openId: "test-other-user-2",
      name: "Other User 2",
      email: "other2@example.com",
    });
    const otherUser = await db.getUserByOpenId("test-other-user-2");

    // Try to end room as different user
    const otherCaller = appRouter.createCaller({ user: otherUser });
    
    await expect(
      otherCaller.videoRooms.end({ id: roomId })
    ).rejects.toThrow();
  });

  it("should allow host to delete their own room", async () => {
    const caller = appRouter.createCaller(testContext);
    
    // Create a room
    await caller.videoRooms.create({
      roomName: "Testimony Night",
    });

    // Get the room ID
    const rooms = await caller.videoRooms.getActive();
    const roomId = rooms.find((r: any) => r.roomName === "Testimony Night")?.id;

    // Delete the room
    const result = await caller.videoRooms.delete({ id: roomId });
    
    expect(result.success).toBe(true);

    // Verify room is deleted
    const room = await caller.videoRooms.getById({ id: roomId });
    expect(room).toBeNull();
  });

  it("should prevent non-host from deleting room", async () => {
    const caller = appRouter.createCaller(testContext);
    
    // Create a room
    await caller.videoRooms.create({
      roomName: "Missions Meeting",
    });

    // Get the room ID
    const rooms = await caller.videoRooms.getActive();
    const roomId = rooms.find((r: any) => r.roomName === "Missions Meeting")?.id;

    // Create another user
    await db.upsertUser({
      openId: "test-another-user-3",
      name: "Another User 3",
      email: "another3@example.com",
    });
    const anotherUser = await db.getUserByOpenId("test-another-user-3");

    // Try to delete room as different user
    const anotherCaller = appRouter.createCaller({ user: anotherUser });
    
    await expect(
      anotherCaller.videoRooms.delete({ id: roomId })
    ).rejects.toThrow();
  });

  it("should require authentication to create room", async () => {
    const publicCaller = appRouter.createCaller({ user: null });
    
    await expect(
      publicCaller.videoRooms.create({
        roomName: "Test Room",
      })
    ).rejects.toThrow();
  });

  it("should allow public access to view active rooms", async () => {
    const caller = appRouter.createCaller(testContext);
    
    // Create a room
    await caller.videoRooms.create({
      roomName: "Public Fellowship",
    });

    // Public user should be able to view
    const publicCaller = appRouter.createCaller({ user: null });
    const rooms = await publicCaller.videoRooms.getActive();
    
    expect(rooms.length).toBeGreaterThan(0);
    const publicRoom = rooms.find((r: any) => r.roomName === "Public Fellowship");
    expect(publicRoom).toBeDefined();
    expect(publicRoom?.hostName).toBe("Test Video User");
  });
});
