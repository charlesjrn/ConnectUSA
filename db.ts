import { eq, desc, and, or, ne, like, sql, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, messages, InsertMessage, events, InsertEvent, directMessages, InsertDirectMessage, comments, InsertComment, likes, InsertLike, passwordResetTokens, InsertPasswordResetToken, notifications, InsertNotification, pageViews, InsertPageView, dailyAnalytics, InsertDailyAnalytics, videoRooms, InsertVideoRoom, follows, InsertFollow, photoGallery, InsertPhotoGallery, badges, InsertBadge, userBadges, InsertUserBadge, referrals, InsertReferral, dailyVerses, InsertDailyVerse, userFavoriteVerses, InsertUserFavoriteVerse, donations, InsertDonation, paidEvents, InsertPaidEvent, eventRegistrations, InsertEventRegistration, postLikes, InsertPostLike, commentLikes, InsertCommentLike, memberships, InsertMembership, journeyMilestones, InsertJourneyMilestone, emailSubscribers, InsertEmailSubscriber } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createEmailUser(data: {
  email: string;
  passwordHash: string;
  name: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(users).values({
    openId: `email:${data.email}`, // Use email as openId for email users
    email: data.email,
    passwordHash: data.passwordHash,
    name: data.name,
    loginMethod: "email",
    role: "user",
  });
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, userId));
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(users)
    .set({ passwordHash })
    .where(eq(users.id, userId));
}

// Follow system functions
export async function followUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db.insert(follows).values({ followerId, followingId });
}

export async function unfollowUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db.delete(follows)
    .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
}

export async function getFollowing(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      profilePicture: users.profilePicture,
      location: users.location,
      lastSeen: users.lastSeen,
      followedAt: follows.createdAt,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followingId, users.id))
    .where(eq(follows.followerId, userId))
    .orderBy(desc(follows.createdAt));
  return result;
}

export async function getFollowers(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      profilePicture: users.profilePicture,
      location: users.location,
      lastSeen: users.lastSeen,
      followedAt: follows.createdAt,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followerId, users.id))
    .where(eq(follows.followingId, userId))
    .orderBy(desc(follows.createdAt));
  return result;
}

export async function isFollowing(followerId: number, followingId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db
    .select()
    .from(follows)
    .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
    .limit(1);
  return result.length > 0;
}

export async function getFollowCounts(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const followingCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(follows)
    .where(eq(follows.followerId, userId));
  const followersCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(follows)
    .where(eq(follows.followingId, userId));
  return {
    following: Number(followingCount[0]?.count || 0),
    followers: Number(followersCount[0]?.count || 0),
  };
}

export async function updateLastSeen(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db
    .update(users)
    .set({ lastSeen: new Date() })
    .where(eq(users.id, userId));
}

export async function updateUserInfo(userId: number, updates: { name?: string; email?: string; role?: 'admin' | 'user' }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.role !== undefined) updateData.role = updates.role;

  await db.update(users)
    .set(updateData)
    .where(eq(users.id, userId));
}

export async function getUsersWithLocations() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    profilePicture: users.profilePicture,
    location: users.location,
    latitude: users.latitude,
    longitude: users.longitude,
    bio: users.bio,
  })
    .from(users)
    .where(sql`${users.latitude} IS NOT NULL AND ${users.longitude} IS NOT NULL`);
}

export async function updateUserProfile(userId: number, updates: { 
  bio?: string; 
  spiritualGifts?: string; 
  chosenDate?: Date | null; 
  profilePicture?: string | null; 
  location?: string; 
  latitude?: string; 
  longitude?: string;
  onboardingCompleted?: boolean;
  emailComments?: boolean;
  emailDirectMessages?: boolean;
  emailWeeklyDigest?: boolean;
  emailLikes?: boolean;
  emailPrayers?: boolean;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: any = {};
  if (updates.bio !== undefined) updateData.bio = updates.bio;
  if (updates.spiritualGifts !== undefined) updateData.spiritualGifts = updates.spiritualGifts;
  if (updates.chosenDate !== undefined) updateData.chosenDate = updates.chosenDate;
  if (updates.profilePicture !== undefined) updateData.profilePicture = updates.profilePicture;
  if (updates.location !== undefined) updateData.location = updates.location;
  if (updates.latitude !== undefined) updateData.latitude = updates.latitude;
  if (updates.longitude !== undefined) updateData.longitude = updates.longitude;
  if (updates.onboardingCompleted !== undefined) updateData.onboardingCompleted = updates.onboardingCompleted;
  if (updates.emailComments !== undefined) updateData.emailComments = updates.emailComments;
  if (updates.emailDirectMessages !== undefined) updateData.emailDirectMessages = updates.emailDirectMessages;
  if (updates.emailWeeklyDigest !== undefined) updateData.emailWeeklyDigest = updates.emailWeeklyDigest;
  if (updates.emailLikes !== undefined) updateData.emailLikes = updates.emailLikes;
  if (updates.emailPrayers !== undefined) updateData.emailPrayers = updates.emailPrayers;

  await db.update(users)
    .set(updateData)
    .where(eq(users.id, userId));
}

export async function searchMembers(searchTerm: string, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Convert search term to lowercase for case-insensitive search
  const lowerSearchTerm = searchTerm.toLowerCase();

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      bio: users.bio,
      spiritualGifts: users.spiritualGifts,
      chosenDate: users.chosenDate,
      profilePicture: users.profilePicture,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(sql`LOWER(${users.name}) LIKE ${`%${lowerSearchTerm}%`}`)
    .limit(limit);

  // Pin Albert Rosebruch profiles to the top
  const albertProfiles = result.filter(u => 
    u.name?.toLowerCase().includes('albert rosebruch') || 
    u.email?.toLowerCase().includes('albert')
  );
  const otherProfiles = result.filter(u => 
    !u.name?.toLowerCase().includes('albert rosebruch') && 
    !u.email?.toLowerCase().includes('albert')
  );

  return [...albertProfiles, ...otherProfiles];
}

export async function getAllMembers(limit: number = 100) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      bio: users.bio,
      spiritualGifts: users.spiritualGifts,
      chosenDate: users.chosenDate,
      profilePicture: users.profilePicture,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit);

  // Pin Albert Rosebruch profiles to the top
  const albertProfiles = result.filter(u => 
    u.name?.toLowerCase().includes('albert rosebruch') || 
    u.email?.toLowerCase().includes('albert')
  );
  const otherProfiles = result.filter(u => 
    !u.name?.toLowerCase().includes('albert rosebruch') && 
    !u.email?.toLowerCase().includes('albert')
  );

  return [...albertProfiles, ...otherProfiles];
}

