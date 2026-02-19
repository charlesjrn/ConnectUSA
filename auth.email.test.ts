import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";
import * as db from "./db";

describe("Email/Password Authentication", () => {
  let testContext: Context;

  beforeEach(async () => {
    // Create a mock context
    testContext = {
      req: {
        headers: {},
        protocol: "https",
      } as any,
      res: {
        cookie: () => {},
        clearCookie: () => {},
      } as any,
      user: null,
    };
  });

  it("should create a new user with email and password", async () => {
    const caller = appRouter.createCaller(testContext);

    const result = await caller.auth.signup({
      email: `test-${Date.now()}@example.com`,
      password: "testpassword123",
      name: "Test User",
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.email).toContain("test-");
    expect(result.user.name).toBe("Test User");
  });

  it("should not allow duplicate email registration", async () => {
    const caller = appRouter.createCaller(testContext);
    const email = `duplicate-${Date.now()}@example.com`;

    // First signup should succeed
    await caller.auth.signup({
      email,
      password: "testpassword123",
      name: "Test User",
    });

    // Second signup with same email should fail
    await expect(
      caller.auth.signup({
        email,
        password: "anotherpassword",
        name: "Another User",
      })
    ).rejects.toThrow();
  });

  it("should login with correct email and password", async () => {
    const caller = appRouter.createCaller(testContext);
    const email = `login-${Date.now()}@example.com`;
    const password = "testpassword123";

    // Create user
    await caller.auth.signup({
      email,
      password,
      name: "Test User",
    });

    // Login should succeed
    const result = await caller.auth.login({
      email,
      password,
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(email);
  });

  it("should reject login with incorrect password", async () => {
    const caller = appRouter.createCaller(testContext);
    const email = `wrongpass-${Date.now()}@example.com`;

    // Create user
    await caller.auth.signup({
      email,
      password: "correctpassword",
      name: "Test User",
    });

    // Login with wrong password should fail
    await expect(
      caller.auth.login({
        email,
        password: "wrongpassword",
      })
    ).rejects.toThrow();
  });

  it("should reject login for non-existent user", async () => {
    const caller = appRouter.createCaller(testContext);

    await expect(
      caller.auth.login({
        email: "nonexistent@example.com",
        password: "anypassword",
      })
    ).rejects.toThrow();
  });

  it("should enforce minimum password length", async () => {
    const caller = appRouter.createCaller(testContext);

    await expect(
      caller.auth.signup({
        email: `short-${Date.now()}@example.com`,
        password: "short",
        name: "Test User",
      })
    ).rejects.toThrow();
  });
});
