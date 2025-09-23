import { 
  users, 
  children, 
  pregnancies, 
  vaccinations, 
  ancVisits, 
  healthReminders, 
  communityPosts, 
  communityComments, 
  healthFacilities,
  type User, 
  type InsertUser,
  type Child,
  type InsertChild,
  type Pregnancy,
  type InsertPregnancy,
  type Vaccination,
  type InsertVaccination,
  type AncVisit,
  type InsertAncVisit,
  type HealthReminder,
  type InsertHealthReminder,
  type CommunityPost,
  type InsertCommunityPost,
  type CommunityComment,
  type InsertCommunityComment,
  type HealthFacility,
  type InsertHealthFacility
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, or, count, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  getUserStats(userId: string): Promise<{
    childrenCount: number;
    pregnanciesCount: number;
    vaccinationsCompleted: number;
    communityPosts: number;
  }>;

  // Children methods
  getChildrenByMother(motherId: string): Promise<Child[]>;
  getChild(id: string): Promise<Child | undefined>;
  createChild(child: InsertChild): Promise<Child>;
  updateChild(id: string, updates: Partial<InsertChild>): Promise<Child>;
  deleteChild(id: string): Promise<void>;

  // Pregnancy methods
  getActivePregnancy(motherId: string): Promise<Pregnancy | undefined>;
  getPregnanciesByMother(motherId: string): Promise<Pregnancy[]>;
  createPregnancy(pregnancy: InsertPregnancy): Promise<Pregnancy>;
  updatePregnancy(id: string, updates: Partial<InsertPregnancy>): Promise<Pregnancy>;

  // Vaccination methods
  getVaccinationsByChild(childId: string): Promise<Vaccination[]>;
  getUpcomingVaccinations(motherId: string): Promise<Vaccination[]>;
  createVaccination(vaccination: InsertVaccination): Promise<Vaccination>;
  updateVaccination(id: string, updates: Partial<InsertVaccination>): Promise<Vaccination>;

  // ANC Visit methods
  getAncVisitsByPregnancy(pregnancyId: string): Promise<AncVisit[]>;
  createAncVisit(ancVisit: InsertAncVisit): Promise<AncVisit>;
  updateAncVisit(id: string, updates: Partial<InsertAncVisit>): Promise<AncVisit>;

  // Health Reminder methods
  getRemindersByUser(userId: string): Promise<HealthReminder[]>;
  getUpcomingReminders(userId: string, limit?: number): Promise<HealthReminder[]>;
  createReminder(reminder: InsertHealthReminder): Promise<HealthReminder>;
  updateReminder(id: string, updates: Partial<InsertHealthReminder>): Promise<HealthReminder>;
  markReminderCompleted(id: string): Promise<HealthReminder>;

  // Community methods
  getCommunityPosts(category?: string, search?: string, limit?: number): Promise<(CommunityPost & { author: User })[]>;
  getCommunityHighlights(limit?: number): Promise<(CommunityPost & { author: User })[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  likeCommunityPost(postId: string, userId: string): Promise<void>;
  getCommunityComments(postId: string): Promise<(CommunityComment & { author: User })[]>;
  createCommunityComment(comment: InsertCommunityComment): Promise<CommunityComment>;

  // Health Facility methods
  getHealthFacilities(county?: string, type?: string): Promise<HealthFacility[]>;
  getNearbyHealthFacilities(latitude: string, longitude: string, radius?: number): Promise<HealthFacility[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserStats(userId: string): Promise<{
    childrenCount: number;
    pregnanciesCount: number;
    vaccinationsCompleted: number;
    communityPosts: number;
  }> {
    const [childrenCount] = await db
      .select({ count: count() })
      .from(children)
      .where(eq(children.motherId, userId));

    const [pregnanciesCount] = await db
      .select({ count: count() })
      .from(pregnancies)
      .where(eq(pregnancies.motherId, userId));

    const [vaccinationsCompleted] = await db
      .select({ count: count() })
      .from(vaccinations)
      .innerJoin(children, eq(vaccinations.childId, children.id))
      .where(and(
        eq(children.motherId, userId),
        eq(vaccinations.status, 'administered')
      ));

    const [communityPostsCount] = await db
      .select({ count: count() })
      .from(communityPosts)
      .where(eq(communityPosts.authorId, userId));

    return {
      childrenCount: childrenCount?.count || 0,
      pregnanciesCount: pregnanciesCount?.count || 0,
      vaccinationsCompleted: vaccinationsCompleted?.count || 0,
      communityPosts: communityPostsCount?.count || 0,
    };
  }

  // Children methods
  async getChildrenByMother(motherId: string): Promise<Child[]> {
    return await db
      .select()
      .from(children)
      .where(eq(children.motherId, motherId))
      .orderBy(desc(children.createdAt));
  }

  async getChild(id: string): Promise<Child | undefined> {
    const [child] = await db.select().from(children).where(eq(children.id, id));
    return child || undefined;
  }

  async createChild(insertChild: InsertChild): Promise<Child> {
    const [child] = await db
      .insert(children)
      .values(insertChild)
      .returning();
    return child;
  }

  async updateChild(id: string, updates: Partial<InsertChild>): Promise<Child> {
    const [child] = await db
      .update(children)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(children.id, id))
      .returning();
    return child;
  }

  async deleteChild(id: string): Promise<void> {
    await db.delete(children).where(eq(children.id, id));
  }

  // Pregnancy methods
  async getActivePregnancy(motherId: string): Promise<Pregnancy | undefined> {
    const [pregnancy] = await db
      .select()
      .from(pregnancies)
      .where(and(
        eq(pregnancies.motherId, motherId),
        eq(pregnancies.isActive, true)
      ))
      .orderBy(desc(pregnancies.createdAt));
    return pregnancy || undefined;
  }

  async getPregnanciesByMother(motherId: string): Promise<Pregnancy[]> {
    return await db
      .select()
      .from(pregnancies)
      .where(eq(pregnancies.motherId, motherId))
      .orderBy(desc(pregnancies.createdAt));
  }

  async createPregnancy(insertPregnancy: InsertPregnancy): Promise<Pregnancy> {
    const [pregnancy] = await db
      .insert(pregnancies)
      .values(insertPregnancy)
      .returning();
    return pregnancy;
  }

  async updatePregnancy(id: string, updates: Partial<InsertPregnancy>): Promise<Pregnancy> {
    const [pregnancy] = await db
      .update(pregnancies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pregnancies.id, id))
      .returning();
    return pregnancy;
  }

  // Vaccination methods
  async getVaccinationsByChild(childId: string): Promise<Vaccination[]> {
    return await db
      .select()
      .from(vaccinations)
      .where(eq(vaccinations.childId, childId))
      .orderBy(asc(vaccinations.scheduledDate));
  }

  async getUpcomingVaccinations(motherId: string): Promise<Vaccination[]> {
    return await db
      .select({
        id: vaccinations.id,
        childId: vaccinations.childId,
        vaccineName: vaccinations.vaccineName,
        doseNumber: vaccinations.doseNumber,
        scheduledDate: vaccinations.scheduledDate,
        administeredDate: vaccinations.administeredDate,
        facilityName: vaccinations.facilityName,
        status: vaccinations.status,
        notes: vaccinations.notes,
        createdAt: vaccinations.createdAt,
        updatedAt: vaccinations.updatedAt,
      })
      .from(vaccinations)
      .innerJoin(children, eq(vaccinations.childId, children.id))
      .where(and(
        eq(children.motherId, motherId),
        or(
          eq(vaccinations.status, 'scheduled'),
          eq(vaccinations.status, 'overdue')
        )
      ))
      .orderBy(asc(vaccinations.scheduledDate));
  }

  async createVaccination(insertVaccination: InsertVaccination): Promise<Vaccination> {
    const [vaccination] = await db
      .insert(vaccinations)
      .values(insertVaccination)
      .returning();
    return vaccination;
  }

  async updateVaccination(id: string, updates: Partial<InsertVaccination>): Promise<Vaccination> {
    const [vaccination] = await db
      .update(vaccinations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vaccinations.id, id))
      .returning();
    return vaccination;
  }

  // ANC Visit methods
  async getAncVisitsByPregnancy(pregnancyId: string): Promise<AncVisit[]> {
    return await db
      .select()
      .from(ancVisits)
      .where(eq(ancVisits.pregnancyId, pregnancyId))
      .orderBy(asc(ancVisits.visitNumber));
  }

  async createAncVisit(insertAncVisit: InsertAncVisit): Promise<AncVisit> {
    const [ancVisit] = await db
      .insert(ancVisits)
      .values(insertAncVisit)
      .returning();
    return ancVisit;
  }

  async updateAncVisit(id: string, updates: Partial<InsertAncVisit>): Promise<AncVisit> {
    const [ancVisit] = await db
      .update(ancVisits)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(ancVisits.id, id))
      .returning();
    return ancVisit;
  }

  // Health Reminder methods
  async getRemindersByUser(userId: string): Promise<HealthReminder[]> {
    return await db
      .select()
      .from(healthReminders)
      .where(eq(healthReminders.userId, userId))
      .orderBy(asc(healthReminders.dueDate));
  }

  async getUpcomingReminders(userId: string, limit = 10): Promise<HealthReminder[]> {
    return await db
      .select()
      .from(healthReminders)
      .where(and(
        eq(healthReminders.userId, userId),
        eq(healthReminders.isCompleted, false)
      ))
      .orderBy(asc(healthReminders.dueDate))
      .limit(limit);
  }

  async createReminder(insertReminder: InsertHealthReminder): Promise<HealthReminder> {
    const [reminder] = await db
      .insert(healthReminders)
      .values(insertReminder)
      .returning();
    return reminder;
  }

  async updateReminder(id: string, updates: Partial<InsertHealthReminder>): Promise<HealthReminder> {
    const [reminder] = await db
      .update(healthReminders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(healthReminders.id, id))
      .returning();
    return reminder;
  }

  async markReminderCompleted(id: string): Promise<HealthReminder> {
    const [reminder] = await db
      .update(healthReminders)
      .set({ isCompleted: true, updatedAt: new Date() })
      .where(eq(healthReminders.id, id))
      .returning();
    return reminder;
  }

  // Community methods
  async getCommunityPosts(category?: string, search?: string, limit = 20): Promise<(CommunityPost & { author: User })[]> {
    let query = db
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
      .innerJoin(users, eq(communityPosts.authorId, users.id));

    const conditions = [];
    
    if (category && category !== 'all') {
      conditions.push(eq(communityPosts.category, category));
    }
    
    if (search) {
      conditions.push(like(communityPosts.content, `%${search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit) as any;
  }

  async getCommunityHighlights(limit = 5): Promise<(CommunityPost & { author: User })[]> {
    return await db
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
    const [post] = await db
      .insert(communityPosts)
      .values(insertPost)
      .returning();
    return post;
  }

  async likeCommunityPost(postId: string, userId: string): Promise<void> {
    await db
      .update(communityPosts)
      .set({ 
        likesCount: sql`${communityPosts.likesCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(communityPosts.id, postId));
  }

  async getCommunityComments(postId: string): Promise<(CommunityComment & { author: User })[]> {
    return await db
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
    const [comment] = await db
      .insert(communityComments)
      .values(insertComment)
      .returning();

    // Update comments count
    await db
      .update(communityPosts)
      .set({ 
        commentsCount: sql`${communityPosts.commentsCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(communityPosts.id, insertComment.postId));

    return comment;
  }

  // Health Facility methods
  async getHealthFacilities(county?: string, type?: string): Promise<HealthFacility[]> {
    let query = db.select().from(healthFacilities);

    const conditions = [];
    
    if (county) {
      conditions.push(eq(healthFacilities.county, county));
    }
    
    if (type) {
      conditions.push(eq(healthFacilities.type, type));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(asc(healthFacilities.name));
  }

  async getNearbyHealthFacilities(latitude: string, longitude: string, radius = 10): Promise<HealthFacility[]> {
    // Simple distance calculation - in production, use PostGIS or similar
    return await db
      .select()
      .from(healthFacilities)
      .where(and(
        db.sql`${healthFacilities.latitude} IS NOT NULL`,
        db.sql`${healthFacilities.longitude} IS NOT NULL`
      ))
      .orderBy(asc(healthFacilities.name))
      .limit(20);
  }
}

export const storage = new DatabaseStorage();
