import { Express, Request, Response } from 'express';
import { isAuthenticated } from '../replitAuth';
import { scholarshipApplicationGenerator } from '../services/scholarship-application-generator';
import { storage } from '../storage';
import { intelligentScout } from '../services/intelligent-scholarship-scout';

export function registerScholarshipApplicationRoutes(app: Express) {
  
  // Intelligent scholarship discovery - find hidden opportunities
  app.get('/api/scholarships/intelligent-discovery', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const persona = await storage.getStudentPersona(userId);
      
      if (!persona) {
        return res.status(400).json({ 
          message: "Complete your student profile to discover hidden scholarship opportunities",
          action: "complete_profile"
        });
      }

      const hiddenMatches = await intelligentScout.discoverHiddenOpportunities(persona);
      const intelligenceReport = intelligentScout.generateIntelligenceReport(hiddenMatches);

      res.json({
        success: true,
        data: {
          hiddenMatches,
          intelligenceReport,
          discoveryCount: hiddenMatches.length,
          estimatedValue: intelligenceReport.totalHiddenValue
        }
      });
    } catch (error) {
      console.error('Intelligent discovery error:', error);
      res.status(500).json({ message: 'Failed to discover hidden opportunities' });
    }
  });
  
  // Generate pre-populated application for a specific scholarship
  app.post('/api/scholarships/:scholarshipId/generate-application', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { scholarshipId } = req.params;
      
      // Get scholarship details (this would come from your scholarship database)
      const scholarshipDetails = {
        id: scholarshipId,
        title: "Academic Excellence Scholarship",
        amount: 5000,
        deadline: "2024-03-15",
        applicationUrl: "https://scholarship-portal.edu/apply",
        essayPrompts: [
          "Why do you deserve this scholarship? (500 words)",
          "Describe your career goals and how this scholarship will help you achieve them. (300 words)",
          "Tell us about a challenge you've overcome and what you learned from it. (400 words)"
        ],
        requiredDocuments: ["transcript", "recommendation_letters", "financial_aid_form"],
        eligibilityRequirements: ["minimum 3.0 GPA", "financial need", "community service"]
      };
      
      // Generate pre-populated application
      const application = await scholarshipApplicationGenerator.generatePrePopulatedApplication(
        userId,
        scholarshipId,
        scholarshipDetails
      );
      
      // Log activity
      await storage.createActivity({
        userId,
        type: 'scholarship_application_generated',
        description: `Pre-populated application generated for ${scholarshipDetails.title}`,
        metadata: { 
          scholarshipId,
          completionPercentage: application.completionPercentage,
          estimatedTime: application.estimatedTimeToComplete
        }
      });
      
      res.json({ success: true, data: application });
    } catch (error) {
      console.error("Application generation error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to generate application" 
      });
    }
  });

  // Get all generated applications for a user
  app.get('/api/scholarship-applications', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      
      // For demo purposes, return sample applications
      // In production, this would query a scholarship_applications table
      const sampleApplications = [
        {
          id: "app_1",
          scholarshipId: "sch_001",
          scholarshipTitle: "Academic Excellence Scholarship",
          status: "review_needed",
          completionPercentage: 92,
          estimatedTimeToComplete: 15,
          deadline: new Date("2024-03-15"),
          lastUpdated: new Date(),
          missingFieldsCount: 2
        },
        {
          id: "app_2", 
          scholarshipId: "sch_002",
          scholarshipTitle: "STEM Innovation Award",
          status: "ready_to_submit",
          completionPercentage: 98,
          estimatedTimeToComplete: 5,
          deadline: new Date("2024-04-01"),
          lastUpdated: new Date(),
          missingFieldsCount: 0
        },
        {
          id: "app_3",
          scholarshipId: "sch_003", 
          scholarshipTitle: "Community Leadership Grant",
          status: "draft",
          completionPercentage: 78,
          estimatedTimeToComplete: 35,
          deadline: new Date("2024-03-30"),
          lastUpdated: new Date(),
          missingFieldsCount: 5
        }
      ];
      
      res.json({ success: true, data: sampleApplications });
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch applications" });
    }
  });

  // Get detailed view of a specific application
  app.get('/api/scholarship-applications/:applicationId', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { applicationId } = req.params;
      
      // Get student persona for pre-filling
      const persona = await storage.getStudentPersona(userId);
      if (!persona) {
        return res.status(400).json({ success: false, error: "Student persona required" });
      }

      // Generate detailed application view
      const scholarshipDetails = {
        title: "Academic Excellence Scholarship",
        amount: 5000,
        deadline: "2024-03-15",
        applicationUrl: "https://scholarship-portal.edu/apply",
        essayPrompts: [
          "Why do you deserve this scholarship? (500 words)",
          "Describe your career goals and how this scholarship will help you achieve them. (300 words)"
        ]
      };

      const application = await scholarshipApplicationGenerator.generatePrePopulatedApplication(
        userId,
        "sch_001",
        scholarshipDetails
      );
      
      res.json({ success: true, data: application });
    } catch (error) {
      console.error("Get application details error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch application details" });
    }
  });

  // Update a field in an application
  app.patch('/api/scholarship-applications/:applicationId', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { applicationId } = req.params;
      const { field, value, section } = req.body;
      
      // Update the application field
      await scholarshipApplicationGenerator.updateApplicationField(applicationId, field, value);
      
      // Log the update
      await storage.createActivity({
        userId,
        type: 'scholarship_application_updated',
        description: `Updated ${field} in scholarship application`,
        metadata: { applicationId, field, section }
      });
      
      res.json({ success: true, message: "Application updated successfully" });
    } catch (error) {
      console.error("Update application error:", error);
      res.status(500).json({ success: false, error: "Failed to update application" });
    }
  });

  // Submit a completed application
  app.post('/api/scholarship-applications/:applicationId/submit', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { applicationId } = req.params;
      
      // Submit the application
      const result = await scholarshipApplicationGenerator.submitApplication(applicationId);
      
      // Log submission
      await storage.createActivity({
        userId,
        type: 'scholarship_application_submitted',
        description: `Scholarship application submitted successfully`,
        metadata: { 
          applicationId, 
          confirmationNumber: result.confirmationNumber 
        }
      });
      
      res.json({ 
        success: true, 
        data: {
          confirmationNumber: result.confirmationNumber,
          submittedAt: new Date(),
          message: "Application submitted successfully!"
        }
      });
    } catch (error) {
      console.error("Submit application error:", error);
      res.status(500).json({ success: false, error: "Failed to submit application" });
    }
  });

  // Bulk generate applications for multiple scholarships
  app.post('/api/scholarships/bulk-generate-applications', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { scholarshipIds } = req.body;
      
      if (!Array.isArray(scholarshipIds) || scholarshipIds.length === 0) {
        return res.status(400).json({ success: false, error: "scholarshipIds array required" });
      }
      
      const applications = [];
      
      for (const scholarshipId of scholarshipIds) {
        const scholarshipDetails = {
          id: scholarshipId,
          title: `Scholarship ${scholarshipId}`,
          amount: 2500,
          deadline: "2024-04-15",
          applicationUrl: "https://example.com/apply",
          essayPrompts: ["Why do you deserve this scholarship?"]
        };
        
        const application = await scholarshipApplicationGenerator.generatePrePopulatedApplication(
          userId,
          scholarshipId,
          scholarshipDetails
        );
        
        applications.push(application);
      }
      
      // Log bulk generation
      await storage.createActivity({
        userId,
        type: 'bulk_applications_generated',
        description: `Generated ${applications.length} pre-populated scholarship applications`,
        metadata: { 
          count: applications.length,
          totalEstimatedTime: applications.reduce((sum, app) => sum + app.estimatedTimeToComplete, 0)
        }
      });
      
      res.json({ 
        success: true, 
        data: {
          applications,
          summary: {
            totalApplications: applications.length,
            averageCompletion: Math.round(applications.reduce((sum, app) => sum + app.completionPercentage, 0) / applications.length),
            totalTimeRequired: applications.reduce((sum, app) => sum + app.estimatedTimeToComplete, 0)
          }
        }
      });
    } catch (error) {
      console.error("Bulk generation error:", error);
      res.status(500).json({ success: false, error: "Failed to generate applications" });
    }
  });
}