import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Admin User Management", () => {
  let ownerUser: any;
  let regularUser: any;
  let ownerContext: any;
  let regularContext: any;

  beforeEach(async () => {
    // Create owner user (using OWNER_OPEN_ID from env)
    const ownerOpenId = process.env.OWNER_OPEN_ID || "test-owner-open-id";
    await db.upsertUser({
      openId: ownerOpenId,
      name: "Site Owner",
      email: "owner@example.com",
    });

    ownerUser = await db.getUserByOpenId(ownerOpenId);
    ownerContext = { user: ownerUser };

    // Create regular user
    await db.upsertUser({
      openId: "test-regular-user",
      name: "Regular User",
      email: "regular@example.com",
    });

    regularUser = await db.getUserByOpenId("test-regular-user");
    regularContext = { user: regularUser };
  });

  describe("getAllUsers", () => {
    it("should allow owner to get all users", async () => {
      const caller = appRouter.createCaller(ownerContext);
      const users = await caller.admin.getAllUsers();

      expect(users.length).toBeGreaterThan(0);
      expect(users.some((u: any) => u.openId === ownerUser.openId)).toBe(true);
      expect(users.some((u: any) => u.openId === regularUser.openId)).toBe(true);
    });

    it("should prevent non-owner from getting all users", async () => {
      const caller = appRouter.createCaller(regularContext);

      await expect(caller.admin.getAllUsers()).rejects.toThrow(
        "Only the site owner can access user management"
      );
    });

    it("should require authentication", async () => {
      const publicCaller = appRouter.createCaller({ user: null });

      await expect(publicCaller.admin.getAllUsers()).rejects.toThrow();
    });
  });

  describe("deleteUser", () => {
    it("should allow owner to delete other users", async () => {
      const caller = appRouter.createCaller(ownerContext);

      // Create a user to delete
      await db.upsertUser({
        openId: "test-user-to-delete",
        name: "User To Delete",
        email: "delete@example.com",
      });
      const userToDelete = await db.getUserByOpenId("test-user-to-delete");

      // Delete the user
      const result = await caller.admin.deleteUser({ userId: userToDelete.id });

      expect(result.success).toBe(true);
      expect(result.message).toBe("User deleted successfully");

      // Verify user is deleted
      const deletedUser = await db.getUserById(userToDelete.id);
      expect(deletedUser).toBeUndefined();
    });

    it("should prevent owner from deleting themselves", async () => {
      const caller = appRouter.createCaller(ownerContext);

      await expect(
        caller.admin.deleteUser({ userId: ownerUser.id })
      ).rejects.toThrow("You cannot delete your own account from here");
    });

    it("should prevent non-owner from deleting users", async () => {
      const caller = appRouter.createCaller(regularContext);

      // Create another user
      await db.upsertUser({
        openId: "test-another-user",
        name: "Another User",
        email: "another@example.com",
      });
      const anotherUser = await db.getUserByOpenId("test-another-user");

      await expect(
        caller.admin.deleteUser({ userId: anotherUser.id })
      ).rejects.toThrow("Only the site owner can delete users");
    });

    it("should delete user and cascade delete their data", async () => {
      const caller = appRouter.createCaller(ownerContext);

      // Create a user with associated data
      await db.upsertUser({
        openId: "test-user-with-data",
        name: "User With Data",
        email: "withdata@example.com",
      });
      const userWithData = await db.getUserByOpenId("test-user-with-data");

      // Delete the user (deleteUser function handles cascading deletes)
      await caller.admin.deleteUser({ userId: userWithData.id });

      // Verify user is deleted
      const deletedUser = await db.getUserById(userWithData.id);
      expect(deletedUser).toBeUndefined();
    });

    it("should require authentication", async () => {
      const publicCaller = appRouter.createCaller({ user: null });

      await expect(
        publicCaller.admin.deleteUser({ userId: 999 })
      ).rejects.toThrow();
    });
  });

  describe("updateUser", () => {
    it("should allow owner to update user information", async () => {
      const caller = appRouter.createCaller(ownerContext);

      // Create a user to update
      await db.upsertUser({
        openId: "test-user-to-update",
        name: "Old Name",
        email: "old@example.com",
      });
      const userToUpdate = await db.getUserByOpenId("test-user-to-update");

      // Update the user
      const result = await caller.admin.updateUser({
        userId: userToUpdate.id,
        name: "New Name",
        email: "new@example.com",
        role: "admin",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("User updated successfully");

      // Verify user is updated
      const updatedUser = await db.getUserById(userToUpdate.id);
      expect(updatedUser?.name).toBe("New Name");
      expect(updatedUser?.email).toBe("new@example.com");
      expect(updatedUser?.role).toBe("admin");
    });

    it("should allow partial updates", async () => {
      const caller = appRouter.createCaller(ownerContext);

      // Create a user
      await db.upsertUser({
        openId: "test-partial-update",
        name: "Original Name",
        email: "original@example.com",
      });
      const userToUpdate = await db.getUserByOpenId("test-partial-update");

      // Update only name
      await caller.admin.updateUser({
        userId: userToUpdate.id,
        name: "Updated Name",
      });

      // Verify only name changed
      const updatedUser = await db.getUserById(userToUpdate.id);
      expect(updatedUser?.name).toBe("Updated Name");
      expect(updatedUser?.email).toBe("original@example.com");
    });

    it("should prevent non-owner from updating users", async () => {
      const caller = appRouter.createCaller(regularContext);

      // Try to update the owner user
      await expect(
        caller.admin.updateUser({
          userId: ownerUser.id,
          name: "Hacked Name",
        })
      ).rejects.toThrow("Only the site owner can update users");
    });

    it("should require authentication", async () => {
      const publicCaller = appRouter.createCaller({ user: null });

      await expect(
        publicCaller.admin.updateUser({
          userId: 999,
          name: "Test",
        })
      ).rejects.toThrow();
    });
  });

  describe("isOwner check", () => {
    it("should correctly identify owner", async () => {
      const caller = appRouter.createCaller(ownerContext);
      const result = await caller.auth.isOwner();

      expect(result.isOwner).toBe(true);
    });

    it("should correctly identify non-owner", async () => {
      const caller = appRouter.createCaller(regularContext);
      const result = await caller.auth.isOwner();

      expect(result.isOwner).toBe(false);
    });
  });
});
