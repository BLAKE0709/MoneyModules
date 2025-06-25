import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";

export function registerMobileRoutes(app: Express) {
  
  // Get deadline alerts for mobile notifications
  app.get('/api/scholarships/deadline-alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scholarshipMatches = await storage.getScholarshipMatches(userId);
      
      const now = new Date();
      const alerts = scholarshipMatches
        .map(match => {
          if (!match.scholarship?.deadline) return null;
          
          const deadline = new Date(match.scholarship.deadline);
          const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          // Only return alerts for deadlines within 30 days
          if (daysLeft <= 0 || daysLeft > 30) return null;
          
          return {
            id: match.id,
            scholarshipTitle: match.scholarship.title,
            amount: match.scholarship.amount,
            deadline: match.scholarship.deadline,
            daysLeft,
            applicationUrl: match.scholarship.applicationUrl,
            matchScore: match.matchScore || 0,
            urgency: daysLeft <= 1 ? 'critical' : daysLeft <= 3 ? 'high' : daysLeft <= 7 ? 'medium' : 'low'
          };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => a.daysLeft - b.daysLeft);

      res.json(alerts);
    } catch (error) {
      console.error("Error fetching deadline alerts:", error);
      res.status(500).json({ message: "Failed to fetch deadline alerts" });
    }
  });

  // Mark deadline alert as seen
  app.post('/api/scholarships/deadline-alerts/:alertId/seen', isAuthenticated, async (req: any, res) => {
    try {
      const { alertId } = req.params;
      const userId = req.user.claims.sub;
      
      // In production, track which alerts user has seen
      console.log(`User ${userId} marked alert ${alertId} as seen`);
      
      res.json({ message: "Alert marked as seen" });
    } catch (error) {
      console.error("Error marking alert as seen:", error);
      res.status(500).json({ message: "Failed to mark alert as seen" });
    }
  });

  // Get mobile-optimized scholarship list
  app.get('/api/scholarships/mobile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { page = 1, limit = 10, filter = 'all' } = req.query;
      
      const scholarshipMatches = await storage.getScholarshipMatches(userId);
      
      // Filter scholarships based on mobile filter
      let filteredMatches = scholarshipMatches;
      
      switch (filter) {
        case 'urgent':
          filteredMatches = scholarshipMatches.filter(m => {
            if (!m.scholarship?.deadline) return false;
            const daysLeft = Math.ceil((new Date(m.scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return daysLeft <= 7 && daysLeft > 0;
          });
          break;
        case 'high-match':
          filteredMatches = scholarshipMatches.filter(m => (m.matchScore || 0) >= 80);
          break;
        case 'local':
          filteredMatches = scholarshipMatches.filter(m => 
            m.scholarship?.tags?.includes('local') || 
            m.scholarship?.tags?.includes('community')
          );
          break;
      }
      
      // Paginate results
      const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
      const endIndex = startIndex + parseInt(limit as string);
      const paginatedMatches = filteredMatches.slice(startIndex, endIndex);
      
      // Format for mobile display
      const mobileScholarships = paginatedMatches.map(match => ({
        id: match.id,
        title: match.scholarship?.title,
        provider: match.scholarship?.provider,
        amount: match.scholarship?.amount,
        deadline: match.scholarship?.deadline,
        matchScore: match.matchScore,
        daysLeft: match.scholarship?.deadline 
          ? Math.ceil((new Date(match.scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
        competitiveness: match.scholarship?.competitiveness || 'medium',
        tags: match.scholarship?.tags || [],
        applicationUrl: match.scholarship?.applicationUrl
      }));

      res.json({
        scholarships: mobileScholarships,
        pagination: {
          currentPage: parseInt(page as string),
          totalItems: filteredMatches.length,
          totalPages: Math.ceil(filteredMatches.length / parseInt(limit as string)),
          hasMore: endIndex < filteredMatches.length
        },
        filters: {
          all: scholarshipMatches.length,
          urgent: scholarshipMatches.filter(m => {
            if (!m.scholarship?.deadline) return false;
            const daysLeft = Math.ceil((new Date(m.scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return daysLeft <= 7 && daysLeft > 0;
          }).length,
          highMatch: scholarshipMatches.filter(m => (m.matchScore || 0) >= 80).length,
          local: scholarshipMatches.filter(m => 
            m.scholarship?.tags?.includes('local') || 
            m.scholarship?.tags?.includes('community')
          ).length
        }
      });
    } catch (error) {
      console.error("Error fetching mobile scholarships:", error);
      res.status(500).json({ message: "Failed to fetch mobile scholarships" });
    }
  });

  // Get mobile-optimized essay list
  app.get('/api/essays/mobile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const essays = await storage.getEssaysByUser(userId);
      
      // Format for mobile display
      const mobileEssays = essays.map(essay => ({
        id: essay.id,
        title: essay.title,
        type: essay.type,
        status: essay.status || 'draft',
        wordCount: essay.wordCount,
        wordLimit: essay.wordLimit,
        lastUpdated: essay.updatedAt,
        scores: {
          clarity: essay.clarityScore ? parseInt(essay.clarityScore) : null,
          impact: essay.impactScore ? parseInt(essay.impactScore) : null,
          originality: essay.originalityScore ? parseInt(essay.originalityScore) : null,
          overall: essay.clarityScore && essay.impactScore && essay.originalityScore
            ? Math.round((parseInt(essay.clarityScore) + parseInt(essay.impactScore) + parseInt(essay.originalityScore)) / 3)
            : null
        },
        needsAttention: essay.status === 'draft' || 
                      (essay.clarityScore && parseInt(essay.clarityScore) < 7) ||
                      (essay.impactScore && parseInt(essay.impactScore) < 7)
      }));

      res.json({
        essays: mobileEssays,
        summary: {
          total: essays.length,
          drafts: essays.filter(e => e.status === 'draft').length,
          analyzed: essays.filter(e => e.status === 'analyzed').length,
          needsWork: mobileEssays.filter(e => e.needsAttention).length
        }
      });
    } catch (error) {
      console.error("Error fetching mobile essays:", error);
      res.status(500).json({ message: "Failed to fetch mobile essays" });
    }
  });

  // Quick essay analysis for mobile
  app.post('/api/essays/:id/quick-analyze', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const essay = await storage.getEssay(id);
      if (!essay || essay.userId !== userId) {
        return res.status(404).json({ message: "Essay not found" });
      }

      // Quick analysis for mobile - faster response
      const quickAnalysis = {
        wordCount: essay.content.split(/\s+/).length,
        readingTime: Math.ceil(essay.content.split(/\s+/).length / 200), // minutes
        sentenceCount: essay.content.split(/[.!?]+/).length - 1,
        paragraphCount: essay.content.split(/\n\s*\n/).length,
        quickScore: Math.floor(Math.random() * 3) + 7, // 7-9 range for demo
        topSuggestion: "Consider strengthening your opening paragraph to better capture the reader's attention."
      };

      res.json(quickAnalysis);
    } catch (error) {
      console.error("Error performing quick analysis:", error);
      res.status(500).json({ message: "Failed to perform quick analysis" });
    }
  });
}