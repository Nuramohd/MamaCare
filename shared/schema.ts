// shared/types.ts
import { z } from "zod";

// =======================================================
// ENUMS
// =======================================================
export enum FacilityType {
  Hospital = "hospital",
  Clinic = "clinic",
  Dispensary = "dispensary",
  HealthCenter = "health_center",
  Maternity = "maternity",
}

export enum CommunityCategory {
  General = "general",
  Anc = "anc",
  Postpartum = "postpartum",
  Childcare = "childcare",
  Nutrition = "nutrition",
}

// =======================================================
// USERS
// =======================================================
export const userSchema = z.object({
  id: z.string().uuid(),
  firebaseUid: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type User = z.infer<typeof userSchema>;

export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;

// =======================================================
// CHILDREN
// =======================================================
export const childSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string(), // ISO
  gender: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Child = z.infer<typeof childSchema>;

export const insertChildSchema = childSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertChild = z.infer<typeof insertChildSchema>;

// =======================================================
// PREGNANCIES
// =======================================================
export const pregnancySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  lmpDate: z.string(),
  currentWeeks: z.number(),
  currentDays: z.number(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Pregnancy = z.infer<typeof pregnancySchema>;

export const insertPregnancySchema = pregnancySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPregnancy = z.infer<typeof insertPregnancySchema>;

// =======================================================
// HEALTH FACILITIES
// =======================================================
export const healthFacilitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  county: z.string(),
  type: z.nativeEnum(FacilityType),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type HealthFacility = z.infer<typeof healthFacilitySchema>;

export const insertHealthFacilitySchema = healthFacilitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertHealthFacility = z.infer<typeof insertHealthFacilitySchema>;

// =======================================================
// COMMUNITY POSTS
// =======================================================
export const communityPostSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  content: z.string(),
  category: z.nativeEnum(CommunityCategory),
  likesCount: z.number(),
  commentsCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CommunityPost = z.infer<typeof communityPostSchema>;

export const insertCommunityPostSchema = communityPostSchema.omit({
  id: true,
  likesCount: true,
  commentsCount: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;

// =======================================================
// COMMUNITY COMMENTS
// =======================================================
export const communityCommentSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  authorId: z.string().uuid(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CommunityComment = z.infer<typeof communityCommentSchema>;

export const insertCommunityCommentSchema = communityCommentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCommunityComment = z.infer<typeof insertCommunityCommentSchema>;
