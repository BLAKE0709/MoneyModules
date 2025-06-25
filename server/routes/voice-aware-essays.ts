import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { voicePreservationEngine } from "../services/voice-preservation";
import { insertEssaySchema } from "@shared/schema";

export function registerVoiceAwareEssayRoutes(app: Express) {
  // Generate voice-aware essay draft
  app.post('/api/essays/generate-draft', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { prompt, essayType, keyPoints } = req.body;
      
      if (!prompt || !essayType) {
        return res.status(400).json({ message: "Prompt and essay type are required" });
      }

      // Get user's writing samples for voice analysis
      const writingSamples = await storage.getWritingSamples(userId);
      
      if (writingSamples.length === 0) {
        return res.status(400).json({ 
          message: "No writing samples found. Please upload some of your previous writing to generate voice-aware drafts.",
          requiresWritingSamples: true
        });
      }

      // Analyze the user's writing voice
      const voiceAnalysis = await voicePreservationEngine.analyzeWritingVoice(writingSamples);
      
      // Generate essay draft in their voice
      const draftContent = await voicePreservationEngine.generateEssayDraft(
        prompt,
        essayType,
        voiceAnalysis,
        writingSamples,
        keyPoints
      );

      res.json({
        draftContent,
        voiceAnalysis,
        basedOnSamples: writingSamples.length,
        voiceConfidence: voiceAnalysis.writingPatterns.voiceConfidence
      });
    } catch (error) {
      console.error("Error generating voice-aware draft:", error);
      res.status(500).json({ message: "Failed to generate essay draft" });
    }
  });

  // Analyze writing voice from samples
  app.get('/api/writing-voice/analysis', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const writingSamples = await storage.getWritingSamples(userId);
      
      if (writingSamples.length === 0) {
        return res.json({
          hasVoiceProfile: false,
          message: "Upload writing samples to create your voice profile"
        });
      }

      const voiceAnalysis = await voicePreservationEngine.analyzeWritingVoice(writingSamples);
      
      res.json({
        hasVoiceProfile: true,
        voiceAnalysis,
        samplesAnalyzed: writingSamples.length,
        confidence: voiceAnalysis.writingPatterns.voiceConfidence,
        recommendations: voiceAnalysis.writingPatterns.voiceConfidence < 70 
          ? ["Upload more diverse writing samples for better voice analysis"]
          : ["Your voice profile is strong and ready for essay generation"]
      });
    } catch (error) {
      console.error("Error analyzing writing voice:", error);
      res.status(500).json({ message: "Failed to analyze writing voice" });
    }
  });

  // Get voice-preserved suggestions for existing essay
  app.post('/api/essays/:id/voice-preserved-suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const essay = await storage.getEssay(id);
      if (!essay || essay.userId !== userId) {
        return res.status(404).json({ message: "Essay not found" });
      }

      // Get AI suggestions from the database instead of essay.analysis
      const suggestions = await storage.getAiSuggestions(id);
      if (!suggestions || suggestions.length === 0) {
        return res.status(400).json({ message: "Essay must be analyzed first" });
      }

      const writingSamples = await storage.getWritingSamples(userId);
      if (writingSamples.length === 0) {
        return res.json({
          voicePreservedSuggestions: essay.analysis.suggestions,
          message: "Upload writing samples for voice-aware suggestions"
        });
      }

      const voiceAnalysis = await voicePreservationEngine.analyzeWritingVoice(writingSamples);
      const voicePreservedSuggestions = await voicePreservationEngine.generateVoicePreservedSuggestions(
        essay.content,
        suggestions,
        voiceAnalysis
      );

      res.json({
        originalSuggestions: suggestions,
        voicePreservedSuggestions,
        voiceAnalysis,
        samplesUsed: writingSamples.length
      });
    } catch (error) {
      console.error("Error generating voice-preserved suggestions:", error);
      res.status(500).json({ message: "Failed to generate voice-preserved suggestions" });
    }
  });

  // Update essay with voice-aware improvements
  app.post('/api/essays/:id/apply-voice-improvements', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const { selectedSuggestions } = req.body;
      
      const essay = await storage.getEssay(id);
      if (!essay || essay.userId !== userId) {
        return res.status(404).json({ message: "Essay not found" });
      }

      // Create activity record for voice-aware improvements
      await storage.createActivity({
        userId,
        type: "essay_voice_improved",
        description: `Applied ${selectedSuggestions.length} voice-aware improvements to essay`,
        metadata: { 
          essayId: essay.id, 
          improvementsApplied: selectedSuggestions.length,
          voicePreserved: true
        },
      });

      res.json({
        success: true,
        message: "Voice-aware improvements applied",
        improvementsCount: selectedSuggestions.length
      });
    } catch (error) {
      console.error("Error applying voice improvements:", error);
      res.status(500).json({ message: "Failed to apply voice improvements" });
    }
  });
}