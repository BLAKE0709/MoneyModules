import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { analyzeEssay, generateEssayImprovement, findScholarshipMatches } from "./services/openai";
import { 
  insertStudentPersonaSchema,
  insertEssaySchema,
  insertScholarshipSchema,
  insertSchoolSchema,
  insertWritingSampleSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Student Persona routes
  app.get('/api/persona', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const persona = await storage.getStudentPersona(userId);
      res.json(persona);
    } catch (error) {
      console.error("Error fetching persona:", error);
      res.status(500).json({ message: "Failed to fetch student persona" });
    }
  });

  app.post('/api/persona', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertStudentPersonaSchema.parse({
        ...req.body,
        userId,
      });
      
      const persona = await storage.createStudentPersona(validatedData);
      
      // Create activity record
      await storage.createActivity({
        userId,
        type: "profile_updated",
        description: "Student persona created",
        metadata: { action: "create" },
      });
      
      res.json(persona);
    } catch (error) {
      console.error("Error creating persona:", error);
      res.status(500).json({ message: "Failed to create student persona" });
    }
  });

  app.put('/api/persona/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const persona = await storage.updateStudentPersona(id, req.body);
      
      // Create activity record
      await storage.createActivity({
        userId,
        type: "profile_updated",
        description: "Student persona updated",
        metadata: { action: "update", personaId: id },
      });
      
      res.json(persona);
    } catch (error) {
      console.error("Error updating persona:", error);
      res.status(500).json({ message: "Failed to update student persona" });
    }
  });

  // Essay routes
  app.get('/api/essays', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const essays = await storage.getEssaysByUser(userId);
      res.json(essays);
    } catch (error) {
      console.error("Error fetching essays:", error);
      res.status(500).json({ message: "Failed to fetch essays" });
    }
  });

  app.get('/api/essays/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const essay = await storage.getEssay(id);
      
      if (!essay) {
        return res.status(404).json({ message: "Essay not found" });
      }
      
      res.json(essay);
    } catch (error) {
      console.error("Error fetching essay:", error);
      res.status(500).json({ message: "Failed to fetch essay" });
    }
  });

  app.post('/api/essays', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertEssaySchema.parse({
        ...req.body,
        userId,
      });
      
      const essay = await storage.createEssay(validatedData);
      
      // Create activity record
      await storage.createActivity({
        userId,
        type: "essay_created",
        description: `New essay created: ${essay.title}`,
        metadata: { essayId: essay.id, essayType: essay.type },
      });
      
      res.json(essay);
    } catch (error) {
      console.error("Error creating essay:", error);
      res.status(500).json({ message: "Failed to create essay" });
    }
  });

  app.put('/api/essays/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const essay = await storage.updateEssay(id, req.body);
      
      // Create activity record
      await storage.createActivity({
        userId,
        type: "essay_updated",
        description: `Essay updated: ${essay.title}`,
        metadata: { essayId: id, action: "update" },
      });
      
      res.json(essay);
    } catch (error) {
      console.error("Error updating essay:", error);
      res.status(500).json({ message: "Failed to update essay" });
    }
  });

  app.delete('/api/essays/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      await storage.deleteEssay(id);
      
      // Create activity record
      await storage.createActivity({
        userId,
        type: "essay_deleted",
        description: "Essay deleted",
        metadata: { essayId: id },
      });
      
      res.json({ message: "Essay deleted successfully" });
    } catch (error) {
      console.error("Error deleting essay:", error);
      res.status(500).json({ message: "Failed to delete essay" });
    }
  });

  // AI Essay Analysis route
  app.post('/api/essays/:id/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const essay = await storage.getEssay(id);
      if (!essay) {
        return res.status(404).json({ message: "Essay not found" });
      }
      
      const analysis = await analyzeEssay(essay.content, essay.type, essay.wordLimit || undefined);
      
      // Update essay with AI scores
      const updatedEssay = await storage.updateEssay(id, {
        clarityScore: analysis.clarityScore.toString(),
        impactScore: analysis.impactScore.toString(),
        originalityScore: analysis.originalityScore.toString(),
        wordCount: analysis.wordCount,
      });
      
      // Save AI suggestions
      for (const suggestion of analysis.suggestions) {
        await storage.createAiSuggestion({
          essayId: id,
          type: suggestion.type,
          suggestion: suggestion.suggestion,
          impact: suggestion.impact,
        });
      }
      
      // Create activity record
      await storage.createActivity({
        userId,
        type: "essay_polished",
        description: `Essay analyzed: ${essay.title}`,
        metadata: { 
          essayId: id, 
          clarityScore: analysis.clarityScore,
          impactScore: analysis.impactScore,
          originalityScore: analysis.originalityScore,
        },
      });
      
      res.json({ essay: updatedEssay, analysis });
    } catch (error) {
      console.error("Error analyzing essay:", error);
      res.status(500).json({ message: "Failed to analyze essay" });
    }
  });

  // Get AI suggestions for essay
  app.get('/api/essays/:id/suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const suggestions = await storage.getAiSuggestions(id);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });

  // Apply AI suggestion
  app.post('/api/essays/:id/suggestions/:suggestionId/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id, suggestionId } = req.params;
      
      const essay = await storage.getEssay(id);
      const suggestion = await storage.getAiSuggestions(id);
      const targetSuggestion = suggestion.find(s => s.id === suggestionId);
      
      if (!essay || !targetSuggestion) {
        return res.status(404).json({ message: "Essay or suggestion not found" });
      }
      
      // Create essay version before applying suggestion
      const versions = await storage.getEssayVersions(id);
      await storage.createEssayVersion({
        essayId: id,
        content: essay.content,
        versionNumber: versions.length + 1,
        changes: `Applied suggestion: ${targetSuggestion.type}`,
      });
      
      // Generate improved content
      const improvedContent = await generateEssayImprovement(
        essay.content,
        targetSuggestion.type,
        targetSuggestion.suggestion
      );
      
      // Update essay
      const updatedEssay = await storage.updateEssay(id, {
        content: improvedContent,
        wordCount: improvedContent.split(/\s+/).length,
      });
      
      // Mark suggestion as applied
      await storage.updateAiSuggestion(suggestionId, { applied: true });
      
      // Create activity record
      await storage.createActivity({
        userId,
        type: "essay_polished",
        description: `Applied AI suggestion: ${targetSuggestion.type}`,
        metadata: { essayId: id, suggestionId, suggestionType: targetSuggestion.type },
      });
      
      res.json(updatedEssay);
    } catch (error) {
      console.error("Error applying suggestion:", error);
      res.status(500).json({ message: "Failed to apply suggestion" });
    }
  });

  // Essay versions
  app.get('/api/essays/:id/versions', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const versions = await storage.getEssayVersions(id);
      res.json(versions);
    } catch (error) {
      console.error("Error fetching versions:", error);
      res.status(500).json({ message: "Failed to fetch essay versions" });
    }
  });

  // Scholarship routes
  app.get('/api/scholarships', isAuthenticated, async (req: any, res) => {
    try {
      const scholarships = await storage.getScholarships();
      res.json(scholarships);
    } catch (error) {
      console.error("Error fetching scholarships:", error);
      res.status(500).json({ message: "Failed to fetch scholarships" });
    }
  });

  app.get('/api/scholarships/matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await storage.getScholarshipMatches(userId);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching scholarship matches:", error);
      res.status(500).json({ message: "Failed to fetch scholarship matches" });
    }
  });

  app.post('/api/scholarships/find-matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const persona = await storage.getStudentPersona(userId);
      
      if (!persona) {
        return res.status(400).json({ message: "Student persona not found. Please complete your profile first." });
      }
      
      const matches = await findScholarshipMatches(persona);
      
      // Create activity record
      await storage.createActivity({
        userId,
        type: "scholarship_found",
        description: `Found ${matches.length} scholarship matches`,
        metadata: { matchCount: matches.length },
      });
      
      res.json(matches);
    } catch (error) {
      console.error("Error finding scholarship matches:", error);
      res.status(500).json({ message: "Failed to find scholarship matches" });
    }
  });

  // Activity routes
  app.get('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activities = await storage.getActivities(userId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Admin routes (require admin role)
  app.get('/api/admin/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'counselor') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      if (!user.schoolId) {
        return res.status(400).json({ message: "School association required" });
      }
      
      const analytics = await storage.getSchoolAnalytics(user.schoolId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/admin/activities', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'counselor') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const activities = await storage.getRecentActivities(20);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching admin activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Writing samples routes
  app.get('/api/writing-samples', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const samples = await storage.getWritingSamples(userId);
      res.json(samples);
    } catch (error) {
      console.error("Error fetching writing samples:", error);
      res.status(500).json({ message: "Failed to fetch writing samples" });
    }
  });

  app.post('/api/writing-samples', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertWritingSampleSchema.parse({
        ...req.body,
        userId,
      });
      
      const sample = await storage.createWritingSample(validatedData);
      
      // Create activity record
      await storage.createActivity({
        userId,
        type: "writing_sample_uploaded",
        description: `Writing sample uploaded: ${sample.originalName}`,
        metadata: { sampleId: sample.id, fileType: sample.fileType },
      });
      
      res.json(sample);
    } catch (error) {
      console.error("Error creating writing sample:", error);
      res.status(500).json({ message: "Failed to upload writing sample" });
    }
  });

  app.delete('/api/writing-samples/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      await storage.deleteWritingSample(id);
      
      // Create activity record
      await storage.createActivity({
        userId,
        type: "writing_sample_deleted",
        description: "Writing sample deleted",
        metadata: { sampleId: id },
      });
      
      res.json({ message: "Writing sample deleted successfully" });
    } catch (error) {
      console.error("Error deleting writing sample:", error);
      res.status(500).json({ message: "Failed to delete writing sample" });
    }
  });

  // School management routes
  app.post('/api/schools', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const validatedData = insertSchoolSchema.parse(req.body);
      const school = await storage.createSchool(validatedData);
      res.json(school);
    } catch (error) {
      console.error("Error creating school:", error);
      res.status(500).json({ message: "Failed to create school" });
    }
  });

  app.put('/api/schools/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      const school = await storage.updateSchool(id, req.body);
      res.json(school);
    } catch (error) {
      console.error("Error updating school:", error);
      res.status(500).json({ message: "Failed to update school" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
