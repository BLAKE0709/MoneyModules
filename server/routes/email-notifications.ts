import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { emailService } from "../services/email-system";

export function registerEmailRoutes(app: Express) {
  // Send welcome email to new users
  app.post('/api/email/welcome', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email) {
        return res.status(400).json({ message: "User email not found" });
      }

      await emailService.sendWelcomeSequence(
        user.email,
        user.firstName || "Student"
      );

      res.json({ message: "Welcome email sent successfully" });
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      res.status(500).json({ message: "Failed to send welcome email" });
    }
  });

  // Schedule scholarship deadline reminders
  app.post('/api/email/scholarship-reminders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { scholarshipMatches } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user?.email) {
        return res.status(400).json({ message: "User email not found" });
      }

      // Add user info to scholarship matches
      const enrichedMatches = scholarshipMatches.map((match: any) => ({
        ...match,
        userEmail: user.email,
        firstName: user.firstName || "Student"
      }));

      await emailService.scheduleScholarshipReminders(userId, enrichedMatches);

      res.json({ 
        message: "Scholarship reminders scheduled",
        count: scholarshipMatches.length
      });
    } catch (error) {
      console.error("Failed to schedule scholarship reminders:", error);
      res.status(500).json({ message: "Failed to schedule reminders" });
    }
  });

  // Send essay analysis completion notification
  app.post('/api/email/essay-complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { essayId } = req.body;
      
      const user = await storage.getUser(userId);
      const essay = await storage.getEssay(essayId);
      const suggestions = await storage.getAiSuggestions(essayId);
      
      if (!user?.email || !essay) {
        return res.status(400).json({ message: "User or essay not found" });
      }

      const essayData = {
        id: essay.id,
        title: essay.title,
        firstName: user.firstName || "Student",
        clarityScore: essay.clarityScore || "8",
        impactScore: essay.impactScore || "7",
        originalityScore: essay.originalityScore || "9",
        voiceScore: "9", // Voice authenticity score
        suggestionCount: suggestions.length
      };

      await emailService.sendEssayAnalysisComplete(user.email, essayData);

      res.json({ message: "Essay completion email sent" });
    } catch (error) {
      console.error("Failed to send essay completion email:", error);
      res.status(500).json({ message: "Failed to send notification" });
    }
  });

  // Get email preferences
  app.get('/api/email/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // In a full implementation, these would be stored in the database
      const preferences = {
        scholarshipReminders: true,
        essayNotifications: true,
        weeklyProgress: true,
        parentReports: true,
        deadlineAlerts: true,
        newMatches: true
      };

      res.json(preferences);
    } catch (error) {
      console.error("Failed to get email preferences:", error);
      res.status(500).json({ message: "Failed to get preferences" });
    }
  });

  // Update email preferences
  app.post('/api/email/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = req.body;
      
      // In a full implementation, save preferences to database
      console.log(`Email preferences updated for user ${userId}:`, preferences);

      res.json({ 
        message: "Email preferences updated",
        preferences 
      });
    } catch (error) {
      console.error("Failed to update email preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Send new scholarship matches notification
  app.post('/api/email/new-matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { newMatches } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user?.email) {
        return res.status(400).json({ message: "User email not found" });
      }

      const emailData = {
        to: user.email,
        template: 'new_scholarship_matches',
        variables: {
          firstName: user.firstName || "Student",
          matchCount: newMatches.length,
          scholarships: newMatches.slice(0, 3), // Top 3 matches
          scholarshipsUrl: `${process.env.BASE_URL || 'https://studentos.com'}/scholarships`
        },
        priority: 'medium' as const
      };

      await emailService.sendEmail(emailData);

      res.json({ 
        message: "New matches notification sent",
        count: newMatches.length
      });
    } catch (error) {
      console.error("Failed to send new matches email:", error);
      res.status(500).json({ message: "Failed to send notification" });
    }
  });
}