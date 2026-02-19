import { describe, it, expect, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

// Mock db module
vi.mock("./db", () => ({
  getActiveMembershipByUserId: vi.fn(),
  getFounderMemberCount: vi.fn(),
  createMembership: vi.fn(),
  updateMembershipByCheckoutSession: vi.fn(),
  addEmailSubscriber: vi.fn(),
  getEmailSubscriberCount: vi.fn(),
  getEmailSubscribers: vi.fn(),
}));

// Shared mock Stripe instance so all calls to getStripe() return the same object
const mockStripeInstance = {
  checkout: {
    sessions: {
      create: vi.fn().mockResolvedValue({
        id: "cs_test_123",
        url: "https://checkout.stripe.com/test",
      }),
      retrieve: vi.fn(),
    },
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

vi.mock("./_core/stripe", () => ({
  getStripe: vi.fn(() => mockStripeInstance),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { appRouter } from "./routers";
import * as db from "./db";


function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: { host: "localhost:3000" } } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(overrides?: Partial<NonNullable<TrpcContext["user"]>>): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "user-123",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      ...overrides,
    },
    req: { protocol: "https", headers: { host: "localhost:3000" } } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("membership router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("membership.status", () => {
    it("should return not a member for unauthenticated users", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.membership.status();

      expect(result).toEqual({ isMember: false, membership: null });
    });

    it("should return not a member when user has no membership", async () => {
      vi.mocked(db.getActiveMembershipByUserId).mockResolvedValue(null);

      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.membership.status();

      expect(result).toEqual({ isMember: false, membership: null });
      expect(db.getActiveMembershipByUserId).toHaveBeenCalledWith(1);
    });

    it("should return member info when user has active membership", async () => {
      const mockMembership = {
        id: 1,
        userId: 1,
        membershipType: "founder" as const,
        billingInterval: "yearly" as const,
        status: "active" as const,
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        stripeCheckoutSessionId: "cs_123",
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      };
      vi.mocked(db.getActiveMembershipByUserId).mockResolvedValue(mockMembership);

      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.membership.status();

      expect(result.isMember).toBe(true);
      expect(result.membership).toEqual({
        id: 1,
        membershipType: "founder",
        billingInterval: "yearly",
        status: "active",
        createdAt: mockMembership.createdAt,
      });
    });
  });

  describe("membership.info", () => {
    it("should return member count and spots remaining", async () => {
      vi.mocked(db.getFounderMemberCount).mockResolvedValue(50);

      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.membership.info();

      expect(result).toEqual({
        memberCount: 50,
        maxMembers: 200,
        spotsRemaining: 150,
        isSoldOut: false,
      });
    });

    it("should show sold out when at capacity", async () => {
      vi.mocked(db.getFounderMemberCount).mockResolvedValue(200);

      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.membership.info();

      expect(result).toEqual({
        memberCount: 200,
        maxMembers: 200,
        spotsRemaining: 0,
        isSoldOut: true,
      });
    });

    it("should show sold out when over capacity", async () => {
      vi.mocked(db.getFounderMemberCount).mockResolvedValue(205);

      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.membership.info();

      expect(result.spotsRemaining).toBe(0);
      expect(result.isSoldOut).toBe(true);
    });
  });

  describe("membership.createCheckout", () => {
    it("should reject unauthenticated users", async () => {
      const caller = appRouter.createCaller(createPublicContext());

      await expect(
        caller.membership.createCheckout({ plan: "monthly" })
      ).rejects.toThrow();
    });

    it("should reject if user is already a member", async () => {
      vi.mocked(db.getActiveMembershipByUserId).mockResolvedValue({
        id: 1,
        userId: 1,
        membershipType: "founder",
        billingInterval: "yearly",
        status: "active",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        stripeCheckoutSessionId: "cs_123",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const caller = appRouter.createCaller(createUserContext());

      await expect(
        caller.membership.createCheckout({ plan: "monthly" })
      ).rejects.toThrow("already a Founding Circle member");
    });

    it("should reject if founding circle is full", async () => {
      vi.mocked(db.getActiveMembershipByUserId).mockResolvedValue(null);
      vi.mocked(db.getFounderMemberCount).mockResolvedValue(200);

      const caller = appRouter.createCaller(createUserContext());

      await expect(
        caller.membership.createCheckout({ plan: "monthly" })
      ).rejects.toThrow("full");
    });

    it("should create a checkout session for monthly plan", async () => {
      vi.mocked(db.getActiveMembershipByUserId).mockResolvedValue(null);
      vi.mocked(db.getFounderMemberCount).mockResolvedValue(10);
      vi.mocked(db.createMembership).mockResolvedValue(1);

      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.membership.createCheckout({ plan: "monthly" });

      expect(result.checkoutUrl).toBe("https://checkout.stripe.com/test");
      expect(db.createMembership).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          membershipType: "founder",
          billingInterval: "monthly",
          status: "pending",
          stripeCheckoutSessionId: "cs_test_123",
        })
      );
    });

    it("should create a checkout session for yearly plan", async () => {
      vi.mocked(db.getActiveMembershipByUserId).mockResolvedValue(null);
      vi.mocked(db.getFounderMemberCount).mockResolvedValue(10);
      vi.mocked(db.createMembership).mockResolvedValue(1);

      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.membership.createCheckout({ plan: "yearly" });

      expect(result.checkoutUrl).toBe("https://checkout.stripe.com/test");
      expect(db.createMembership).toHaveBeenCalledWith(
        expect.objectContaining({
          billingInterval: "yearly",
        })
      );
    });

    it("should reject invalid plan values", async () => {
      const caller = appRouter.createCaller(createUserContext());

      await expect(
        // @ts-expect-error testing invalid input
        caller.membership.createCheckout({ plan: "weekly" })
      ).rejects.toThrow();
    });
  });

  describe("membership.verifySession", () => {
    it("should reject unauthenticated users", async () => {
      const caller = appRouter.createCaller(createPublicContext());

      await expect(
        caller.membership.verifySession({ sessionId: "cs_test_123" })
      ).rejects.toThrow();
    });

    it("should verify a successful checkout session", async () => {
      mockStripeInstance.checkout.sessions.retrieve.mockResolvedValue({
        id: "cs_test_123",
        client_reference_id: "1",
        payment_status: "paid",
        customer: "cus_123",
        subscription: "sub_123",
      } as any);

      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.membership.verifySession({ sessionId: "cs_test_123" });

      expect(result.verified).toBe(true);
      expect(result.message).toContain("Welcome");
      expect(db.updateMembershipByCheckoutSession).toHaveBeenCalledWith("cs_test_123", {
        status: "active",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
      });
    });

    it("should reject session belonging to different user", async () => {
      mockStripeInstance.checkout.sessions.retrieve.mockResolvedValue({
        id: "cs_test_123",
        client_reference_id: "999",
        payment_status: "paid",
      } as any);

      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.membership.verifySession({ sessionId: "cs_test_123" });

      expect(result.verified).toBe(false);
      expect(result.message).toContain("does not belong");
    });

    it("should handle unpaid sessions", async () => {
      mockStripeInstance.checkout.sessions.retrieve.mockResolvedValue({
        id: "cs_test_123",
        client_reference_id: "1",
        payment_status: "unpaid",
      } as any);

      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.membership.verifySession({ sessionId: "cs_test_123" });

      expect(result.verified).toBe(false);
      expect(result.message).toContain("not been completed");
    });

    it("should handle Stripe API errors gracefully", async () => {
      mockStripeInstance.checkout.sessions.retrieve.mockRejectedValue(
        new Error("Stripe API error")
      );

      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.membership.verifySession({ sessionId: "cs_invalid" });

      expect(result.verified).toBe(false);
      expect(result.message).toContain("Could not verify");
    });
  });
});
