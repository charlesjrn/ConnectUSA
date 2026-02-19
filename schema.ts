import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date, decimal, unique } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  /** Hashed password for email/password authentication. Null for OAuth users. */
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  profilePicture: text("profilePicture"),
  profilePictureStatus: mysqlEnum("profilePictureStatus", ["pending", "approved", "rejected"]).default("approved"),
  avatarBackgroundColor: varchar("avatarBackgroundColor", { length: 7 }).default("#D4AF37"),
  avatarIcon: varchar("avatarIcon", { length: 20 }).default("user"),
  chosenDate: timestamp("chosenDate"),
  bio: text("bio"),
  spiritualGifts: text("spiritualGifts"),
  calling: text("calling"),
  location: text("location"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  emailComments: boolean("emailComments").default(true).notNull(),
  emailDirectMessages: boolean("emailDirectMessages").default(true).notNull(),
  emailWeeklyDigest: boolean("emailWeeklyDigest").default(true).notNull(),
  emailLikes: boolean("emailLikes").default(true).notNull(),
  emailPrayers: boolean("emailPrayers").default(true).notNull(),
  pushNotifications: boolean("pushNotifications").default(true).notNull(),
  pushComments: boolean("pushComments").default(true).notNull(),
  pushDirectMessages: boolean("pushDirectMessages").default(true).notNull(),
  pushPrayers: boolean("pushPrayers").default(true).notNull(),
  referralCode: varchar("referralCode", { length: 20 }).unique(),
  isFeaturedMember: boolean("isFeaturedMember").default(false).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  userName: text("userName"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: timestamp("eventDate").notNull(),
  eventType: mysqlEnum("eventType", ["online", "in-person", "prayer"]).notNull(),
  location: text("location"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  isEdited: boolean("isEdited").default(false),
  editedAt: timestamp("editedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Direct messages table for one-on-one private conversations between users.
 */
export const directMessages = mysqlTable("direct_messages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("sender_id").notNull(),
  receiverId: int("receiver_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = typeof directMessages.$inferInsert;

/**
 * Messages table for chatroom conversations.
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  room: mysqlEnum("room", ["gift", "vision", "encounter", "testimony", "prayer", "missions", "chatroom", "meetup", "prayer-requests", "prayer-room"]).notNull(),
  title: varchar("title", { length: 255 }),
  category: varchar("category", { length: 50 }),
  isAnonymous: boolean("isAnonymous").default(false),
  isAnswered: boolean("isAnswered").default(false),
  answeredTestimony: text("answeredTestimony"),
  isUrgent: boolean("isUrgent").default(false),
  isFeatured: boolean("isFeatured").default(false),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Likes table for tracking which users liked which messages.
 * Composite unique constraint prevents duplicate likes.
 */
export const likes = mysqlTable("likes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  messageId: int("messageId").notNull().references(() => messages.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Like = typeof likes.$inferSelect;
export type InsertLike = typeof likes.$inferInsert;

/**
 * Password reset tokens table for email-based password recovery.
 * Tokens expire after a set time period for security.
 */
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

/**
 * Notifications table for user alerts about new posts, comments, and messages.
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["comment", "reply", "direct_message", "new_post"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedId: int("relatedId"), // ID of the related comment, message, or post
  relatedUrl: varchar("relatedUrl", { length: 500 }), // URL to navigate to when clicked
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Prayer counts table tracking which users have prayed for which prayer requests.
 */
export const prayerCounts = mysqlTable("prayer_counts", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PrayerCount = typeof prayerCounts.$inferSelect;
export type InsertPrayerCount = typeof prayerCounts.$inferInsert;

/**
 * Active visitors table for tracking live visitor count.
 * Entries are automatically cleaned up after a short timeout period.
 */
export const activeVisitors = mysqlTable("active_visitors", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 255 }).notNull().unique(),
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
});

export type ActiveVisitor = typeof activeVisitors.$inferSelect;
export type InsertActiveVisitor = typeof activeVisitors.$inferInsert;

/**
 * Page views table for tracking all page visits with timestamps.
 * Used for analytics and visitor statistics.
 */
export const pageViews = mysqlTable("page_views", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  userId: int("userId"), // Null for anonymous visitors
  pagePath: varchar("pagePath", { length: 500 }).notNull(),
  referrer: varchar("referrer", { length: 500 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

/**
 * Daily analytics summary table for aggregated statistics.
 * Pre-computed daily metrics for faster dashboard queries.
 */
export const dailyAnalytics = mysqlTable("daily_analytics", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull().unique(), // YYYY-MM-DD format
  uniqueVisitors: int("uniqueVisitors").notNull().default(0),
  totalPageViews: int("totalPageViews").notNull().default(0),
  newUsers: int("newUsers").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyAnalytics = typeof dailyAnalytics.$inferSelect;
export type InsertDailyAnalytics = typeof dailyAnalytics.$inferInsert;

/**
 * Video rooms table for managing video chat sessions.
 * Stores room information and access details for video calls.
 */
export const videoRooms = mysqlTable("video_rooms", {
  id: int("id").autoincrement().primaryKey(),
  roomName: varchar("roomName", { length: 255 }).notNull(),
  roomUrl: varchar("roomUrl", { length: 500 }).notNull(),
  hostId: int("hostId").notNull(),
  hostName: varchar("hostName", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("isActive").notNull().default(true),
  maxParticipants: int("maxParticipants").default(10),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
});

export type VideoRoom = typeof videoRooms.$inferSelect;
export type InsertVideoRoom = typeof videoRooms.$inferInsert;

/**
 * Follows table for member connection system.
 * Tracks which users follow which other users.
 */
export const follows = mysqlTable("follows", {
  id: int("id").autoincrement().primaryKey(),
  followerId: int("followerId").notNull(), // User who is following
  followingId: int("followingId").notNull(), // User being followed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;

/**
 * Photo gallery table for member profile photos.
 * Allows users to upload multiple photos to showcase their ministry, family, and community involvement.
 */
export const photoGallery = mysqlTable("photo_gallery", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  photoUrl: text("photoUrl").notNull(),
  caption: text("caption"),
  displayOrder: int("displayOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PhotoGallery = typeof photoGallery.$inferSelect;
export type InsertPhotoGallery = typeof photoGallery.$inferInsert;

/**
 * Badges table for achievement system.
 * Defines available badges that members can earn through participation.
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 255 }).notNull(), // Path to badge icon
  criteria: text("criteria").notNull(), // JSON string describing earning criteria
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * UserBadges table for tracking earned badges.
 * Links users to badges they've earned with timestamp.
 */
export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: int("badgeId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

/**
 * Referrals table for tracking member referrals.
 * Tracks who invited whom and referral status.
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(), // User who sent the referral
  referredUserId: int("referredUserId"), // User who signed up (null until signup)
  referralCode: varchar("referralCode", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;


/**
 * DailyVerses table for storing scripture verses.
 * Each verse has text, reference, and date for rotation.
 */
export const dailyVerses = mysqlTable("daily_verses", {
  id: int("id").autoincrement().primaryKey(),
  verseText: text("verseText").notNull(),
  reference: varchar("reference", { length: 100 }).notNull(), // e.g., "John 3:16"
  date: date("date").notNull(), // Date this verse is/was displayed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyVerse = typeof dailyVerses.$inferSelect;
export type InsertDailyVerse = typeof dailyVerses.$inferInsert;

/**
 * UserFavoriteVerses table for tracking user's favorite verses.
 * Links users to verses they've favorited.
 */
export const userFavoriteVerses = mysqlTable("user_favorite_verses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  verseId: int("verseId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserFavoriteVerse = typeof userFavoriteVerses.$inferSelect;
export type InsertUserFavoriteVerse = typeof userFavoriteVerses.$inferInsert;

/**
 * Donations table for tracking financial contributions to the ministry.
 * Stores only essential Stripe identifiers, not redundant payment data.
 */
export const donations = mysqlTable("donations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id, { onDelete: "set null" }),
  donorName: varchar("donorName", { length: 255 }),
  donorEmail: varchar("donorEmail", { length: 320 }),
  // Stripe identifiers (essential for API references)
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  // Amount in USD (stored for quick access without API call)
  amount: decimal("amount", { precision: 10, scale: 2 }),
  // Business-specific fields
  isRecurring: boolean("isRecurring").default(false).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;

/**
 * Paid events table for virtual conferences, workshops, and courses.
 * Stores event details and pricing information.
 */
export const paidEvents = mysqlTable("paid_events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  eventDate: timestamp("eventDate").notNull(),
  duration: int("duration"), // Duration in minutes
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  capacity: int("capacity"), // Max attendees (null = unlimited)
  eventType: mysqlEnum("eventType", ["online", "in-person", "prayer"]).notNull(),
  imageUrl: text("imageUrl"),
  meetingLink: text("meetingLink"), // Zoom/Google Meet link
  stripePriceId: varchar("stripePriceId", { length: 255 }), // Stripe Price ID for checkout
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaidEvent = typeof paidEvents.$inferSelect;
export type InsertPaidEvent = typeof paidEvents.$inferInsert;

/**
 * Event registrations table for tracking ticket purchases.
 * Stores only Stripe identifiers, not redundant payment data.
 */
export const eventRegistrations = mysqlTable("event_registrations", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull().references(() => paidEvents.id, { onDelete: "cascade" }),
  userId: int("userId").references(() => users.id, { onDelete: "set null" }),
  attendeeName: varchar("attendeeName", { length: 255 }).notNull(),
  attendeeEmail: varchar("attendeeEmail", { length: 320 }).notNull(),
  // Stripe identifiers
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }),
  // Registration status
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = typeof eventRegistrations.$inferInsert;


/**
 * Post likes table for tracking which users liked which posts.
 * Composite unique key prevents duplicate likes.
 */
export const postLikes = mysqlTable("post_likes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull().references(() => messages.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uniqueUserPost: unique().on(table.userId, table.postId),
}));

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;

/**
 * Comment likes table for tracking which users liked which comments.
 * Composite unique key prevents duplicate likes.
 */
export const commentLikes = mysqlTable("comment_likes", {
  id: int("id").autoincrement().primaryKey(),
  commentId: int("commentId").notNull().references(() => comments.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uniqueUserComment: unique().on(table.userId, table.commentId),
}));

export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = typeof commentLikes.$inferInsert;


/**
 * Memberships table for tracking user membership subscriptions.
 * Stores Founders Membership and future membership tiers.
 */
export const memberships = mysqlTable("memberships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  membershipType: mysqlEnum("membershipType", ["founder", "inner_circle"]).notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired", "pending"]).default("pending").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  amount: int("amount").notNull(), // Amount in cents
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = typeof memberships.$inferInsert;


/**
 * Journey milestones table for tracking spiritual journey timeline.
 * Users can add key moments in their faith journey.
 */
export const journeyMilestones = mysqlTable("journey_milestones", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  milestoneDate: date("milestoneDate").notNull(),
  milestoneType: mysqlEnum("milestoneType", ["salvation", "baptism", "calling", "healing", "vision", "ministry", "other"]).default("other").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JourneyMilestone = typeof journeyMilestones.$inferSelect;
export type InsertJourneyMilestone = typeof journeyMilestones.$inferInsert;

/**
 * Email subscribers table for collecting waitlist/newsletter signups.
 * Used on the MVP landing page to collect interest before full launch.
 */
export const emailSubscribers = mysqlTable("email_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  source: varchar("source", { length: 50 }).default("landing_page").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type InsertEmailSubscriber = typeof emailSubscribers.$inferInsert;
