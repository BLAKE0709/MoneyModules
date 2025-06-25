import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("student"), // student, counselor, admin
  schoolId: varchar("school_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schools table for B2B functionality
export const schools = pgTable("schools", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  district: varchar("district"),
  address: text("address"),
  capacity: integer("capacity"),
  autoSync: boolean("auto_sync").default(false),
  apiKeysActive: integer("api_keys_active").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student personas - core data vault
export const studentPersonas = pgTable("student_personas", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Basic Information
  dateOfBirth: timestamp("date_of_birth"),
  phone: varchar("phone"),
  highSchool: varchar("high_school"),
  graduationYear: integer("graduation_year"),
  
  // Academic Information
  gpa: decimal("gpa", { precision: 3, scale: 2 }),
  classRank: varchar("class_rank"),
  satScore: integer("sat_score"),
  actScore: integer("act_score"),
  intendedMajors: text("intended_majors").array(),
  extracurriculars: text("extracurriculars"),
  
  // Financial Information
  efc: integer("efc"), // Expected Family Contribution
  incomeRange: varchar("income_range"),
  fafsaStatus: varchar("fafsa_status"),
  workStudyInterest: varchar("work_study_interest"),
  
  // Preferences and Goals
  collegePreferences: jsonb("college_preferences"),
  careerGoals: text("career_goals"),
  
  // Completion tracking
  completionPercentage: integer("completion_percentage").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Essays for polishing
export const essays = pgTable("essays", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  type: varchar("type").notNull(), // personal_statement, scholarship, college_application, research_proposal
  content: text("content").notNull(),
  wordLimit: integer("word_limit"),
  wordCount: integer("word_count"),
  
  // AI Analysis Results
  clarityScore: decimal("clarity_score", { precision: 3, scale: 1 }),
  impactScore: decimal("impact_score", { precision: 3, scale: 1 }),
  originalityScore: decimal("originality_score", { precision: 3, scale: 1 }),
  
  status: varchar("status").default("draft"), // draft, polished, exported
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Essay versions for history tracking
export const essayVersions = pgTable("essay_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  essayId: uuid("essay_id").notNull().references(() => essays.id),
  content: text("content").notNull(),
  versionNumber: integer("version_number").notNull(),
  changes: text("changes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI suggestions for essays
export const aiSuggestions = pgTable("ai_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  essayId: uuid("essay_id").notNull().references(() => essays.id),
  type: varchar("type").notNull(), // strengthen_conclusion, add_transition, improve_clarity
  suggestion: text("suggestion").notNull(),
  impact: varchar("impact").notNull(), // high, medium, low
  applied: boolean("applied").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Scholarships found/tracked
export const scholarships = pgTable("scholarships", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  provider: varchar("provider"),
  amount: integer("amount"),
  deadline: timestamp("deadline"),
  requirements: text("requirements"),
  description: text("description"),
  eligibilityCriteria: jsonb("eligibility_criteria"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student scholarship matches
export const scholarshipMatches = pgTable("scholarship_matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  scholarshipId: uuid("scholarship_id").notNull().references(() => scholarships.id),
  matchScore: decimal("match_score", { precision: 3, scale: 2 }),
  status: varchar("status").default("found"), // found, applied, won, rejected
  appliedAt: timestamp("applied_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student writing samples repository
export const writingSamples = pgTable("writing_samples", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  content: text("content").notNull(),
  fileType: varchar("file_type").notNull(), // pdf, docx, txt
  fileSize: integer("file_size").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  tags: text("tags").array(),
  notes: text("notes"),
  isAnalyzed: boolean("is_analyzed").default(false),
  writingStyle: jsonb("writing_style"), // AI analysis of writing patterns
});

// Activity tracking for analytics
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // essay_polished, profile_updated, scholarship_found, writing_sample_uploaded
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  persona: one(studentPersonas, {
    fields: [users.id],
    references: [studentPersonas.userId],
  }),
  essays: many(essays),
  scholarshipMatches: many(scholarshipMatches),
  activities: many(activities),
  writingSamples: many(writingSamples),
  school: one(schools, {
    fields: [users.schoolId],
    references: [schools.id],
  }),
}));

export const writingSamplesRelations = relations(writingSamples, ({ one }) => ({
  user: one(users, {
    fields: [writingSamples.userId],
    references: [users.id],
  }),
}));

export const studentPersonasRelations = relations(studentPersonas, ({ one }) => ({
  user: one(users, {
    fields: [studentPersonas.userId],
    references: [users.id],
  }),
}));

export const essaysRelations = relations(essays, ({ one, many }) => ({
  user: one(users, {
    fields: [essays.userId],
    references: [users.id],
  }),
  versions: many(essayVersions),
  suggestions: many(aiSuggestions),
}));

export const essayVersionsRelations = relations(essayVersions, ({ one }) => ({
  essay: one(essays, {
    fields: [essayVersions.essayId],
    references: [essays.id],
  }),
}));

export const aiSuggestionsRelations = relations(aiSuggestions, ({ one }) => ({
  essay: one(essays, {
    fields: [aiSuggestions.essayId],
    references: [essays.id],
  }),
}));

export const scholarshipsRelations = relations(scholarships, ({ many }) => ({
  matches: many(scholarshipMatches),
}));

export const scholarshipMatchesRelations = relations(scholarshipMatches, ({ one }) => ({
  user: one(users, {
    fields: [scholarshipMatches.userId],
    references: [users.id],
  }),
  scholarship: one(scholarships, {
    fields: [scholarshipMatches.scholarshipId],
    references: [scholarships.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const schoolsRelations = relations(schools, ({ many }) => ({
  users: many(users),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertSchoolSchema = createInsertSchema(schools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentPersonaSchema = createInsertSchema(studentPersonas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEssaySchema = createInsertSchema(essays).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEssayVersionSchema = createInsertSchema(essayVersions).omit({
  id: true,
  createdAt: true,
});

export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).omit({
  id: true,
  createdAt: true,
});

export const insertScholarshipSchema = createInsertSchema(scholarships).omit({
  id: true,
  createdAt: true,
});

export const insertScholarshipMatchSchema = createInsertSchema(scholarshipMatches).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertWritingSampleSchema = createInsertSchema(writingSamples).omit({
  id: true,
  uploadedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type School = typeof schools.$inferSelect;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type StudentPersona = typeof studentPersonas.$inferSelect;
export type InsertStudentPersona = z.infer<typeof insertStudentPersonaSchema>;
export type Essay = typeof essays.$inferSelect;
export type InsertEssay = z.infer<typeof insertEssaySchema>;
export type EssayVersion = typeof essayVersions.$inferSelect;
export type InsertEssayVersion = z.infer<typeof insertEssayVersionSchema>;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
export type Scholarship = typeof scholarships.$inferSelect;
export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;
export type ScholarshipMatch = typeof scholarshipMatches.$inferSelect;
export type InsertScholarshipMatch = z.infer<typeof insertScholarshipMatchSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type WritingSample = typeof writingSamples.$inferSelect;
export type InsertWritingSample = z.infer<typeof insertWritingSampleSchema>;
