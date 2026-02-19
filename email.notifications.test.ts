import { describe, it, expect, beforeAll, vi } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import * as emailNotification from "./_core/emailNotification";

// Mock the email sending function
vi.mock("./_core/emailNotification", async () => {
  const actual = await vi.importActual("./_core/emailNotification");
  return {
    ...actual,
    sendEmailNotification: vi.fn().mockResolvedValue(true),
  };
});

describe("Email Notifications", () => {
  let testUser1Id: number;
  let testUser2Id: number;
  let testMessageId: number;

  beforeAll(async () => {
    // Create test users with emails
    await db.upsertUser({
      openId: "test-email-user-1",
      name: "Alice Johnson",
      email: "alice.email@test.com",
      loginMethod: "oauth",
    });
    const user1 = await db.getUserByOpenId("test-email-user-1");
    testUser1Id = user1!.id;

    await db.upsertUser({
      openId: "test-email-user-2",
      name: "Bob Williams",
      email: "bob.email@test.com",
      loginMethod: "oauth",
    });
    const user2 = await db.getUserByOpenId("test-email-user-2");
    testUser2Id = user2!.id;

    // Create a test message/testimony with unique content
    const uniqueContent = `Test testimony for email notifications ${Date.now()}`;
    await db.createMessage({
      userId: testUser1Id,
      content: uniqueContent,
      room: "testimony",
    });
    const messages = await db.getMessagesByRoom("testimony", 50);
    const testMsg = messages.find(m => m.content === uniqueContent);
    if (!testMsg) throw new Error("Failed to create test message");
    testMessageId = testMsg.id;
  });

  describe("Comment Email Notifications", () => {
    it("should send email when someone comments on user's testimony", async () => {
      const sendEmailMock = vi.mocked(emailNotification.sendEmailNotification);
      sendEmailMock.mockClear();

      const caller = appRouter.createCaller({
        req: {} as any,
        res: {} as any,
        user: { id: testUser2Id, name: "Bob Williams" } as any,
      });

      // User 2 comments on User 1's testimony
      await caller.comments.create({
        messageId: testMessageId,
        content: "Great testimony, Alice!",
      });

      // Verify email was sent
      expect(sendEmailMock).toHaveBeenCalledTimes(1);
      expect(sendEmailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "alice.email@test.com",
          subject: expect.stringContaining("Bob Williams"),
          htmlContent: expect.stringContaining("Bob Williams"),
        })
      );
    });

    it("should NOT send email when user comments on their own testimony", async () => {
      const sendEmailMock = vi.mocked(emailNotification.sendEmailNotification);
      sendEmailMock.mockClear();

      // Create a NEW message by user1 specifically for this test
      const ownContent = `Own testimony for self-comment test ${Date.now()}`;
      await db.createMessage({
        userId: testUser1Id,
        content: ownContent,
        room: "testimony",
      });
      const msgs = await db.getMessagesByRoom("testimony", 50);
      const ownMsg = msgs.find(m => m.content === ownContent);
      if (!ownMsg) throw new Error("Failed to create own test message");

      const caller = appRouter.createCaller({
        req: {} as any,
        res: {} as any,
        user: { id: testUser1Id, name: "Alice Johnson" } as any,
      });

      // User 1 comments on their own testimony
      await caller.comments.create({
        messageId: ownMsg.id,
        content: "Adding more context",
      });

      // Verify no email was sent for self-comment
      expect(sendEmailMock).not.toHaveBeenCalled();
    });

    it("should generate correct comment email template", () => {
      const html = emailNotification.generateCommentEmailTemplate({
        recipientName: "Alice",
        commenterName: "Bob",
        testimonyTitle: "My testimony about faith",
        commentContent: "This is inspiring!",
        testimonyUrl: "https://chosen-connect.manus.space/testimony/123",
      });

      expect(html).toContain("Alice");
      expect(html).toContain("Bob");
      expect(html).toContain("My testimony about faith");
      expect(html).toContain("This is inspiring!");
      expect(html).toContain("https://chosen-connect.manus.space/testimony/123");
      expect(html).toContain("CHOSEN CONNECT");
    });
  });

  describe("Direct Message Email Notifications", () => {
    it("should send email when user receives a direct message", async () => {
      const sendEmailMock = vi.mocked(emailNotification.sendEmailNotification);
      sendEmailMock.mockClear();

      const caller = appRouter.createCaller({
        req: {} as any,
        res: {} as any,
        user: { id: testUser1Id, name: "Alice Johnson" } as any,
      });

      // User 1 sends DM to User 2
      await caller.directMessages.send({
        receiverId: testUser2Id,
        content: "Hello Bob, how are you?",
      });

      // Verify email was sent
      expect(sendEmailMock).toHaveBeenCalledTimes(1);
      expect(sendEmailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "bob.email@test.com",
          subject: expect.stringContaining("Alice Johnson"),
          htmlContent: expect.stringContaining("Alice Johnson"),
        })
      );
    });

    it("should generate correct direct message email template", () => {
      const html = emailNotification.generateDirectMessageEmailTemplate({
        recipientName: "Bob",
        senderName: "Alice",
        messagePreview: "Hello Bob, I wanted to reach out...",
        messagesUrl: "https://chosen-connect.manus.space/messages",
      });

      expect(html).toContain("Bob");
      expect(html).toContain("Alice");
      expect(html).toContain("Hello Bob, I wanted to reach out...");
      expect(html).toContain("https://chosen-connect.manus.space/messages");
      expect(html).toContain("CHOSEN CONNECT");
    });
  });

  describe("Email Sending Service", () => {
    it("should handle email sending errors gracefully", async () => {
      const sendEmailMock = vi.mocked(emailNotification.sendEmailNotification);
      sendEmailMock.mockResolvedValueOnce(false); // Simulate failure

      const caller = appRouter.createCaller({
        req: {} as any,
        res: {} as any,
        user: { id: testUser2Id, name: "Bob Williams" } as any,
      });

      // Should not throw error even if email fails
      await expect(
        caller.comments.create({
          messageId: testMessageId,
          content: "Another comment",
        })
      ).resolves.not.toThrow();
    });
  });
});
