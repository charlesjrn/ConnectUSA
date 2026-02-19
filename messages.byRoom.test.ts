import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

beforeAll(async () => {
  // Ensure test user exists in database
  await db.upsertUser({
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
  });
});

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: undefined,
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

describe("messages.byRoom", () => {
  it("returns an array of messages for a specific room", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.messages.byRoom({ room: "gift" });

    expect(Array.isArray(result)).toBe(true);
  });

  it("can be called by unauthenticated users", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.messages.byRoom({ room: "vision" })
    ).resolves.toBeDefined();
  });

  it("returns messages with required fields", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.messages.byRoom({ room: "testimony" });

    if (result.length > 0) {
      const message = result[0];
      expect(message).toHaveProperty("id");
      expect(message).toHaveProperty("content");
      expect(message).toHaveProperty("room");
      expect(message).toHaveProperty("createdAt");
      expect(message).toHaveProperty("userId");
    }
  });

  it("works for all room types including new rooms", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const rooms = ["gift", "vision", "encounter", "testimony", "prayer", "missions", "chatroom", "meetup"] as const;

    for (const room of rooms) {
      const result = await caller.messages.byRoom({ room });
      expect(Array.isArray(result)).toBe(true);
    }
  });
});
