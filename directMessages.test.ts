import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb, upsertUser } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

async function createTestUser(openId: string, name: string): Promise<AuthenticatedUser> {
  await upsertUser({
    openId,
    email: `${openId}@example.com`,
    name,
    loginMethod: "manus",
  });

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { users } = await import("../drizzle/schema");
  const result = await db.select().from(users).where({ openId } as any).limit(1);
  
  if (result.length === 0) throw new Error("Test user not found");
  return result[0] as AuthenticatedUser;
}

function createAuthContext(user: AuthenticatedUser): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("directMessages", () => {
  let user1: AuthenticatedUser;
  let user2: AuthenticatedUser;

  beforeAll(async () => {
    user1 = await createTestUser("dm-test-user-1", "Alice");
    user2 = await createTestUser("dm-test-user-2", "Bob");
  });

  it("sends a direct message successfully", async () => {
    const ctx = createAuthContext(user1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.directMessages.send({
      receiverId: user2.id,
      content: "Hello Bob!",
    });

    expect(result).toEqual({ success: true });
  });

  it("retrieves conversation between two users", async () => {
    const ctx = createAuthContext(user1);
    const caller = appRouter.createCaller(ctx);

    // Send a message
    await caller.directMessages.send({
      receiverId: user2.id,
      content: "Test message",
    });

    // Retrieve conversation
    const messages = await caller.directMessages.getConversation({
      otherUserId: user2.id,
    });

    expect(messages.length).toBeGreaterThan(0);
    expect(messages[messages.length - 1]?.content).toBe("Test message");
  });

  it("lists all users except current user", async () => {
    const ctx = createAuthContext(user1);
    const caller = appRouter.createCaller(ctx);

    const users = await caller.directMessages.listUsers();

    // Should include user2 but not user1
    expect(users.some(u => u.id === user2.id)).toBe(true);
    expect(users.some(u => u.id === user1.id)).toBe(false);
  });

  it("rejects message with empty content", async () => {
    const ctx = createAuthContext(user1);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.directMessages.send({
        receiverId: user2.id,
        content: "",
      })
    ).rejects.toThrow();
  });
});
