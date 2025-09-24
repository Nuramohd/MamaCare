// server/storage.ts
import { db } from './db.ts';
import {
  users,
  children,
  pregnancies,
  healthFacilities,
  communityPosts,
  communityComments,
  type User,
  type InsertUser,
  type Child,
  type InsertChild,
  type Pregnancy,
  type InsertPregnancy,
  type HealthFacility,
  type CommunityPost,
  type InsertCommunityPost,
  type CommunityComment,
  type InsertCommunityComment,
} from "./schema";
import { eq, and, desc, asc, like, sql } from "drizzle-orm";

// =======================================================
// STORAGE CLASS
// =======================================================
class Storage {
  // ===== USERS =====
  async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid))
      .limit(1);
    return user || null;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // ===== CHILDREN =====
  async getChildren(userId: string): Promise<Child[]> {
    return db.select().from(children).where(eq(children.userId, userId));
  }

  async createChild(insertChild: InsertChild): Promise<Child> {
    const [child] = await db.insert(children).values(insertChild).returning();
    return child;
  }

  async updateChild(id: string, updates: Partial<InsertChild>): Promise<Child> {
    const [child] = await db
      .update(children)
      .set(updates)
      .where(eq(children.id, id))
      .returning();
    return child;
  }

  // ===== PREGNANCIES =====
  async getPregnancies(userId: string): Promise<Pregnancy[]> {
    return db
      .select()
      .from(pregnancies)
      .where(eq(pregnancies.userId, userId))
      .orderBy(desc(pregnancies.createdAt));
  }

  async createPregnancy(insertPregnancy: InsertPregnancy): Promise<Pregnancy> {
    const [preg] = await db.insert(pregnancies).values(insertPregnancy).returning();
    return preg;
  }

  async updatePregnancy(id: string, updates: Partial<InsertPregnancy>): Promise<Pregnancy> {
    const [preg] = await db
      .update(pregnancies)
      .set(updates)
      .where(eq(pregnancies.id, id))
      .returning();
    return preg;
  }

  // ===== HEALTH FACILITIES =====
  async getHealthFacilities(county?: string, type?: string): Promise<HealthFacility[]> {
    const conditions = [];
    if (county) conditions.push(eq(healthFacilities.county, county));
    if (type) conditions.push(eq(healthFacilities.type, type));

    return db
      .select()
      .from(healthFacilities)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(healthFacilities.name));
  }

  async getNearbyHealthFacilities(lat: string, lng: string, radiusKm = 10): Promise<HealthFacility[]> {
    const rows = await db.execute(sql`
      SELECT hf.*,
        (6371 * acos(
          cos(radians(${lat})) * cos(radians(hf.latitude)) *
          cos(radians(hf.longitude) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(hf.latitude))
        )) AS distance
      FROM health_facilities hf
      WHERE hf.latitude IS NOT NULL AND hf.longitude IS NOT NULL
      HAVING distance < ${radiusKm}
      ORDER BY distance
      LIMIT 20;
    `);

    return rows as unknown as HealthFacility[];
  }

  // ===== COMMUNITY =====
  async getCommunityPosts(category?: string, search?: string, limit = 20): Promise<(CommunityPost & { author: User })[]> {
    const conditions = [];
    if (category && category !== "all") conditions.push(eq(communityPosts.category, category));
    if (search) conditions.push(like(communityPosts.content, `%${search}%`));

    return db
      .select({
        id: communityPosts.id,
        authorId: communityPosts.authorId,
        content: communityPosts.content,
        category: communityPosts.category,
        likesCount: communityPosts.likesCount,
        commentsCount: communityPosts.commentsCount,
        createdAt: communityPosts.createdAt,
        updatedAt: communityPosts.updatedAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.authorId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit) as any;
  }

  async getCommunityHighlights(limit = 5): Promise<(CommunityPost & { author: User })[]> {
    return db
      .select({
        id: communityPosts.id,
        authorId: communityPosts.authorId,
        content: communityPosts.content,
        category: communityPosts.category,
        likesCount: communityPosts.likesCount,
        commentsCount: communityPosts.commentsCount,
        createdAt: communityPosts.createdAt,
        updatedAt: communityPosts.updatedAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.authorId, users.id))
      .orderBy(desc(communityPosts.likesCount), desc(communityPosts.createdAt))
      .limit(limit) as any;
  }

  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const [post] = await db.insert(communityPosts).values(insertPost).returning();
    return post;
  }

  async likeCommunityPost(postId: string, userId: string): Promise<void> {
    await db
      .update(communityPosts)
      .set({
        likesCount: sql`${communityPosts.likesCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(communityPosts.id, postId));
  }

  async getCommunityComments(postId: string): Promise<(CommunityComment & { author: User })[]> {
    return db
      .select({
        id: communityComments.id,
        postId: communityComments.postId,
        authorId: communityComments.authorId,
        content: communityComments.content,
        createdAt: communityComments.createdAt,
        updatedAt: communityComments.updatedAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(communityComments)
      .innerJoin(users, eq(communityComments.authorId, users.id))
      .where(eq(communityComments.postId, postId))
      .orderBy(asc(communityComments.createdAt)) as any;
  }

  async createCommunityComment(insertComment: InsertCommunityComment): Promise<CommunityComment> {
    const [comment] = await db.insert(communityComments).values(insertComment).returning();
    return comment;
  }
}

// =======================================================
// EXPORT SINGLETON
// =======================================================
export const storage = new Storage();
