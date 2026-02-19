import { describe, it, expect, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

// Mock the db module before importing the router
vi.mock("./db", () => ({
  addEmailSubscriber: vi.fn(),
  getEmailSubscriberCount: vi.fn(),
  getEmailSubscribers: vi.fn(),
}));

import { appRouter } from "./routers";
import * as db from "./db";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("subscribe router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("subscribe.join", () => {
    it("should create a new subscriber and return success", async () => {
      const mockAdd = vi.mocked(db.addEmailSubscriber);
      mockAdd.mockResolvedValue({ success: true });

      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.subscribe.join({
        email: "new@example.com",
        name: "Test User",
      });

      expect(result).toEqual({ success: true, alreadySubscribed: false });
      expect(mockAdd).toHaveBeenCalledWith({
        email: "new@example.com",
        name: "Test User",
        source: "landing_page",
      });
    });

    it("should indicate when subscriber already exists", async () => {
      const mockAdd = vi.mocked(db.addEmailSubscriber);
      mockAdd.mockResolvedValue({ success: true, alreadySubscribed: true });

      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.subscribe.join({
        email: "existing@example.com",
      });

      expect(result).toEqual({ success: true, alreadySubscribed: true });
    });

    it("should reject invalid email", async () => {
      const caller = appRouter.createCaller(createPublicContext());

      await expect(
        caller.subscribe.join({ email: "not-an-email" })
      ).rejects.toThrow();
    });

    it("should work without a name", async () => {
      const mockAdd = vi.mocked(db.addEmailSubscriber);
      mockAdd.mockResolvedValue({ success: true });

      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.subscribe.join({
        email: "noname@example.com",
      });

      expect(result.success).toBe(true);
      expect(mockAdd).toHaveBeenCalledWith({
        email: "noname@example.com",
        name: undefined,
        source: "landing_page",
      });
    });
  });

  describe("subscribe.count", () => {
    it("should return the subscriber count", async () => {
      const mockCount = vi.mocked(db.getEmailSubscriberCount);
      mockCount.mockResolvedValue(25);

      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.subscribe.count();

      expect(result).toEqual({ count: 25 });
    });

    it("should return zero when no subscribers", async () => {
      const mockCount = vi.mocked(db.getEmailSubscriberCount);
      mockCount.mockResolvedValue(0);

      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.subscribe.count();

      expect(result).toEqual({ count: 0 });
    });
  });

  describe("subscribe.list", () => {
    it("should return subscribers for admin users", async () => {
      const mockList = vi.mocked(db.getEmailSubscribers);
      const mockData = [
        { id: 1, email: "a@test.com", name: "Alice", source: "landing_page", createdAt: new Date() },
      ];
      mockList.mockResolvedValue(mockData);

      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.subscribe.list();

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe("a@test.com");
    });
  });
});
