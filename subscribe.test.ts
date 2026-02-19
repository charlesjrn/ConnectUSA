import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  addEmailSubscriber: vi.fn(),
  getEmailSubscriberCount: vi.fn(),
  getEmailSubscribers: vi.fn(),
}));

import * as db from "./db";

describe("Email Subscriber", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addEmailSubscriber", () => {
    it("should accept a valid email", async () => {
      const mockAdd = vi.mocked(db.addEmailSubscriber);
      mockAdd.mockResolvedValue({ success: true });

      const result = await db.addEmailSubscriber({
        email: "test@example.com",
        name: "John",
        source: "landing_page",
      });

      expect(result).toEqual({ success: true });
      expect(mockAdd).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "John",
        source: "landing_page",
      });
    });

    it("should handle duplicate email gracefully", async () => {
      const mockAdd = vi.mocked(db.addEmailSubscriber);
      mockAdd.mockResolvedValue({ success: true, alreadySubscribed: true });

      const result = await db.addEmailSubscriber({
        email: "duplicate@example.com",
        source: "landing_page",
      });

      expect(result).toEqual({ success: true, alreadySubscribed: true });
    });

    it("should accept email without name", async () => {
      const mockAdd = vi.mocked(db.addEmailSubscriber);
      mockAdd.mockResolvedValue({ success: true });

      const result = await db.addEmailSubscriber({
        email: "noname@example.com",
        source: "landing_page",
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe("getEmailSubscriberCount", () => {
    it("should return subscriber count", async () => {
      const mockCount = vi.mocked(db.getEmailSubscriberCount);
      mockCount.mockResolvedValue(42);

      const count = await db.getEmailSubscriberCount();
      expect(count).toBe(42);
    });

    it("should return 0 when no subscribers", async () => {
      const mockCount = vi.mocked(db.getEmailSubscriberCount);
      mockCount.mockResolvedValue(0);

      const count = await db.getEmailSubscriberCount();
      expect(count).toBe(0);
    });
  });

  describe("getEmailSubscribers", () => {
    it("should return list of subscribers", async () => {
      const mockList = vi.mocked(db.getEmailSubscribers);
      const mockSubscribers = [
        { id: 1, email: "a@test.com", name: "Alice", source: "landing_page", createdAt: new Date() },
        { id: 2, email: "b@test.com", name: null, source: "landing_page", createdAt: new Date() },
      ];
      mockList.mockResolvedValue(mockSubscribers);

      const subscribers = await db.getEmailSubscribers();
      expect(subscribers).toHaveLength(2);
      expect(subscribers[0].email).toBe("a@test.com");
    });
  });
});
