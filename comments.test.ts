import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    profilePicture: null,
    chosenDate: null,
    bio: null,
    location: null,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("comments", () => {
  let testMessageId: number;

  beforeAll(async () => {
    // Create a test user and message first
    await db.upsertUser({
      openId: "test-user-1",
      name: "Test User 1",
      email: "user1@example.com",
      loginMethod: "manus",
    });

    const user = await db.getUserByOpenId("test-user-1");
    if (!user) throw new Error("Failed to create test user");

    await db.createMessage({
      userId: user.id,
      content: "Test Testimony\n\nThis is a test testimony for commenting.",
      room: "testimony",
    });

    const messages = await db.getMessagesByRoom("testimony");
    testMessageId = messages[messages.length - 1]!.id;
  });

  it("creates a comment successfully", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.comments.create({
      messageId: testMessageId,
      content: "This is a test comment",
    });

    expect(result).toEqual({ success: true });
  });

  it("retrieves comments by message ID", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // Create a comment first
    await caller.comments.create({
      messageId: testMessageId,
      content: "Another test comment",
    });

    // Retrieve comments
    const comments = await caller.comments.byMessageId({ messageId: testMessageId });

    expect(comments.length).toBeGreaterThan(0);
    expect(comments[0]).toHaveProperty("content");
    expect(comments[0]).toHaveProperty("userName");
    expect(comments[0]).toHaveProperty("createdAt");
  });
});
