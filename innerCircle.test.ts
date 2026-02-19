import { describe, it, expect, vi, beforeAll } from "vitest";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock Stripe
vi.mock("./_core/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          url: "https://checkout.stripe.com/test-session",
          id: "cs_test_123",
        }),
      },
    },
  }),
}));

// Mock db functions
vi.mock("./db", async () => {
  const actual = await vi.importActual("./db");
  return {
    ...actual,
    getActiveInnerCircleMembership: vi.fn().mockResolvedValue(null),
    getActiveMembershipByUserId: vi.fn().mockResolvedValue(null),
    getMembershipByUserId: vi.fn().mockResolvedValue(null),
    isInnerCircleMember: vi.fn().mockResolvedValue(false),
    getInnerCircleMemberCount: vi.fn().mockResolvedValue(0),
    createInnerCircleMembership: vi.fn().mockResolvedValue(1),
    createMembership: vi.fn().mockResolvedValue(1),
    adminGrantMembership: vi.fn().mockResolvedValue(1),
    adminRevokeMembership: vi.fn().mockResolvedValue(undefined),
  };
});

function createMockContext(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      openId: "test-open-id",
      role: "user",
    } as any,
    req: {
      headers: {
        origin: "http://localhost:3000",
      },
    } as any,
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as any,
    ...overrides,
  };
}

function createAdminContext(): TrpcContext {
  return createMockContext({
    user: {
      id: 99,
      name: "Admin User",
      email: "admin@example.com",
      openId: "admin-open-id",
      role: "admin",
    } as any,
  });
}

describe("Inner Circle Membership", () => {
  describe("membership.getStatus", () => {
    it("should return membership status for authenticated user", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.membership.getStatus();
      expect(result).toHaveProperty("isFounder", false);
      expect(result).toHaveProperty("isInnerCircle", false);
      expect(result).toHaveProperty("membership", null);
    });
  });

  describe("membership.getStatus", () => {
    it("should return membership status object", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.membership.getStatus();
      expect(result).toHaveProperty("isFounder");
      expect(result).toHaveProperty("isInnerCircle");
    });
  });

  describe("membership.createInnerCircleCheckout", () => {
    it("should create a Stripe checkout session for Inner Circle", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.membership.createInnerCircleCheckout();
      expect(result).toHaveProperty("checkoutUrl");
      expect(result.checkoutUrl).toContain("checkout.stripe.com");
    });
  });

  describe("membership.adminGrant", () => {
    it("should allow admin to grant inner circle membership", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.membership.adminGrant({
        userId: 1,
        membershipType: "inner_circle",
      });
      expect(result).toEqual({ success: true });
    });

    it("should reject non-admin users from granting membership", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.membership.adminGrant({
          userId: 2,
          membershipType: "inner_circle",
        })
      ).rejects.toThrow();
    });
  });

  describe("membership.adminRevoke", () => {
    it("should allow admin to revoke membership", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.membership.adminRevoke({ userId: 1 });
      expect(result).toEqual({ success: true });
    });

    it("should reject non-admin users from revoking membership", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.membership.adminRevoke({ userId: 2 })
      ).rejects.toThrow();
    });
  });
});