// Message queries for chatrooms
export async function createMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.insert(messages).values(message);
  return result;
}

export async function getMessagesByRoom(room: "gift" | "vision" | "encounter" | "testimony" | "prayer" | "missions" | "chatroom" | "meetup" | "prayer-requests", limit: number = 100) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db
    .select({
      id: messages.id,
      title: messages.title,
      category: messages.category,
      isAnonymous: messages.isAnonymous,
      userId: messages.userId,
      content: messages.content,
      room: messages.room,
      viewCount: messages.viewCount,
      createdAt: messages.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.room, room))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
  return result.reverse(); // Return oldest first for chat display
}

export async function getAllMessages(limit: number = 100) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db
    .select({
      id: messages.id,
      title: messages.title,
      category: messages.category,
      isAnonymous: messages.isAnonymous,
      userId: messages.userId,
      content: messages.content,
      room: messages.room,
      viewCount: messages.viewCount,
      createdAt: messages.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .where(and(
      ne(messages.room, "chatroom")
    ))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
  return result.reverse();
}

export async function getMessagesByUserId(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db
    .select({
      id: messages.id,
      title: messages.title,
      category: messages.category,
      isAnonymous: messages.isAnonymous,
      userId: messages.userId,
      content: messages.content,
      room: messages.room,
      viewCount: messages.viewCount,
      createdAt: messages.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.userId, userId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
  return result;
}

// Event queries for meetups
export async function createEvent(event: InsertEvent) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.insert(events).values(event);
  return result;
}

export async function getAllEvents() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.select().from(events).orderBy(events.eventDate);
  return result;
}

// Direct message queries
export async function sendDirectMessage(message: InsertDirectMessage) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.insert(directMessages).values(message);
  return result;
}

export async function getDirectMessages(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select({
      id: directMessages.id,
      senderId: directMessages.senderId,
      receiverId: directMessages.receiverId,
      content: directMessages.content,
      createdAt: directMessages.createdAt,
      senderName: users.name,
      senderEmail: users.email,
    })
    .from(directMessages)
    .leftJoin(users, eq(directMessages.senderId, users.id))
    .where(
      or(
        and(eq(directMessages.senderId, userId1), eq(directMessages.receiverId, userId2)),
        and(eq(directMessages.senderId, userId2), eq(directMessages.receiverId, userId1))
      )
    )
    .orderBy(directMessages.createdAt);

  return result;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.select().from(users).orderBy(users.name);
  return result;
}


// Comment helpers
export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(comments).values(comment);
}

export async function getCommentsByMessageId(messageId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      isEdited: comments.isEdited,
      editedAt: comments.editedAt,
      userId: comments.userId,
      userName: users.name,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.messageId, messageId))
    .orderBy(comments.createdAt);
  
  return results;
}

// ================== Likes ==================

export async function likeMessage(userId: number, messageId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(likes).values({ userId, messageId });
}

export async function unlikeMessage(userId: number, messageId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.messageId, messageId)));
}

export async function getLikeCount(messageId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select().from(likes).where(eq(likes.messageId, messageId));
  return result.length;
}

export async function hasUserLikedMessage(userId: number, messageId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db.select().from(likes).where(and(eq(likes.userId, userId), eq(likes.messageId, messageId)));
  return result.length > 0;
}

export async function getLikesForMessages(messageIds: number[]): Promise<Map<number, number>> {
  const db = await getDb();
  if (!db) return new Map();

  const result = await db.select().from(likes).where(eq(likes.messageId, messageIds[0]));
  const likeCounts = new Map<number, number>();
  
  for (const messageId of messageIds) {
    const count = result.filter(like => like.messageId === messageId).length;
    likeCounts.set(messageId, count);
  }
  
  return likeCounts;
}

export async function getMessageLikes(messageId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      userId: likes.userId,
      userName: users.name,
      userEmail: users.email,
      profilePicture: users.profilePicture,
      createdAt: likes.createdAt,
    })
    .from(likes)
    .leftJoin(users, eq(likes.userId, users.id))
    .where(eq(likes.messageId, messageId))
    .orderBy(desc(likes.createdAt));

  return result;
}

// ================== Password Reset Tokens ==================

export async function createPasswordResetToken(token: InsertPasswordResetToken): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(passwordResetTokens).values(token);
}

export async function getPasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  return result[0] || null;
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
}

export async function deleteExpiredPasswordResetTokens(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Delete tokens where expiresAt is less than current time
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.expiresAt, new Date()));
}

export async function deleteMessage(messageId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(messages).where(eq(messages.id, messageId));
}

export async function editMessage(messageId: number, updates: { title?: string; content?: string }): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(messages).set(updates).where(eq(messages.id, messageId));
}

