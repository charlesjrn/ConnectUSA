import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Onboarding", () => {
  let testUser: any;
  let testEmail: string;

  beforeEach(async () => {
    // Create a test user
    testEmail = `onboarding-test-${Date.now()}@test.com`;
    await db.createEmailUser({
      email: testEmail,
      passwordHash: "test-hash",
      name: "Onboarding Test User",
    });

    testUser = await db.getUserByEmail(testEmail);
    if (!testUser) {
      throw new Error("Failed to create test user");
    }
  });

  it("should create new user with onboardingCompleted set to false", async () => {
    const email = `new-user-${Date.now()}@test.com`;
    await db.createEmailUser({
      email,
      passwordHash: "test-hash",
      name: "New User",
    });

    const user = await db.getUserByEmail(email);
    expect(user).toBeDefined();
    expect(user?.onboardingCompleted).toBe(false);
  });

  it("should mark onboarding as complete", async () => {
    const mockReq = { protocol: "http", headers: {} } as any;
    const mockRes = { cookie: () => {}, clearCookie: () => {} } as any;
    const caller = appRouter.createCaller({ user: testUser, req: mockReq, res: mockRes });

    const result = await caller.profile.completeOnboarding();
    expect(result.success).toBe(true);

    // Verify onboarding was marked complete
    const updatedUser = await db.getUserById(testUser.id);
    expect(updatedUser?.onboardingCompleted).toBe(true);
  });

  it("should update profile during onboarding", async () => {
    const mockReq = { protocol: "http", headers: {} } as any;
    const mockRes = { cookie: () => {}, clearCookie: () => {} } as any;
    const caller = appRouter.createCaller({ user: testUser, req: mockReq, res: mockRes });

    await caller.profile.update({
      name: "Updated Name",
      location: "New York, NY",
      spiritualGifts: "Prophecy, Teaching",
      bio: "Test bio for onboarding",
      chosenDate: new Date("2024-01-01"),
    });

    const updatedUser = await db.getUserById(testUser.id);
    expect(updatedUser?.name).toBe("Updated Name");
    expect(updatedUser?.location).toBe("New York, NY");
    expect(updatedUser?.spiritualGifts).toBe("Prophecy, Teaching");
    expect(updatedUser?.bio).toBe("Test bio for onboarding");
  });

  it("should return shouldOnboard flag on signup", async () => {
    const mockReq = { protocol: "http", headers: {} } as any;
    const mockRes = { cookie: () => {}, clearCookie: () => {} } as any;
    const caller = appRouter.createCaller({ user: null, req: mockReq, res: mockRes });

    const email = `signup-test-${Date.now()}@test.com`;
    const result = await caller.auth.signup({
      email,
      password: "testpassword123",
      name: "Signup Test User",
    });

    expect(result.success).toBe(true);
    expect(result.shouldOnboard).toBe(true);
    expect(result.user).toBeDefined();
  });

  it("should require authentication to complete onboarding", async () => {
    const caller = appRouter.createCaller({ user: null });

    await expect(
      caller.profile.completeOnboarding()
    ).rejects.toThrow("Please login");
  });
});
