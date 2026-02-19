import { describe, it, expect, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

// Mock the db module before importing the router
vi.mock("./db", () => ({
  createVideoRoom: vi.fn(),
  getActiveVideoRooms: vi.fn(),
  getVideoRoomById: vi.fn(),
  endVideoRoom: vi.fn(),
  deleteVideoRoom: vi.fn(),
  // Other db functions needed by the router module
  addEmailSubscriber: vi.fn(),
  getEmailSubscriberCount: vi.fn(),
  getEmailSubscribers: vi.fn(),
  getActiveMembershipByUserId: vi.fn(),
  getAllFounderMembers: vi.fn(),
  getUserDonorBadge: vi.fn(),
  getFeaturedMember: vi.fn(),
  getMemberSpotlight: vi.fn(),
  setFeaturedMember: vi.fn(),
  clearFeaturedMember: vi.fn(),
  getAllMembersForAdmin: vi.fn(),
  getUserById: vi.fn(),
  getTodaysVerse: vi.fn(),
  getAllVerses: vi.fn(),
  getUserFavoriteVerses: vi.fn(),
  isVerseFavorited: vi.fn(),
  unfavoriteVerse: vi.fn(),
  favoriteVerse: vi.fn(),
  getActivePaidEvents: vi.fn(),
  getPaidEventById: vi.fn(),
  getEventAttendeeCount: vi.fn(),
  createEventRegistration: vi.fn(),
  getUserEventRegistrations: vi.fn(),
  createPaidEvent: vi.fn(),
  updatePaidEvent: vi.fn(),
  createDonation: vi.fn(),
  getUserDonations: vi.fn(),
  getDonationAnalytics: vi.fn(),
  getAllDonations: vi.fn(),
}));

import { appRouter } from "./routers";
import * as db from "./db";

function createProtectedContext(userId = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `user-${userId}`,
      email: `user${userId}@example.com`,
      name: `User ${userId}`,
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("videoRoom router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("videoRoom.create", () => {
    it("should create a video room with correct parameters", async () => {
      const mockCreate = vi.mocked(db.createVideoRoom);
      mockCreate.mockResolvedValue({} as any);

      const caller = appRouter.createCaller(createProtectedContext(1));
      const result = await caller.videoRoom.create({
        roomName: "🙏 Prayer: Healing",
        description: "Private prayer session",
        maxParticipants: 2,
      });

      expect(result.success).toBe(true);
      expect(result.roomUrl).toContain("https://meet.jit.si/ChosenConnect-");
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          roomName: "🙏 Prayer: Healing",
          description: "Private prayer session",
          maxParticipants: 2,
          hostId: 1,
          hostName: "User 1",
        })
      );
    });

    it("should create a room without optional fields", async () => {
      const mockCreate = vi.mocked(db.createVideoRoom);
      mockCreate.mockResolvedValue({} as any);

      const caller = appRouter.createCaller(createProtectedContext(2));
      const result = await caller.videoRoom.create({
        roomName: "Quick Prayer",
      });

      expect(result.success).toBe(true);
      expect(result.roomUrl).toBeDefined();
    });

    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createPublicContext());

      await expect(
        caller.videoRoom.create({ roomName: "Test" })
      ).rejects.toThrow();
    });
  });

  describe("videoRoom.getActive", () => {
    it("should return active rooms", async () => {
      const mockRooms = [
        {
          id: 1,
          roomName: "🙏 Prayer: Healing",
          roomUrl: "https://meet.jit.si/ChosenConnect-123",
          hostId: 1,
          hostName: "User 1",
          maxParticipants: 2,
          isActive: true,
          createdAt: new Date(),
        },
      ];
      const mockGetActive = vi.mocked(db.getActiveVideoRooms);
      mockGetActive.mockResolvedValue(mockRooms as any);

      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.videoRoom.getActive();

      expect(result).toHaveLength(1);
      expect(result[0].roomName).toBe("🙏 Prayer: Healing");
    });

    it("should return empty array when no active rooms", async () => {
      const mockGetActive = vi.mocked(db.getActiveVideoRooms);
      mockGetActive.mockResolvedValue([]);

      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.videoRoom.getActive();

      expect(result).toHaveLength(0);
    });
  });

  describe("videoRoom.end", () => {
    it("should allow host to end their room", async () => {
      const mockGetById = vi.mocked(db.getVideoRoomById);
      mockGetById.mockResolvedValue({
        id: 1,
        hostId: 1,
        roomName: "Prayer",
        isActive: true,
      } as any);

      const mockEnd = vi.mocked(db.endVideoRoom);
      mockEnd.mockResolvedValue(undefined);

      const caller = appRouter.createCaller(createProtectedContext(1));
      const result = await caller.videoRoom.end({ id: 1 });

      expect(result.success).toBe(true);
      expect(mockEnd).toHaveBeenCalledWith(1);
    });

    it("should prevent non-host from ending room", async () => {
      const mockGetById = vi.mocked(db.getVideoRoomById);
      mockGetById.mockResolvedValue({
        id: 1,
        hostId: 1,
        roomName: "Prayer",
        isActive: true,
      } as any);

      const caller = appRouter.createCaller(createProtectedContext(2));

      await expect(caller.videoRoom.end({ id: 1 })).rejects.toThrow(
        "Only the host can end the room"
      );
    });

    it("should return error for non-existent room", async () => {
      const mockGetById = vi.mocked(db.getVideoRoomById);
      mockGetById.mockResolvedValue(null);

      const caller = appRouter.createCaller(createProtectedContext(1));

      await expect(caller.videoRoom.end({ id: 999 })).rejects.toThrow(
        "Room not found"
      );
    });
  });
});
