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

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

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

describe("posts.list", () => {
  it("returns an array of posts", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.posts.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("can be called by unauthenticated users", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.posts.list()).resolves.toBeDefined();
  });

  it("can be called by authenticated users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.posts.list()).resolves.toBeDefined();
  });

  it("returns posts with required fields", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a post
    await caller.posts.create({
      title: "Test Post",
      content: "Test content",
      category: "testimony",
    });

    const result = await caller.posts.list();

    if (result.length > 0) {
      const post = result[0];
      expect(post).toHaveProperty("id");
      expect(post).toHaveProperty("title");
      expect(post).toHaveProperty("content");
      expect(post).toHaveProperty("category");
      expect(post).toHaveProperty("createdAt");
    }
  });
});
