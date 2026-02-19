import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Email Preferences", () => {
  let testUser: any;
  let testEmail: string;

  beforeEach(async () => {
    // Create a test user
    testEmail = `email-pref-test-${Date.now()}@test.com`;
    await db.createEmailUser({
      email: testEmail,
      passwordHash: "test-hash",
      name: "Email Pref Test User",
    });

    testUser = await db.getUserByEmail(testEmail);
    if (!testUser) {
      throw new Error("Failed to create test user");
    }
  });

  it("should return default email preferences for new user", async () => {
    const mockReq = { protocol: "http", headers: {} } as any;
    const mockRes = { cookie: () => {}, clearCookie: () => {} } as any;
    const caller = appRouter.createCaller({ user: testUser, req: mockReq, res: mockRes });

    const preferences = await caller.profile.getEmailPreferences();
    
    expect(preferences.emailComments).toBe(true);
    expect(preferences.emailDirectMessages).toBe(true);
    expect(preferences.emailWeeklyDigest).toBe(true);
    expect(preferences.emailLikes).toBe(true);
    expect(preferences.emailPrayers).toBe(true);
  });

  it("should update email preferences", async () => {
    const mockReq = { protocol: "http", headers: {} } as any;
    const mockRes = { cookie: () => {}, clearCookie: () => {} } as any;
    const caller = appRouter.createCaller({ user: testUser, req: mockReq, res: mockRes });

    // Update preferences
    await caller.profile.updateEmailPreferences({
      emailComments: false,
      emailLikes: false,
      emailWeeklyDigest: false,
    });

    // Verify updates
    const updatedPreferences = await caller.profile.getEmailPreferences();
    expect(updatedPreferences.emailComments).toBe(false);
    expect(updatedPreferences.emailLikes).toBe(false);
    expect(updatedPreferences.emailWeeklyDigest).toBe(false);
    expect(updatedPreferences.emailDirectMessages).toBe(true); // Should remain true
    expect(updatedPreferences.emailPrayers).toBe(true); // Should remain true
  });

  it("should handle partial preference updates", async () => {
    const mockReq = { protocol: "http", headers: {} } as any;
    const mockRes = { cookie: () => {}, clearCookie: () => {} } as any;
    const caller = appRouter.createCaller({ user: testUser, req: mockReq, res: mockRes });

    // Update only one preference
    await caller.profile.updateEmailPreferences({
      emailComments: false,
    });

    // Verify only specified preference was updated
    const preferences = await caller.profile.getEmailPreferences();
    expect(preferences.emailComments).toBe(false);
    expect(preferences.emailDirectMessages).toBe(true);
    expect(preferences.emailWeeklyDigest).toBe(true);
    expect(preferences.emailLikes).toBe(true);
    expect(preferences.emailPrayers).toBe(true);
  });

  it("should allow disabling all email notifications", async () => {
    const mockReq = { protocol: "http", headers: {} } as any;
    const mockRes = { cookie: () => {}, clearCookie: () => {} } as any;
    const caller = appRouter.createCaller({ user: testUser, req: mockReq, res: mockRes });

    // Disable all notifications
    await caller.profile.updateEmailPreferences({
      emailComments: false,
      emailDirectMessages: false,
      emailWeeklyDigest: false,
      emailLikes: false,
      emailPrayers: false,
    });

    // Verify all are disabled
    const preferences = await caller.profile.getEmailPreferences();
    expect(preferences.emailComments).toBe(false);
    expect(preferences.emailDirectMessages).toBe(false);
    expect(preferences.emailWeeklyDigest).toBe(false);
    expect(preferences.emailLikes).toBe(false);
    expect(preferences.emailPrayers).toBe(false);
  });
});
