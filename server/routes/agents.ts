import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { personaLearningAgent } from "../services/agents/persona-learning-agent";
import { essayPolishAgent } from "../services/agents/essay-polish-agent";
import { scholarshipScoutAgent } from "../services/agents/scholarship-scout-agent";
import { b2bIntegrationService } from "../services/b2b-integration";
import type { AgentContext } from "@shared/agent-types";

export function registerAgentRoutes(app: Express) {
  
  // Persona Learning Agent Routes
  app.post('/api/agents/persona/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { activity } = req.body;
      
      const context = await buildAgentContext(userId);
      const result = await personaLearningAgent.analyzeAndUpdatePersona(context, activity);
      
      res.json(result);
    } catch (error) {
      console.error("Persona analysis error:", error);
      res.status(500).json({ success: false, error: "Failed to analyze persona" });
    }
  });

  app.get('/api/agents/persona/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await personaLearningAgent.getPersonaInsights(userId);
      res.json(result);
    } catch (error) {
      console.error("Persona insights error:", error);
      res.status(500).json({ success: false, error: "Failed to get persona insights" });
    }
  });

  // Essay Polish Agent Routes
  app.post('/api/agents/essay/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { essayContent, essayType } = req.body;
      
      const context = await buildAgentContext(userId);
      const result = await essayPolishAgent.analyzeEssayWithPersona(context, essayContent, essayType);
      
      // Log activity for persona learning
      await storage.createActivity({
        userId,
        type: 'essay_analyzed',
        description: `Essay analyzed by EssayPolish Agent`,
        agentType: 'essay_polish',
        metadata: { essayType, contentLength: essayContent.length },
        learningData: result.learningData
      });
      
      res.json(result);
    } catch (error) {
      console.error("Essay analysis error:", error);
      res.status(500).json({ success: false, error: "Failed to analyze essay" });
    }
  });

  app.post('/api/agents/essay/improve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { essayContent, focusAreas } = req.body;
      
      const context = await buildAgentContext(userId);
      const result = await essayPolishAgent.improveEssayPreservingVoice(context, essayContent, focusAreas);
      
      res.json(result);
    } catch (error) {
      console.error("Essay improvement error:", error);
      res.status(500).json({ success: false, error: "Failed to improve essay" });
    }
  });

  app.post('/api/agents/essay/prompts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { essayType } = req.body;
      
      const context = await buildAgentContext(userId);
      const result = await essayPolishAgent.generatePersonalizedPrompts(context, essayType);
      
      res.json(result);
    } catch (error) {
      console.error("Prompt generation error:", error);
      res.status(500).json({ success: false, error: "Failed to generate prompts" });
    }
  });

  // Scholarship Scout Agent Routes
  app.get('/api/agents/scholarships/discover', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const context = await buildAgentContext(userId);
      const result = await scholarshipScoutAgent.findPersonalizedScholarships(context);
      
      // Log activity for persona learning
      await storage.createActivity({
        userId,
        type: 'scholarship_search',
        description: `Scholarship discovery by ScholarshipScout Agent`,
        agentType: 'scholarship_scout',
        metadata: { 
          opportunitiesFound: result.data?.opportunities?.length || 0,
          totalValue: result.data?.totalValue || 0
        }
      });
      
      res.json(result);
    } catch (error) {
      console.error("Scholarship discovery error:", error);
      res.status(500).json({ success: false, error: "Failed to discover scholarships" });
    }
  });

  app.post('/api/agents/scholarships/track', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { scholarshipId, status } = req.body;
      
      const result = await scholarshipScoutAgent.trackApplicationProgress(userId, scholarshipId, status);
      res.json(result);
    } catch (error) {
      console.error("Scholarship tracking error:", error);
      res.status(500).json({ success: false, error: "Failed to track scholarship" });
    }
  });

  app.get('/api/agents/scholarships/reminders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const context = await buildAgentContext(userId);
      const result = await scholarshipScoutAgent.generateApplicationReminders(context);
      
      res.json(result);
    } catch (error) {
      console.error("Scholarship reminders error:", error);
      res.status(500).json({ success: false, error: "Failed to generate reminders" });
    }
  });

  // Unified Agent Coordination
  app.get('/api/agents/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const context = await buildAgentContext(userId);
      
      // Get insights from all agents
      const [personaInsights, scholarshipReminders] = await Promise.all([
        personaLearningAgent.getPersonaInsights(userId),
        scholarshipScoutAgent.generateApplicationReminders(context)
      ]);
      
      // Get recent activities across all agents
      const recentActivities = await storage.getActivities(userId);
      const agentActivities = recentActivities.filter(activity => activity.agentType);
      
      res.json({
        success: true,
        data: {
          personaInsights: personaInsights.data,
          scholarshipReminders: scholarshipReminders.data?.reminders || [],
          recentAgentActivity: agentActivities.slice(0, 10),
          agentHealth: {
            personaLearning: personaInsights.success,
            scholarshipScout: scholarshipReminders.success,
            essayPolish: true // Always available
          }
        }
      });
    } catch (error) {
      console.error("Agent dashboard error:", error);
      res.status(500).json({ success: false, error: "Failed to load agent dashboard" });
    }
  });

  // B2B Integration Routes
  app.get('/api/b2b/school/:schoolId/insights', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const { period = 'month' } = req.query;
      
      const insights = await b2bIntegrationService.generateSchoolInsights(schoolId, period);
      res.json({ success: true, data: insights });
    } catch (error) {
      console.error("B2B insights error:", error);
      res.status(500).json({ success: false, error: "Failed to generate school insights" });
    }
  });

  app.get('/api/b2b/school/:schoolId/curriculum', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      
      const curriculumInsights = await b2bIntegrationService.generateCurriculumInsights(schoolId);
      res.json({ success: true, data: curriculumInsights });
    } catch (error) {
      console.error("Curriculum insights error:", error);
      res.status(500).json({ success: false, error: "Failed to generate curriculum insights" });
    }
  });

  app.post('/api/b2b/nps-tracking', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId, studentId, stage, rating } = req.body;
      
      const result = await b2bIntegrationService.trackOnboardingNPS(schoolId, studentId, stage, rating);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error("NPS tracking error:", error);
      res.status(500).json({ success: false, error: "Failed to track NPS" });
    }
  });

  // External API endpoint for partner integrations
  app.post('/api/external/:endpoint', async (req, res) => {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      const { endpoint } = req.params;
      
      if (!apiKey) {
        return res.status(401).json({ error: "API key required" });
      }
      
      const result = await b2bIntegrationService.processExternalRequest(apiKey, `/${endpoint}`, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error("External API error:", error);
      res.status(500).json({ success: false, error: "External API request failed" });
    }
  });
}

async function buildAgentContext(userId: string): Promise<AgentContext> {
  const [persona, writingSamples, essays] = await Promise.all([
    storage.getStudentPersona(userId),
    storage.getWritingSamples(userId),
    storage.getEssaysByUser(userId)
  ]);

  if (!persona) {
    throw new Error("Student persona not found");
  }

  return {
    userId,
    persona,
    writingSamples: writingSamples || [],
    essays: essays || []
  };
}