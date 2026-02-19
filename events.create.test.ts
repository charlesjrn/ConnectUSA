import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb, upsertUser } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

async function createTestUser(): Promise<AuthenticatedUser> {
  await upsertUser({
    openId: "test-event-user",
    email: "eventtest@example.com",
    name: "Event Test User",
    loginMethod: "manus",
  });

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { users } = await import("../drizzle/schema");
  const result = await db.select().from(users).where({ openId: "test-event-user" } as any).limit(1);
  
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

describe("events.create", () => {
  let testUser: AuthenticatedUser;

  beforeAll(async () => {
    testUser = await createTestUser();
  });

  it("creates an event successfully", async () => {
    const ctx = createAuthContext(testUser);
    const caller = appRouter.createCaller(ctx);

    const eventDate = new Date("2026-12-25T10:00:00");

    const result = await caller.events.create({
      title: "Christmas Prayer Meeting",
      description: "Join us for a special Christmas prayer gathering",
      eventDate,
      eventType: "prayer",
      location: "Community Church",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects event with empty title", async () => {
    const ctx = createAuthContext(testUser);
    const caller = appRouter.createCaller(ctx);

    const eventDate = new Date("2026-12-25T10:00:00");

    await expect(
      caller.events.create({
        title: "",
        eventDate,
        eventType: "online",
      })
    ).rejects.toThrow();
  });

  it("accepts all event types", async () => {
    const ctx = createAuthContext(testUser);
    const caller = appRouter.createCaller(ctx);

    const eventDate = new Date("2026-12-25T10:00:00");
    const eventTypes: Array<"online" | "in-person" | "prayer"> = ["online", "in-person", "prayer"];

    for (const eventType of eventTypes) {
      const result = await caller.events.create({
        title: `Test ${eventType} event`,
        eventDate,
        eventType,
      });

      expect(result).toEqual({ success: true });
    }
  });
});