export async function deleteUser(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete user's messages, comments, likes, etc.
  await db.delete(comments).where(eq(comments.userId, userId));
  await db.delete(likes).where(eq(likes.userId, userId));
  await db.delete(messages).where(eq(messages.userId, userId));
  await db.delete(directMessages).where(eq(directMessages.senderId, userId));
  await db.delete(notifications).where(eq(notifications.userId, userId));
  
  // Finally delete the user
  await db.delete(users).where(eq(users.id, userId));
}

export async function getMessageById(messageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
  return result[0] || null;
}

// ================== Notifications ==================

export async function createNotification(notification: InsertNotification): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(notifications).values(notification);
}

export async function getUserNotifications(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
  
  return results;
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const results = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  
  return results.length;
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}


export async function getMyPrayers(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const { prayerCounts } = await import("../drizzle/schema");

  return await db
    .select({
      id: messages.id,
      content: messages.content,
      title: messages.title,
      category: messages.category,
      isAnonymous: messages.isAnonymous,
      isAnswered: messages.isAnswered,
      answeredTestimony: messages.answeredTestimony,
      isUrgent: messages.isUrgent,
      createdAt: messages.createdAt,
      userId: messages.userId,
      userName: users.name,
      prayerCount: sql<number>`(SELECT COUNT(*) FROM prayer_counts WHERE message_id = ${messages.id})`,
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .innerJoin(prayerCounts, eq(prayerCounts.messageId, messages.id))
    .where(and(eq(prayerCounts.userId, userId), eq(messages.room, "prayer-requests")))
    .orderBy(desc(messages.createdAt));
}

// ================== Prayer Counts ==================

export async function addPrayerCount(messageId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { prayerCounts } = await import("../drizzle/schema");
  
  await db.insert(prayerCounts).values({
    messageId,
    userId,
  });
}

export async function removePrayerCount(messageId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { prayerCounts } = await import("../drizzle/schema");
  
  await db.delete(prayerCounts).where(
    and(eq(prayerCounts.messageId, messageId), eq(prayerCounts.userId, userId))
  );
}

export async function markPrayerAnswered(messageId: number, answeredTestimony: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(messages)
    .set({ 
      isAnswered: true,
      answeredTestimony: answeredTestimony 
    })
    .where(eq(messages.id, messageId));
}

// ================== Comments ==================

export async function getCommentById(commentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
  return result[0] || null;
}

export async function deleteComment(commentId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(comments).where(eq(comments.id, commentId));
}

export async function editComment(commentId: number, content: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(comments)
    .set({ 
      content,
      isEdited: true,
      editedAt: new Date()
    })
    .where(eq(comments.id, commentId));
}

// ================== Active Visitors ==================

export async function updateVisitorHeartbeat(sessionId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { activeVisitors } = await import("../drizzle/schema");
  
  // Upsert: insert or update lastSeen timestamp
  await db
    .insert(activeVisitors)
    .values({
      sessionId,
      lastSeen: new Date(),
    })
    .onDuplicateKeyUpdate({
      set: { lastSeen: new Date() }
    });
}

export async function getActiveVisitorCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const { activeVisitors } = await import("../drizzle/schema");
  
  // Consider visitors active if they've sent a heartbeat in the last 30 seconds
  const thirtySecondsAgo = new Date(Date.now() - 30000);
  
  const results = await db
    .select()
    .from(activeVisitors)
    .where(sql`${activeVisitors.lastSeen} > ${thirtySecondsAgo}`);
  
  return results.length;
}

export async function cleanupStaleVisitors(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const { activeVisitors } = await import("../drizzle/schema");
  
  // Remove visitors who haven't sent a heartbeat in the last 60 seconds
  const sixtySecondsAgo = new Date(Date.now() - 60000);
  
  await db
    .delete(activeVisitors)
    .where(sql`${activeVisitors.lastSeen} < ${sixtySecondsAgo}`);
}


// ============================================================================
// Analytics Functions
// ============================================================================

export async function trackPageView(data: {
  sessionId: string;
  userId?: number;
  pagePath: string;
  referrer?: string;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(pageViews).values(data);
}

export async function getAnalyticsSummary() {
  const db = await getDb();
  if (!db) return { totalPageViews: 0, uniqueVisitors: 0, registeredUsers: 0 };
  
  const [totalViews] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(pageViews);
  
  const [uniqueVisitors] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${pageViews.sessionId})` })
    .from(pageViews);
  
  const [registeredUsers] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users);

  return {
    totalPageViews: totalViews.count || 0,
    uniqueVisitors: uniqueVisitors.count || 0,
    registeredUsers: registeredUsers.count || 0,
  };
}

export async function getPageViewsByDate(days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      date: sql<string>`DATE(${pageViews.createdAt})`,
      views: sql<number>`COUNT(*)`,
      uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageViews.sessionId})`,
    })
    .from(pageViews)
    .where(sql`${pageViews.createdAt} >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`)
    .groupBy(sql`DATE(${pageViews.createdAt})`)
    .orderBy(sql`DATE(${pageViews.createdAt}) DESC`);

  return result;
}

