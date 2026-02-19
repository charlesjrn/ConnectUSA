import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

let testUserId: number;

beforeAll(async () => {
  // Ensure test user exists in database
  await db.upsertUser({
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
  });
  
  // Fetch the actual user ID
  const user = await db.getUserByOpenId("test-user");
  if (!user) throw new Error("Test user not found after upsert");
  testUserId = user.id;
});

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: testUserId,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    profilePicture: null,
    chosenDate: null,
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("messages.send", () => {
  it("sends a message successfully to a room", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.messages.send({
      content: "Test message in gifts room",
      room: "gift",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects message with empty content", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.messages.send({
        content: "",
        room: "gift",
      })
    ).rejects.toThrow();
  });

  it("accepts messages in all room types including new rooms", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const rooms = ["gift", "vision", "encounter", "testimony", "prayer", "missions", "chatroom", "meetup"] as const;

    for (const room of rooms) {
      const result = await caller.messages.send({
        content: `Test message in ${room} room`,
        room,
      });

      expect(result).toEqual({ success: true });
    }
  });
});
