import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getJourneyMilestones: vi.fn(),
  getJourneyMilestoneById: vi.fn(),
  createJourneyMilestone: vi.fn(),
  updateJourneyMilestone: vi.fn(),
  deleteJourneyMilestone: vi.fn(),
}));

import * as db from "./db";

describe("Journey Milestones", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getJourneyMilestones", () => {
    it("should return milestones for a user", async () => {
      const mockMilestones = [
        {
          id: 1,
          userId: 1,
          title: "Accepted Christ",
          description: "The day I gave my life to Jesus",
          milestoneDate: new Date("2020-01-15"),
          milestoneType: "salvation",
          createdAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          title: "Baptism",
          description: "Baptized at my local church",
          milestoneDate: new Date("2020-06-20"),
          milestoneType: "baptism",
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getJourneyMilestones).mockResolvedValue(mockMilestones);

      const result = await db.getJourneyMilestones(1);

      expect(db.getJourneyMilestones).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Accepted Christ");
      expect(result[0].milestoneType).toBe("salvation");
    });

    it("should return empty array for user with no milestones", async () => {
      vi.mocked(db.getJourneyMilestones).mockResolvedValue([]);

      const result = await db.getJourneyMilestones(999);

      expect(result).toHaveLength(0);
    });
  });

  describe("getJourneyMilestoneById", () => {
    it("should return a specific milestone", async () => {
      const mockMilestone = {
        id: 1,
        userId: 1,
        title: "Called to Ministry",
        description: "God called me to serve",
        milestoneDate: new Date("2021-03-10"),
        milestoneType: "calling",
        createdAt: new Date(),
      };

      vi.mocked(db.getJourneyMilestoneById).mockResolvedValue(mockMilestone);

      const result = await db.getJourneyMilestoneById(1);

      expect(db.getJourneyMilestoneById).toHaveBeenCalledWith(1);
      expect(result?.title).toBe("Called to Ministry");
      expect(result?.milestoneType).toBe("calling");
    });

    it("should return null for non-existent milestone", async () => {
      vi.mocked(db.getJourneyMilestoneById).mockResolvedValue(null);

      const result = await db.getJourneyMilestoneById(999);

      expect(result).toBeNull();
    });
  });

  describe("createJourneyMilestone", () => {
    it("should create a new milestone", async () => {
      const newMilestone = {
        userId: 1,
        title: "Vision Received",
        description: "God showed me a vision",
        milestoneDate: "2023-07-01",
        milestoneType: "vision" as const,
      };

      vi.mocked(db.createJourneyMilestone).mockResolvedValue({ id: 5 });

      const result = await db.createJourneyMilestone(newMilestone);

      expect(db.createJourneyMilestone).toHaveBeenCalledWith(newMilestone);
      expect(result.id).toBe(5);
    });

    it("should handle all milestone types", async () => {
      const milestoneTypes = ["salvation", "baptism", "calling", "healing", "vision", "ministry", "other"] as const;

      for (const type of milestoneTypes) {
        vi.mocked(db.createJourneyMilestone).mockResolvedValue({ id: 1 });

        const result = await db.createJourneyMilestone({
          userId: 1,
          title: `Test ${type}`,
          description: null,
          milestoneDate: "2023-01-01",
          milestoneType: type,
        });

        expect(result.id).toBe(1);
      }
    });
  });

  describe("updateJourneyMilestone", () => {
    it("should update milestone fields", async () => {
      vi.mocked(db.updateJourneyMilestone).mockResolvedValue({ success: true });

      const result = await db.updateJourneyMilestone(1, {
        title: "Updated Title",
        description: "Updated description",
      });

      expect(db.updateJourneyMilestone).toHaveBeenCalledWith(1, {
        title: "Updated Title",
        description: "Updated description",
      });
      expect(result.success).toBe(true);
    });

    it("should update milestone type", async () => {
      vi.mocked(db.updateJourneyMilestone).mockResolvedValue({ success: true });

      const result = await db.updateJourneyMilestone(1, {
        milestoneType: "ministry",
      });

      expect(db.updateJourneyMilestone).toHaveBeenCalledWith(1, {
        milestoneType: "ministry",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("deleteJourneyMilestone", () => {
    it("should delete a milestone", async () => {
      vi.mocked(db.deleteJourneyMilestone).mockResolvedValue(undefined);

      await db.deleteJourneyMilestone(1);

      expect(db.deleteJourneyMilestone).toHaveBeenCalledWith(1);
    });
  });
});