export async function getPopularPages(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      pagePath: pageViews.pagePath,
      views: sql<number>`COUNT(*)`,
      uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageViews.sessionId})`,
    })
    .from(pageViews)
    .groupBy(pageViews.pagePath)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(limit);

  return result;
}

export async function getMemberCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: sql<number>`count(*)` }).from(users);
  return result[0]?.count || 0;
}

export async function getRecentActivityStats() {
  const db = await getDb();
  if (!db) return { newTestimoniesThisWeek: 0, newPrayersThisWeek: 0, newMembersThisWeek: 0 };
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // Count testimonies from the past week
  const testimonies = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(and(
      eq(messages.room, "testimony"),
      gte(messages.createdAt, oneWeekAgo)
    ));
  
  // Count prayer requests from the past week
  const prayers = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(and(
      eq(messages.room, "prayer-requests"),
      gte(messages.createdAt, oneWeekAgo)
    ));
  
  // Count new members from the past week
  const newMembers = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, oneWeekAgo));
  
  return {
    newTestimoniesThisWeek: testimonies[0]?.count || 0,
    newPrayersThisWeek: prayers[0]?.count || 0,
    newMembersThisWeek: newMembers[0]?.count || 0,
  };
}

export async function getFeaturedTestimonies(limit: number = 5) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(messages)
    .where(and(
      eq(messages.room, "testimony"),
      eq(messages.isFeatured, true)
    ))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function toggleFeatured(messageId: number, isFeatured: boolean): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(messages)
    .set({ isFeatured })
    .where(eq(messages.id, messageId));
}




// Video Rooms
export async function createVideoRoom(room: {
  roomName: string;
  roomUrl: string;
  hostId: number;
  hostName: string;
  description?: string;
  maxParticipants?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(videoRooms).values(room);
  return result;
}

export async function getActiveVideoRooms() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(videoRooms).where(eq(videoRooms.isActive, true)).orderBy(desc(videoRooms.createdAt));
}

export async function getVideoRoomById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rooms = await db.select().from(videoRooms).where(eq(videoRooms.id, id));
  return rooms[0] || null;
}

export async function endVideoRoom(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(videoRooms).set({ isActive: false, endedAt: new Date() }).where(eq(videoRooms.id, id));
}

export async function deleteVideoRoom(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(videoRooms).where(eq(videoRooms.id, id));
}


// Photo Gallery
export async function addPhotoToGallery(photo: {
  userId: number;
  photoUrl: string;
  caption?: string;
  displayOrder?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(photoGallery).values(photo);
  return result;
}

export async function getUserPhotoGallery(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(photoGallery)
    .where(eq(photoGallery.userId, userId))
    .orderBy(photoGallery.displayOrder, desc(photoGallery.createdAt));
}

export async function deletePhotoFromGallery(photoId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(photoGallery)
    .where(and(
      eq(photoGallery.id, photoId),
      eq(photoGallery.userId, userId)
    ));
}

export async function updatePhotoCaption(photoId: number, userId: number, caption: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(photoGallery)
    .set({ caption })
    .where(and(
      eq(photoGallery.id, photoId),
      eq(photoGallery.userId, userId)
    ));
}

export async function updatePhotoOrder(photoId: number, userId: number, displayOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(photoGallery)
    .set({ displayOrder })
    .where(and(
      eq(photoGallery.id, photoId),
      eq(photoGallery.userId, userId)
    ));
}

// Profile Picture Moderation
export async function getPendingProfilePictures() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(users)
    .where(eq(users.profilePictureStatus, "pending"))
    .orderBy(desc(users.updatedAt));
}

export async function updateProfilePictureStatus(userId: number, status: "approved" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(users)
    .set({ profilePictureStatus: status })
    .where(eq(users.id, userId));
}

export async function updateAvatarCustomization(userId: number, options: {
  avatarBackgroundColor?: string;
  avatarIcon?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(users)
    .set(options)
    .where(eq(users.id, userId));
}


// Badges & Achievements
export async function getAllBadges() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(badges).orderBy(badges.id);
}

export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      id: userBadges.id,
      badgeId: userBadges.badgeId,
      earnedAt: userBadges.earnedAt,
      name: badges.name,
      description: badges.description,
      icon: badges.icon,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId))
    .orderBy(desc(userBadges.earnedAt));
}

export async function awardBadge(userId: number, badgeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if user already has this badge
  const existing = await db
    .select()
    .from(userBadges)
    .where(and(
      eq(userBadges.userId, userId),
      eq(userBadges.badgeId, badgeId)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    return false; // Already has badge
  }
  
  await db.insert(userBadges).values({ userId, badgeId });
  return true;
}

export async function checkAndAwardBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const newBadges: number[] = [];
  
  // Get user's activity counts
  const testimonyCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(and(
      eq(messages.userId, userId),
      eq(messages.room, "testimony")
    ));
  
  const prayerCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(and(
      eq(messages.userId, userId),
      eq(messages.room, "prayer-requests")
    ));
  
  const commentCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(comments)
    .where(eq(comments.userId, userId));
  
  // Check each badge criteria
  const allBadges = await getAllBadges();
  
  for (const badge of allBadges) {
    const criteria = JSON.parse(badge.criteria);
    let earned = false;
    
    if (criteria.type === "testimony_count" && testimonyCount[0].count >= criteria.count) {
      earned = true;
    } else if (criteria.type === "prayer_count" && prayerCount[0].count >= criteria.count) {
      earned = true;
    } else if (criteria.type === "comment_count" && commentCount[0].count >= criteria.count) {
      earned = true;
    }
    
    if (earned) {
      const awarded = await awardBadge(userId, badge.id);
      if (awarded) {
        newBadges.push(badge.id);
      }
    }
  }
  
  return newBadges;
}


// Referral System
export async function generateReferralCode(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Generate a unique 8-character code
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  await db
    .update(users)
    .set({ referralCode: code })
    .where(eq(users.id, userId));
  
  return code;
}

export async function getReferralStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalReferred: 0, activeReferred: 0, referralCode: null };
  
  const user = await db
    .select({ referralCode: users.referralCode })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (!user[0] || !user[0].referralCode) {
    return { totalReferred: 0, activeReferred: 0, referralCode: null };
  }
  
  const totalReferred = await db
    .select({ count: sql<number>`count(*)` })
    .from(referrals)
    .where(eq(referrals.referrerId, userId));
  
  const activeReferred = await db
    .select({ count: sql<number>`count(*)` })
    .from(referrals)
    .where(and(
      eq(referrals.referrerId, userId),
      eq(referrals.status, "completed")
    ));
  
  return {
    totalReferred: totalReferred[0].count,
    activeReferred: activeReferred[0].count,
    referralCode: user[0].referralCode,
  };
}

export async function trackReferralSignup(referralCode: string, newUserId: number) {
  const db = await getDb();
  if (!db) return false;
  
  // Find the referrer by code
  const referrer = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.referralCode, referralCode))
    .limit(1);
  
  if (!referrer[0]) return false;
  
  // Create referral record
  await db.insert(referrals).values({
    referrerId: referrer[0].id,
    referredUserId: newUserId,
    referralCode,
    status: "completed",
    completedAt: new Date(),
  });
  
  // Check if referrer should get Evangelist badge (5+ successful referrals)
  const referralCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(referrals)
    .where(and(
      eq(referrals.referrerId, referrer[0].id),
      eq(referrals.status, "completed")
    ));
  
  if (referralCount[0].count >= 5) {
    // Award Evangelist badge (badge ID 6, needs to be created)
    await awardBadge(referrer[0].id, 6);
  }
  
  return true;
}

export async function getReferralLeaderboard(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      userId: referrals.referrerId,
      userName: users.name,
      profilePicture: users.profilePicture,
      count: sql<number>`count(*)`,
    })
    .from(referrals)
    .innerJoin(users, eq(referrals.referrerId, users.id))
    .where(eq(referrals.status, "completed"))
    .groupBy(referrals.referrerId, users.name, users.profilePicture)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}


// ============================================================================
// Daily Verses Functions
// ============================================================================

/**
 * Get today's verse of the day
 */
export async function getTodaysVerse() {
  const db = await getDb();
  if (!db) return null;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const result = await db.select().from(dailyVerses).where(sql`${dailyVerses.date} = ${today}`).limit(1);
  return result[0] || null;
}

/**
 * Get all verses (archive)
 */
export async function getAllVerses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dailyVerses).orderBy(desc(dailyVerses.date));
}

/**
 * Get user's favorite verses
 */
export async function getUserFavoriteVerses(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const favorites = await db
    .select({
      id: dailyVerses.id,
      verseText: dailyVerses.verseText,
      reference: dailyVerses.reference,
      date: dailyVerses.date,
      favoritedAt: userFavoriteVerses.createdAt,
    })
    .from(userFavoriteVerses)
    .innerJoin(dailyVerses, eq(userFavoriteVerses.verseId, dailyVerses.id))
    .where(eq(userFavoriteVerses.userId, userId))
    .orderBy(desc(userFavoriteVerses.createdAt));
  
  return favorites;
}

/**
 * Check if user has favorited a verse
 */
export async function isVerseFavorited(userId: number, verseId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(userFavoriteVerses)
    .where(and(
      eq(userFavoriteVerses.userId, userId),
      eq(userFavoriteVerses.verseId, verseId)
    ))
    .limit(1);
  
  return result.length > 0;
}

/**
 * Add verse to user's favorites
 */
export async function favoriteVerse(userId: number, verseId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(userFavoriteVerses).values({ userId, verseId });
}

/**
 * Remove verse from user's favorites
 */
export async function unfavoriteVerse(userId: number, verseId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(userFavoriteVerses)
    .where(and(
      eq(userFavoriteVerses.userId, userId),
      eq(userFavoriteVerses.verseId, verseId)
    ));
}

export async function getMemberSpotlight() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  // Get user with most testimonies and likes
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      testimonyCount: sql<number>`COUNT(DISTINCT ${messages.id})`.as('testimonyCount'),
      totalLikes: sql<number>`COALESCE(SUM(${likes.id}), 0)`.as('totalLikes'),
    })
    .from(users)
    .leftJoin(messages, and(
      eq(messages.userId, users.id),
      ne(messages.room, "chatroom"),
      ne(messages.room, "prayer-room")
    ))
    .leftJoin(likes, eq(likes.messageId, messages.id))
    .groupBy(users.id)
    .having(sql`COUNT(DISTINCT ${messages.id}) > 0`)
    .orderBy(desc(sql`COUNT(DISTINCT ${messages.id})`), desc(sql`COALESCE(SUM(${likes.id}), 0)`))
    .limit(1);
  
  if (result.length === 0) return null;
  
  const spotlightUser = result[0];
  
  // Get their latest testimony
  const latestTestimony = await db
    .select({
      id: messages.id,
      title: messages.title,
      content: messages.content,
    })
    .from(messages)
    .where(and(
      eq(messages.userId, spotlightUser.id),
      ne(messages.room, "chatroom"),
      ne(messages.room, "prayer-room")
    ))
    .orderBy(desc(messages.createdAt))
    .limit(1);
  
  return {
    ...spotlightUser,
    latestTestimony: latestTestimony[0] || null,
  };
}

export async function getFeaturedMember() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const result = await db
    .select({
      id: users.id,
      name: users.name,
    })
    .from(users)
    .where(eq(users.isFeaturedMember, true))
    .limit(1);
  
  if (result.length === 0) return null;
  
  const featuredUser = result[0];
  
  // Get their testimony stats
  const stats = await db
    .select({
      testimonyCount: sql<number>`COUNT(DISTINCT ${messages.id})`.as('testimonyCount'),
      totalLikes: sql<number>`COALESCE(SUM(${likes.id}), 0)`.as('totalLikes'),
    })
    .from(messages)
    .leftJoin(likes, eq(likes.messageId, messages.id))
    .where(and(
      eq(messages.userId, featuredUser.id),
      ne(messages.room, "chatroom"),
      ne(messages.room, "prayer-room")
    ))
    .groupBy(messages.userId);
  
  // Get their latest testimony
  const latestTestimony = await db
    .select({
      id: messages.id,
      title: messages.title,
      content: messages.content,
    })
    .from(messages)
    .where(and(
      eq(messages.userId, featuredUser.id),
      ne(messages.room, "chatroom"),
      ne(messages.room, "prayer-room")
    ))
    .orderBy(desc(messages.createdAt))
    .limit(1);
  
  return {
    id: featuredUser.id,
    name: featuredUser.name,
    testimonyCount: stats[0]?.testimonyCount || 0,
    totalLikes: stats[0]?.totalLikes || 0,
    latestTestimony: latestTestimony[0] || null,
  };
}

export async function setFeaturedMember(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  // Clear any existing featured member
  await db.update(users).set({ isFeaturedMember: false }).where(eq(users.isFeaturedMember, true));
  
  // Set the new featured member
  await db.update(users).set({ isFeaturedMember: true }).where(eq(users.id, userId));
}

export async function clearFeaturedMember() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  await db.update(users).set({ isFeaturedMember: false }).where(eq(users.isFeaturedMember, true));
}

export async function getAllMembersForAdmin() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      isFeaturedMember: users.isFeaturedMember,
    })
    .from(users)
    .orderBy(users.name);
  
  return members;
}


/**
 * ========================================
 * DONATIONS
 * ========================================
 */

/**
 * Create a new donation record
 */
export async function createDonation(donation: InsertDonation) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const result = await db.insert(donations).values(donation);
  return result;
}

/**
 * Update donation status
 */
export async function updateDonationStatus(
  stripePaymentIntentId: string,
  status: "pending" | "completed" | "failed" | "cancelled"
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  await db
    .update(donations)
    .set({ status })
    .where(eq(donations.stripePaymentIntentId, stripePaymentIntentId));
}

/**
 * Get user's donation history
 */
export async function getUserDonations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(donations)
    .where(eq(donations.userId, userId))
    .orderBy(desc(donations.createdAt));
}

/**
 * Get all donations (admin)
 */
export async function getAllDonations() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(donations)
    .orderBy(desc(donations.createdAt));
}

/**
 * Get donation analytics
 */
export async function getDonationAnalytics() {
  const db = await getDb();
  if (!db) {
    return {
      totalRaised: 0,
      totalDonors: 0,
      recurringDonors: 0,
      oneTimeDonors: 0,
    };
  }
  
  // Note: We're not storing amounts locally per Stripe best practices
  // This function would need to query Stripe API for actual amounts
  // For now, we return counts only
  
  const allDonations = await db
    .select({
      userId: donations.userId,
      isRecurring: donations.isRecurring,
      status: donations.status,
    })
    .from(donations)
    .where(eq(donations.status, "completed"));
  
  const uniqueDonors = new Set(allDonations.map(d => d.userId).filter(Boolean));
  const recurringDonors = new Set(
    allDonations.filter(d => d.isRecurring).map(d => d.userId).filter(Boolean)
  );
  const oneTimeDonors = new Set(
    allDonations.filter(d => !d.isRecurring).map(d => d.userId).filter(Boolean)
  );
  
  return {
    totalDonors: uniqueDonors.size,
    recurringDonors: recurringDonors.size,
    oneTimeDonors: oneTimeDonors.size,
    totalDonations: allDonations.length,
  };
}

/**
 * ========================================
 * PAID EVENTS
 * ========================================
 */

/**
 * Create a new paid event
 */
export async function createPaidEvent(event: InsertPaidEvent) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const result = await db.insert(paidEvents).values(event);
  return result;
}

/**
 * Get all active paid events
 */
export async function getActivePaidEvents() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(paidEvents)
    .where(eq(paidEvents.isActive, true))
    .orderBy(paidEvents.eventDate);
}

/**
 * Get paid event by ID
 */
export async function getPaidEventById(eventId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(paidEvents)
    .where(eq(paidEvents.id, eventId))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Update paid event
 */
export async function updatePaidEvent(eventId: number, updates: Partial<InsertPaidEvent>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  await db
    .update(paidEvents)
    .set(updates)
    .where(eq(paidEvents.id, eventId));
}

/**
 * Create event registration
 */
export async function createEventRegistration(registration: InsertEventRegistration) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const result = await db.insert(eventRegistrations).values(registration);
  return result;
}

/**
 * Update event registration status
 */
export async function updateEventRegistrationStatus(
  stripeCheckoutSessionId: string,
  status: "pending" | "confirmed" | "cancelled"
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  await db
    .update(eventRegistrations)
    .set({ status })
    .where(eq(eventRegistrations.stripeCheckoutSessionId, stripeCheckoutSessionId));
}

/**
 * Get user's event registrations
 */
export async function getUserEventRegistrations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const registrations = await db
    .select({
      id: eventRegistrations.id,
      eventId: eventRegistrations.eventId,
      status: eventRegistrations.status,
      createdAt: eventRegistrations.createdAt,
      eventTitle: paidEvents.title,
      eventDate: paidEvents.eventDate,
      eventType: paidEvents.eventType,
      meetingLink: paidEvents.meetingLink,
    })
    .from(eventRegistrations)
    .leftJoin(paidEvents, eq(eventRegistrations.eventId, paidEvents.id))
    .where(eq(eventRegistrations.userId, userId))
    .orderBy(desc(eventRegistrations.createdAt));
  
  return registrations;
}

/**
 * Get event attendee count
 */
export async function getEventAttendeeCount(eventId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(eventRegistrations)
    .where(and(
      eq(eventRegistrations.eventId, eventId),
      eq(eventRegistrations.status, "confirmed")
    ));
  
  return result[0]?.count || 0;
}


// Webhook-related functions for payment processing
export async function updateEventRegistrationBySessionId(
  sessionId: string,
  updates: { status: "pending" | "confirmed" | "cancelled"; stripePaymentIntentId?: string }
) {
  const dbInstance = await getDb();
  if (!dbInstance) return;
  await dbInstance
    .update(eventRegistrations)
    .set({
      status: updates.status,
      stripePaymentIntentId: updates.stripePaymentIntentId,
    })
    .where(eq(eventRegistrations.stripeCheckoutSessionId, sessionId));
}

export async function updateDonationBySessionId(
  sessionId: string,
  updates: {
    amount?: string;
    status: "pending" | "completed" | "failed" | "cancelled";
    stripePaymentIntentId?: string;
    stripeSubscriptionId?: string;
  }
) {
  const dbInstance = await getDb();
  if (!dbInstance) return;
  await dbInstance
    .update(donations)
    .set({
      amount: updates.amount,
      status: updates.status,
      stripePaymentIntentId: updates.stripePaymentIntentId,
      stripeSubscriptionId: updates.stripeSubscriptionId,
    })
    .where(eq(donations.stripeCheckoutSessionId, sessionId));
}

export async function recordRecurringDonationPayment(
  subscriptionId: string,
  amount: number
) {
  const dbInstance = await getDb();
  if (!dbInstance) return;
  
  // Find the original donation record
  const [donation] = await dbInstance
    .select()
    .from(donations)
    .where(eq(donations.stripeSubscriptionId, subscriptionId))
    .limit(1);

  if (donation) {
    // Create a new donation record for this recurring payment
    await dbInstance.insert(donations).values({
      userId: donation.userId,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      amount: amount.toString(),
      isRecurring: true,
      status: 'completed',
      stripeSubscriptionId: subscriptionId,
    });
  }
}

export async function cancelRecurringDonation(subscriptionId: string) {
  const dbInstance = await getDb();
  if (!dbInstance) return;
  
  await dbInstance
    .update(donations)
    .set({ status: 'cancelled' })
    .where(eq(donations.stripeSubscriptionId, subscriptionId));
}


// Donor badge functions
export type DonorTier = 'bronze' | 'silver' | 'gold' | null;

export async function calculateDonorTier(userId: number): Promise<DonorTier> {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  // Calculate total donations for user
  const result = await dbInstance
    .select({
      total: sql<number>`COALESCE(SUM(CAST(${donations.amount} AS DECIMAL(10,2))), 0)`,
    })
    .from(donations)
    .where(
      and(
        eq(donations.userId, userId),
        eq(donations.status, 'completed')
      )
    );

  const total = result[0]?.total || 0;

  // Determine tier based on total
  if (total >= 1000) return 'gold';
  if (total >= 250) return 'silver';
  if (total >= 50) return 'bronze';
  return null;
}

export async function getUserDonorBadge(userId: number): Promise<{
  tier: DonorTier;
  totalDonated: number;
}> {
  const dbInstance = await getDb();
  if (!dbInstance) return { tier: null, totalDonated: 0 };

  const result = await dbInstance
    .select({
      total: sql<number>`COALESCE(SUM(CAST(${donations.amount} AS DECIMAL(10,2))), 0)`,
    })
    .from(donations)
    .where(
      and(
        eq(donations.userId, userId),
        eq(donations.status, 'completed')
      )
    );

  const totalDonated = result[0]?.total || 0;
  const tier = await calculateDonorTier(userId);

  return { tier, totalDonated };
}


// ============================================================================
// POST AND COMMENT LIKES
// ============================================================================

/**
 * Toggle like on a post (add if not exists, remove if exists)
 */
export async function togglePostLike(userId: number, postId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not initialized");
  
  const existing = await dbInstance
    .select()
    .from(postLikes)
    .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)))
    .limit(1);
  
  if (existing.length > 0) {
    // Unlike
    await dbInstance
      .delete(postLikes)
      .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));
    return { liked: false };
  } else {
    // Like
    await dbInstance.insert(postLikes).values({ userId, postId });
    return { liked: true };
  }
}

/**
 * Get like count and user's like status for a post
 */
export async function getPostLikeInfo(postId: number, userId?: number) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not initialized");
  
  const likeCount = await dbInstance
    .select({ count: sql<number>`count(*)` })
    .from(postLikes)
    .where(eq(postLikes.postId, postId));
  
  let userLiked = false;
  if (userId) {
    const userLike = await dbInstance
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)))
      .limit(1);
    userLiked = userLike.length > 0;
  }
  
  return {
    likeCount: Number(likeCount[0]?.count || 0),
    userLiked,
  };
}

/**
 * Toggle like on a comment (add if not exists, remove if exists)
 */
export async function toggleCommentLike(userId: number, commentId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not initialized");
  
  const existing = await dbInstance
    .select()
    .from(commentLikes)
    .where(and(eq(commentLikes.userId, userId), eq(commentLikes.commentId, commentId)))
    .limit(1);
  
  if (existing.length > 0) {
    // Unlike
    await dbInstance
      .delete(commentLikes)
      .where(and(eq(commentLikes.userId, userId), eq(commentLikes.commentId, commentId)));
    return { liked: false };
  } else {
    // Like
    await dbInstance.insert(commentLikes).values({ userId, commentId });
    return { liked: true };
  }
}

/**
 * Get like count and user's like status for a comment
 */
export async function getCommentLikeInfo(commentId: number, userId?: number) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not initialized");
  
  const likeCount = await dbInstance
    .select({ count: sql<number>`count(*)` })
    .from(commentLikes)
    .where(eq(commentLikes.commentId, commentId));
  
  let userLiked = false;
  if (userId) {
    const userLike = await dbInstance
      .select()
      .from(commentLikes)
      .where(and(eq(commentLikes.userId, userId), eq(commentLikes.commentId, commentId)))
      .limit(1);
    userLiked = userLike.length > 0;
  }
  
  return {
    likeCount: Number(likeCount[0]?.count || 0),
    userLiked,
  };
}


// ============================================
// MEMBERSHIP FUNCTIONS
// ============================================

export async function createMembership(data: InsertMembership) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(memberships).values(data);
  return result[0].insertId;
}

export async function getMembershipByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .orderBy(desc(memberships.createdAt))
    .limit(1);
  
  return result[0] || null;
}

export async function getActiveMembershipByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(memberships)
    .where(and(
      eq(memberships.userId, userId),
      eq(memberships.status, 'active')
    ))
    .limit(1);
  
  return result[0] || null;
}

export async function updateMembershipStatus(membershipId: number, status: 'active' | 'cancelled' | 'expired' | 'pending') {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(memberships)
    .set({ status })
    .where(eq(memberships.id, membershipId));
}

export async function updateMembershipByStripePaymentIntent(paymentIntentId: string, updates: Partial<InsertMembership>) {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(memberships)
    .set(updates)
    .where(eq(memberships.stripePaymentIntentId, paymentIntentId));
}

export async function isFounderMember(userId: number): Promise<boolean> {
  const membership = await getActiveMembershipByUserId(userId);
  return membership?.membershipType === 'founder' && membership?.status === 'active';
}

export async function getAllFounderMembers() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      membership: memberships,
      user: users
    })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(and(
      eq(memberships.membershipType, 'founder'),
      eq(memberships.status, 'active')
    ))
    .orderBy(desc(memberships.createdAt));
  
  return result;
}



// ============================================
// JOURNEY MILESTONES FUNCTIONS
// ============================================

export async function getJourneyMilestones(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(journeyMilestones)
    .where(eq(journeyMilestones.userId, userId))
    .orderBy(desc(journeyMilestones.milestoneDate));
}

export async function getJourneyMilestoneById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(journeyMilestones)
    .where(eq(journeyMilestones.id, id))
    .limit(1);
  
  return result[0] || null;
}

export async function createJourneyMilestone(data: {
  userId: number;
  title: string;
  description: string | null;
  milestoneDate: string;
  milestoneType: "salvation" | "baptism" | "calling" | "healing" | "vision" | "ministry" | "other";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(journeyMilestones).values({
    userId: data.userId,
    title: data.title,
    description: data.description,
    milestoneDate: new Date(data.milestoneDate),
    milestoneType: data.milestoneType,
  });
  
  return { id: result[0].insertId };
}

export async function updateJourneyMilestone(id: number, updates: {
  title?: string;
  description?: string;
  milestoneDate?: string;
  milestoneType?: "salvation" | "baptism" | "calling" | "healing" | "vision" | "ministry" | "other";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const setValues: any = {};
  if (updates.title !== undefined) setValues.title = updates.title;
  if (updates.description !== undefined) setValues.description = updates.description;
  if (updates.milestoneDate !== undefined) setValues.milestoneDate = new Date(updates.milestoneDate);
  if (updates.milestoneType !== undefined) setValues.milestoneType = updates.milestoneType;
  
  if (Object.keys(setValues).length > 0) {
    await db
      .update(journeyMilestones)
      .set(setValues)
      .where(eq(journeyMilestones.id, id));
  }
  
  return { success: true };
}

export async function deleteJourneyMilestone(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(journeyMilestones)
    .where(eq(journeyMilestones.id, id));
}


// ── Email Subscribers ──────────────────────────────────────────────────

export async function addEmailSubscriber(data: { email: string; name?: string; source?: string }) {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.insert(emailSubscribers).values({
      email: data.email.toLowerCase().trim(),
      name: data.name?.trim() || null,
      source: data.source || "landing_page",
    });
    return { success: true };
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY") {
      return { success: true, alreadySubscribed: true };
    }
    throw error;
  }
}

export async function getEmailSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailSubscribers).orderBy(desc(emailSubscribers.createdAt));
}

export async function getEmailSubscriberCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(emailSubscribers);
  return result[0]?.count ?? 0;
}


// ── Inner Circle Membership Helpers ──────────────────────────

export async function isInnerCircleMember(userId: number): Promise<boolean> {
  const membership = await getActiveMembershipByUserId(userId);
  if (!membership) return false;
  return (membership.membershipType === 'inner_circle' || membership.membershipType === 'founder') && membership.status === 'active';
}

export async function getInnerCircleMemberCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(memberships)
    .where(and(
      eq(memberships.membershipType, 'inner_circle'),
      eq(memberships.status, 'active')
    ));
  
  return result[0]?.count || 0;
}

export async function getMembershipByStripeSubscriptionId(subscriptionId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(memberships)
    .where(eq(memberships.stripeSubscriptionId, subscriptionId))
    .limit(1);
  
  return result[0] || null;
}

export async function updateMembershipByStripeSubscriptionId(subscriptionId: string, updates: Partial<InsertMembership>) {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(memberships)
    .set(updates)
    .where(eq(memberships.stripeSubscriptionId, subscriptionId));
}

export async function getAllInnerCircleMembers() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      membership: memberships,
      user: users
    })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(and(
      eq(memberships.membershipType, 'inner_circle'),
      eq(memberships.status, 'active')
    ))
    .orderBy(desc(memberships.createdAt));
  
  return result;
}

export async function adminGrantMembership(userId: number, membershipType: 'founder' | 'inner_circle') {
  const db = await getDb();
  if (!db) return null;
  
  // Check if user already has active membership of this type
  const existing = await getActiveMembershipByUserId(userId);
  if (existing && existing.status === 'active') {
    return existing.id;
  }
  
  const result = await db.insert(memberships).values({
    userId,
    membershipType,
    status: 'active',
    amount: 0, // Admin-granted, no charge
    startDate: new Date(),
  });
  
  return result[0].insertId;
}

export async function adminRevokeMembership(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(memberships)
    .set({ status: 'cancelled' })
    .where(and(
      eq(memberships.userId, userId),
      eq(memberships.status, 'active')
    ));
}
