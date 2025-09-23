import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, date, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number"),
  county: text("county"),
  subCounty: text("sub_county"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const children = pgTable("children", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  motherId: varchar("mother_id").references(() => users.id).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: text("gender").notNull(), // 'male' | 'female'
  birthWeight: integer("birth_weight"), // in grams
  placeOfBirth: text("place_of_birth"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pregnancies = pgTable("pregnancies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  motherId: varchar("mother_id").references(() => users.id).notNull(),
  lmpDate: date("lmp_date").notNull(), // Last Menstrual Period
  expectedDueDate: date("expected_due_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  tetanusVaccinated: boolean("tetanus_vaccinated").default(false).notNull(),
  tetanusVaccinationDate: date("tetanus_vaccination_date"),
  ifasStartDate: date("ifas_start_date"),
  currentWeeks: integer("current_weeks"),
  currentDays: integer("current_days"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vaccinations = pgTable("vaccinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id).notNull(),
  vaccineName: text("vaccine_name").notNull(), // 'BCG', 'OPV', 'Pentavalent', 'PCV', 'Rotavirus', 'IPV', 'MR'
  doseNumber: integer("dose_number").notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  administeredDate: date("administered_date"),
  facilityName: text("facility_name"),
  status: text("status").default('scheduled').notNull(), // 'scheduled', 'administered', 'overdue', 'missed'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ancVisits = pgTable("anc_visits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id).notNull(),
  visitNumber: integer("visit_number").notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  actualDate: date("actual_date"),
  facilityName: text("facility_name"),
  gestationalWeeks: integer("gestational_weeks"),
  weight: integer("weight"), // in kg
  bloodPressure: text("blood_pressure"),
  hemoglobinLevel: text("hemoglobin_level"),
  notes: text("notes"),
  status: text("status").default('scheduled').notNull(), // 'scheduled', 'completed', 'missed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const healthReminders = pgTable("health_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  childId: varchar("child_id").references(() => children.id),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id),
  type: text("type").notNull(), // 'vaccination', 'anc_visit', 'ifas_refill', 'health_tip'
  title: text("title").notNull(),
  description: text("description").notNull(),
  dueDate: date("due_date").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  priority: text("priority").default('normal').notNull(), // 'low', 'normal', 'high', 'urgent'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  category: text("category"), // 'pregnancy', 'childcare', 'vaccination', 'nutrition', 'general'
  likesCount: integer("likes_count").default(0).notNull(),
  commentsCount: integer("comments_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communityComments = pgTable("community_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").references(() => communityPosts.id).notNull(),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const healthFacilities = pgTable("health_facilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'dispensary', 'health_center', 'hospital'
  county: text("county").notNull(),
  subCounty: text("sub_county"),
  ward: text("ward"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  phoneNumber: text("phone_number"),
  services: jsonb("services"), // Array of available services
  vaccinesAvailable: jsonb("vaccines_available"), // Array of available vaccines
  operatingHours: text("operating_hours"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  children: many(children),
  pregnancies: many(pregnancies),
  reminders: many(healthReminders),
  communityPosts: many(communityPosts),
  communityComments: many(communityComments),
}));

export const childrenRelations = relations(children, ({ one, many }) => ({
  mother: one(users, {
    fields: [children.motherId],
    references: [users.id],
  }),
  vaccinations: many(vaccinations),
  reminders: many(healthReminders),
}));

export const pregnanciesRelations = relations(pregnancies, ({ one, many }) => ({
  mother: one(users, {
    fields: [pregnancies.motherId],
    references: [users.id],
  }),
  ancVisits: many(ancVisits),
  reminders: many(healthReminders),
}));

export const vaccinationsRelations = relations(vaccinations, ({ one }) => ({
  child: one(children, {
    fields: [vaccinations.childId],
    references: [children.id],
  }),
}));

export const ancVisitsRelations = relations(ancVisits, ({ one }) => ({
  pregnancy: one(pregnancies, {
    fields: [ancVisits.pregnancyId],
    references: [pregnancies.id],
  }),
}));

export const healthRemindersRelations = relations(healthReminders, ({ one }) => ({
  user: one(users, {
    fields: [healthReminders.userId],
    references: [users.id],
  }),
  child: one(children, {
    fields: [healthReminders.childId],
    references: [children.id],
  }),
  pregnancy: one(pregnancies, {
    fields: [healthReminders.pregnancyId],
    references: [pregnancies.id],
  }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [communityPosts.authorId],
    references: [users.id],
  }),
  comments: many(communityComments),
}));

export const communityCommentsRelations = relations(communityComments, ({ one }) => ({
  post: one(communityPosts, {
    fields: [communityComments.postId],
    references: [communityPosts.id],
  }),
  author: one(users, {
    fields: [communityComments.authorId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChildSchema = createInsertSchema(children).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPregnancySchema = createInsertSchema(pregnancies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVaccinationSchema = createInsertSchema(vaccinations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAncVisitSchema = createInsertSchema(ancVisits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHealthReminderSchema = createInsertSchema(healthReminders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  likesCount: true,
  commentsCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityCommentSchema = createInsertSchema(communityComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHealthFacilitySchema = createInsertSchema(healthFacilities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertChild = z.infer<typeof insertChildSchema>;
export type Child = typeof children.$inferSelect;

export type InsertPregnancy = z.infer<typeof insertPregnancySchema>;
export type Pregnancy = typeof pregnancies.$inferSelect;

export type InsertVaccination = z.infer<typeof insertVaccinationSchema>;
export type Vaccination = typeof vaccinations.$inferSelect;

export type InsertAncVisit = z.infer<typeof insertAncVisitSchema>;
export type AncVisit = typeof ancVisits.$inferSelect;

export type InsertHealthReminder = z.infer<typeof insertHealthReminderSchema>;
export type HealthReminder = typeof healthReminders.$inferSelect;

export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

export type InsertCommunityComment = z.infer<typeof insertCommunityCommentSchema>;
export type CommunityComment = typeof communityComments.$inferSelect;

export type InsertHealthFacility = z.infer<typeof insertHealthFacilitySchema>;
export type HealthFacility = typeof healthFacilities.$inferSelect;
