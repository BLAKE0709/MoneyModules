import {
  users,
  schools,
  studentPersonas,
  essays,
  essayVersions,
  aiSuggestions,
  scholarships,
  scholarshipMatches,
  activities,
  type User,
  type UpsertUser,
  type School,
  type InsertSchool,
  type StudentPersona,
  type InsertStudentPersona,
  type Essay,
  type InsertEssay,
  type EssayVersion,
  type InsertEssayVersion,
  type AiSuggestion,
  type InsertAiSuggestion,
  type Scholarship,
  type InsertScholarship,
  type ScholarshipMatch,
  type InsertScholarshipMatch,
  type Activity,
  type InsertActivity,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // School operations
  getSchool(id: string): Promise<School | undefined>;
  createSchool(school: InsertSchool): Promise<School>;
  updateSchool(id: string, school: Partial<InsertSchool>): Promise<School>;

  // Student persona operations
  getStudentPersona(userId: string): Promise<StudentPersona | undefined>;
  createStudentPersona(persona: InsertStudentPersona): Promise<StudentPersona>;
  updateStudentPersona(id: string, persona: Partial<InsertStudentPersona>): Promise<StudentPersona>;

  // Essay operations
  getEssay(id: string): Promise<Essay | undefined>;
  getEssaysByUser(userId: string): Promise<Essay[]>;
  createEssay(essay: InsertEssay): Promise<Essay>;
  updateEssay(id: string, essay: Partial<InsertEssay>): Promise<Essay>;
  deleteEssay(id: string): Promise<void>;

  // Essay version operations
  getEssayVersions(essayId: string): Promise<EssayVersion[]>;
  createEssayVersion(version: InsertEssayVersion): Promise<EssayVersion>;

  // AI suggestion operations
  getAiSuggestions(essayId: string): Promise<AiSuggestion[]>;
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  updateAiSuggestion(id: string, suggestion: Partial<InsertAiSuggestion>): Promise<AiSuggestion>;

  // Scholarship operations
  getScholarships(): Promise<Scholarship[]>;
  getScholarship(id: string): Promise<Scholarship | undefined>;
  createScholarship(scholarship: InsertScholarship): Promise<Scholarship>;

  // Scholarship match operations
  getScholarshipMatches(userId: string): Promise<ScholarshipMatch[]>;
  createScholarshipMatch(match: InsertScholarshipMatch): Promise<ScholarshipMatch>;
  updateScholarshipMatch(id: string, match: Partial<InsertScholarshipMatch>): Promise<ScholarshipMatch>;

  // Activity operations
  getActivities(userId: string): Promise<Activity[]>;
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Analytics operations
  getSchoolAnalytics(schoolId: string): Promise<{
    activeStudents: number;
    essaysPolished: number;
    scholarshipValue: number;
    engagementRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // School operations
  async getSchool(id: string): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(eq(schools.id, id));
    return school;
  }

  async createSchool(school: InsertSchool): Promise<School> {
    const [newSchool] = await db.insert(schools).values(school).returning();
    return newSchool;
  }

  async updateSchool(id: string, school: Partial<InsertSchool>): Promise<School> {
    const [updatedSchool] = await db
      .update(schools)
      .set({ ...school, updatedAt: new Date() })
      .where(eq(schools.id, id))
      .returning();
    return updatedSchool;
  }

  // Student persona operations
  async getStudentPersona(userId: string): Promise<StudentPersona | undefined> {
    const [persona] = await db
      .select()
      .from(studentPersonas)
      .where(eq(studentPersonas.userId, userId));
    return persona;
  }

  async createStudentPersona(persona: InsertStudentPersona): Promise<StudentPersona> {
    const [newPersona] = await db.insert(studentPersonas).values(persona).returning();
    return newPersona;
  }

  async updateStudentPersona(id: string, persona: Partial<InsertStudentPersona>): Promise<StudentPersona> {
    const [updatedPersona] = await db
      .update(studentPersonas)
      .set({ ...persona, updatedAt: new Date() })
      .where(eq(studentPersonas.id, id))
      .returning();
    return updatedPersona;
  }

  // Essay operations
  async getEssay(id: string): Promise<Essay | undefined> {
    const [essay] = await db.select().from(essays).where(eq(essays.id, id));
    return essay;
  }

  async getEssaysByUser(userId: string): Promise<Essay[]> {
    return await db
      .select()
      .from(essays)
      .where(eq(essays.userId, userId))
      .orderBy(desc(essays.updatedAt));
  }

  async createEssay(essay: InsertEssay): Promise<Essay> {
    const [newEssay] = await db.insert(essays).values(essay).returning();
    return newEssay;
  }

  async updateEssay(id: string, essay: Partial<InsertEssay>): Promise<Essay> {
    const [updatedEssay] = await db
      .update(essays)
      .set({ ...essay, updatedAt: new Date() })
      .where(eq(essays.id, id))
      .returning();
    return updatedEssay;
  }

  async deleteEssay(id: string): Promise<void> {
    await db.delete(essays).where(eq(essays.id, id));
  }

  // Essay version operations
  async getEssayVersions(essayId: string): Promise<EssayVersion[]> {
    return await db
      .select()
      .from(essayVersions)
      .where(eq(essayVersions.essayId, essayId))
      .orderBy(desc(essayVersions.versionNumber));
  }

  async createEssayVersion(version: InsertEssayVersion): Promise<EssayVersion> {
    const [newVersion] = await db.insert(essayVersions).values(version).returning();
    return newVersion;
  }

  // AI suggestion operations
  async getAiSuggestions(essayId: string): Promise<AiSuggestion[]> {
    return await db
      .select()
      .from(aiSuggestions)
      .where(eq(aiSuggestions.essayId, essayId))
      .orderBy(desc(aiSuggestions.createdAt));
  }

  async createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const [newSuggestion] = await db.insert(aiSuggestions).values(suggestion).returning();
    return newSuggestion;
  }

  async updateAiSuggestion(id: string, suggestion: Partial<InsertAiSuggestion>): Promise<AiSuggestion> {
    const [updatedSuggestion] = await db
      .update(aiSuggestions)
      .set(suggestion)
      .where(eq(aiSuggestions.id, id))
      .returning();
    return updatedSuggestion;
  }

  // Scholarship operations
  async getScholarships(): Promise<Scholarship[]> {
    return await db.select().from(scholarships).orderBy(desc(scholarships.deadline));
  }

  async getScholarship(id: string): Promise<Scholarship | undefined> {
    const [scholarship] = await db.select().from(scholarships).where(eq(scholarships.id, id));
    return scholarship;
  }

  async createScholarship(scholarship: InsertScholarship): Promise<Scholarship> {
    const [newScholarship] = await db.insert(scholarships).values(scholarship).returning();
    return newScholarship;
  }

  // Scholarship match operations
  async getScholarshipMatches(userId: string): Promise<ScholarshipMatch[]> {
    return await db
      .select()
      .from(scholarshipMatches)
      .where(eq(scholarshipMatches.userId, userId))
      .orderBy(desc(scholarshipMatches.matchScore));
  }

  async createScholarshipMatch(match: InsertScholarshipMatch): Promise<ScholarshipMatch> {
    const [newMatch] = await db.insert(scholarshipMatches).values(match).returning();
    return newMatch;
  }

  async updateScholarshipMatch(id: string, match: Partial<InsertScholarshipMatch>): Promise<ScholarshipMatch> {
    const [updatedMatch] = await db
      .update(scholarshipMatches)
      .set(match)
      .where(eq(scholarshipMatches.id, id))
      .returning();
    return updatedMatch;
  }

  // Activity operations
  async getActivities(userId: string): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(50);
  }

  async getRecentActivities(limit = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  // Analytics operations
  async getSchoolAnalytics(schoolId: string): Promise<{
    activeStudents: number;
    essaysPolished: number;
    scholarshipValue: number;
    engagementRate: number;
  }> {
    // Get active students count
    const [activeStudentsResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.schoolId, schoolId));

    // Get essays polished count
    const [essaysPolishedResult] = await db
      .select({ count: count() })
      .from(essays)
      .innerJoin(users, eq(essays.userId, users.id))
      .where(eq(users.schoolId, schoolId));

    // Get scholarship value
    const [scholarshipValueResult] = await db
      .select({ 
        totalValue: sql<number>`COALESCE(SUM(${scholarships.amount}), 0)` 
      })
      .from(scholarshipMatches)
      .innerJoin(users, eq(scholarshipMatches.userId, users.id))
      .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
      .where(eq(users.schoolId, schoolId));

    // Get engagement rate (simplified calculation)
    const [totalStudentsResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.schoolId, schoolId));

    const [activeThisWeekResult] = await db
      .select({ count: count() })
      .from(activities)
      .innerJoin(users, eq(activities.userId, users.id))
      .where(
        and(
          eq(users.schoolId, schoolId),
          gte(activities.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        )
      );

    const engagementRate = totalStudentsResult.count > 0 
      ? Math.round((activeThisWeekResult.count / totalStudentsResult.count) * 100)
      : 0;

    return {
      activeStudents: activeStudentsResult.count,
      essaysPolished: essaysPolishedResult.count,
      scholarshipValue: scholarshipValueResult.totalValue || 0,
      engagementRate,
    };
  }
}

export const storage = new DatabaseStorage();
