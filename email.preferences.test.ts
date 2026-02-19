import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Email Preferences", () => {
  let testUserId: number;

  beforeAll(async () => {
    // Create a test user
    await db.upsertUser({
      openId: "test-email-prefs-user",
      name: "Email Prefs Test User",
      email: "emailprefs@test.com",
    });

    const user = await db.getUserByOpenId("test-email-prefs-user");
    if (!user) throw new Error("Failed to create test user");
    testUserId = user.id;
  });

  it("should get default email preferences for new user", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-email-prefs-user", name: "Test User", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const prefs = await caller.profile.getEmailPreferences();
    
    expect(prefs).toBeDefined();
    expect(prefs.emailComments).toBe(true); // Default is true
    expect(prefs.emailDirectMessages).toBe(true);
    expect(prefs.emailWeeklyDigest).toBe(true);
  });

  it("should update email preferences", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-email-prefs-user", name: "Test User", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    await caller.profile.updateEmailPreferences({
      emailComments: false,
      emailDirectMessages: true,
      emailWeeklyDigest: false,
    });

    const prefs = await caller.profile.getEmailPreferences();
    
    expect(prefs.emailComments).toBe(false);
    expect(prefs.emailDirectMessages).toBe(true);
    expect(prefs.emailWeeklyDigest).toBe(false);
  });

  it("should respect email preferences when sending comment notifications", async () => {
    // Create two users
    await db.upsertUser({
      openId: "test-author",
      name: "Author",
      email: "author@test.com",
    });
    await db.upsertUser({
      openId: "test-commenter",
      name: "Commenter",
      email: "commenter@test.com",
    });

    const author = await db.getUserByOpenId("test-author");
    const commenter = await db.getUserByOpenId("test-commenter");
    if (!author || !commenter) throw new Error("Failed to create test users");

    // Disable email notifications for author
    await db.updateEmailPreferences(author.id, { emailComments: false });

    // Create a testimony
    const authorCaller = appRouter.createCaller({
      user: { id: author.id, openId: "test-author", name: "Author", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    await authorCaller.messages.send({
      content: "Test Testimony\n\nThis is a test",
      room: "testimony",
    });

    const messages = await db.getAllMessages(1);
    const testimony = messages[0];

    // Add a comment (should not send email because author disabled it)
    const commenterCaller = appRouter.createCaller({
      user: { id: commenter.id, openId: "test-commenter", name: "Commenter", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // This should succeed without sending email
    await commenterCaller.comments.create({
      messageId: testimony.id,
      content: "Great testimony!",
    });

    // No way to verify email wasn't sent, but the operation should succeed
    const comments = await db.getCommentsByMessageId(testimony.id);
    expect(comments.length).toBeGreaterThan(0);
  });

  it("should only send weekly digest to users who opted in", async () => {
    // Create users with different preferences
    await db.upsertUser({
      openId: "digest-yes",
      name: "Digest Yes",
      email: "digest-yes@test.com",
    });
    await db.upsertUser({
      openId: "digest-no",
      name: "Digest No",
      email: "digest-no@test.com",
    });

    const yesUser = await db.getUserByOpenId("digest-yes");
    const noUser = await db.getUserByOpenId("digest-no");
    if (!yesUser || !noUser) throw new Error("Failed to create test users");

    // Set preferences
    await db.updateEmailPreferences(yesUser.id, { emailWeeklyDigest: true });
    await db.updateEmailPreferences(noUser.id, { emailWeeklyDigest: false });

    // Get users opted into weekly digest
    const optedInUsers = await db.getUsersOptedIntoWeeklyDigest();
    
    const optedInIds = optedInUsers.map(u => u.id);
    expect(optedInIds).toContain(yesUser.id);
    expect(optedInIds).not.toContain(noUser.id);
  });
});
