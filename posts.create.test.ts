import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

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

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
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

describe("posts.create", () => {
  it("creates a post successfully with valid input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.posts.create({
      title: "My Spiritual Journey",
      content: "This is my testimony about finding faith.",
      category: "testimony",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects post creation with empty title", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.posts.create({
        title: "",
        content: "Valid content",
        category: "testimony",
      })
    ).rejects.toThrow();
  });

  it("rejects post creation with empty content", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.posts.create({
        title: "Valid Title",
        content: "",
        category: "testimony",
      })
    ).rejects.toThrow();
  });

  it("accepts all valid category types", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const categories = ["gift", "vision", "encounter", "testimony", "prayer"] as const;

    for (const category of categories) {
      const result = await caller.posts.create({
        title: `Test ${category}`,
        content: `Testing ${category} category`,
        category,
      });

      expect(result).toEqual({ success: true });
    }
  });
});
