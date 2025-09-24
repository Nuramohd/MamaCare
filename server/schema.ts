// server/schema.ts
import { pgTable, uuid, varchar, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

// =======================================================
// ENUMS
// =======================================================
export const facilityTypeEnum = pgEnum("facility_type", [
  "hospital",
  "clinic",
  "dispensary",
  "health_center",
  "maternity",
]);

export const communityCategoryEnum = pgEnum("community_category", [
  "general",
  "anc",
  "postpartum",
  "childcare",
  "nutrition",
]);

// =======================================================
// USERS
// =======================================================
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  firebaseUid: varchar("firebase_uid", { length: 128 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// =======================================================
// CHILDREN
// =======================================================
export const children = pgTable("children", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  dateOfBirth: varchar("date_of_birth", { length: 20 }).notNull(), // ISO string
  gender: varchar("gender", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Child = typeof children.$inferSelect;
export type InsertChild = typeof children.$inferInsert;

// =======================================================
// PREGNANCIES
// =======================================================
export const pregnancies = pgTable("pregnancies", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  lmpDate: varchar("lmp_date", { length: 20 }).notNull(), // Last menstrual period
  currentWeeks: integer("current_weeks").default(0),
  currentDays: integer("current_days").default(0),
  status: varchar("status", { length: 20 }).default("active"), // active, completed, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Pregnancy = typeof pregnancies.$inferSelect;
export type InsertPregnancy = typeof pregnancies.$inferInsert;

// =======================================================
// HEALTH FACILITIES
// =======================================================
export const healthFacilities = pgTable("health_facilities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  county: varchar("county", { length: 100 }).notNull(),
  type: facilityTypeEnum("type").notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type HealthFacility = typeof healthFacilities.$inferSelect;
export type InsertHealthFacility = typeof healthFacilities.$inferInsert;

// =======================================================
// COMMUNITY POSTS
// =======================================================
export const communityPosts = pgTable("community_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  category: communityCategoryEnum("category").default("general"),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

// =======================================================
// COMMUNITY COMMENTS
// =======================================================
export const communityComments = pgTable("community_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").references(() => communityPosts.id).notNull(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertCommunityComment = typeof communityComments.$inferInsert;

