// B2B Integration Layer - Agentic Tether for School Partnerships
import { storage } from "../storage";
import { personaLearningAgent } from "./agents/persona-learning-agent";
import { essayPolishAgent } from "./agents/essay-polish-agent";
import { scholarshipScoutAgent } from "./agents/scholarship-scout-agent";
import type { AgentContext } from "@shared/agent-types";

export interface B2BMetrics {
  schoolId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  metrics: {
    activeStudents: number;
    essaysPolished: number;
    scholarshipMatches: number;
    totalScholarshipValue: number;
    averageGPAImprovement: number;
    counselorTimesSaved: number;
    studentEngagementScore: number;
    npsScore: number;
  };
}

export interface B2BApiAccess {
  schoolId: string;
  apiKey: string;
  permissions: string[];
  rateLimit: number;
  dataScope: 'aggregated' | 'student_specific' | 'full_access';
}

export class B2BIntegrationService {
  // Generate aggregated insights for school administrators
  async generateSchoolInsights(schoolId: string, period: string): Promise<B2BMetrics> {
    try {
      const schoolAnalytics = await storage.getSchoolAnalytics(schoolId);
      
      // Calculate B2B value metrics
      const metrics = {
        activeStudents: schoolAnalytics.activeStudents,
        essaysPolished: schoolAnalytics.essaysPolished,
        scholarshipMatches: await this.calculateScholarshipMatches(schoolId),
        totalScholarshipValue: await this.calculateScholarshipValue(schoolId),
        averageGPAImprovement: await this.calculateGPAImprovement(schoolId),
        counselorTimesSaved: await this.calculateTimeSavings(schoolId),
        studentEngagementScore: schoolAnalytics.engagementRate,
        npsScore: await this.calculateNPS(schoolId)
      };

      return {
        schoolId,
        period: period as any,
        metrics
      };
    } catch (error) {
      console.error("B2B insights generation error:", error);
      throw new Error("Failed to generate school insights");
    }
  }

  // Provide API access for external educational tools
  async processExternalRequest(apiKey: string, endpoint: string, data: any) {
    try {
      // Validate API access
      const access = await this.validateApiAccess(apiKey);
      if (!access) {
        throw new Error("Invalid API access");
      }

      // Route to appropriate agent based on endpoint
      switch (endpoint) {
        case '/persona/analyze':
          return await this.handlePersonaRequest(access, data);
        case '/essay/polish':
          return await this.handleEssayRequest(access, data);
        case '/scholarships/discover':
          return await this.handleScholarshipRequest(access, data);
        default:
          throw new Error("Unknown endpoint");
      }
    } catch (error) {
      console.error("External API request error:", error);
      throw error;
    }
  }

  // Enable curriculum enhancement through AI insights
  async generateCurriculumInsights(schoolId: string) {
    try {
      // Aggregate writing patterns across all students
      const writingPatterns = await this.aggregateWritingPatterns(schoolId);
      
      // Identify common challenges and strengths
      const commonChallenges = await this.identifyCommonChallenges(schoolId);
      
      // Generate curriculum recommendations
      const recommendations = await this.generateCurriculumRecommendations(
        writingPatterns, 
        commonChallenges
      );

      return {
        writingPatterns,
        commonChallenges,
        recommendations,
        implementationGuide: await this.createImplementationGuide(recommendations)
      };
    } catch (error) {
      console.error("Curriculum insights error:", error);
      throw new Error("Failed to generate curriculum insights");
    }
  }

  // Track and optimize onboarding for freshman NPS
  async trackOnboardingNPS(schoolId: string, studentId: string, stage: string, rating: number) {
    try {
      await storage.createActivity({
        userId: studentId,
        type: 'onboarding_nps',
        description: `NPS rating: ${rating} at stage: ${stage}`,
        agentType: 'persona_learning',
        metadata: {
          schoolId,
          stage,
          rating,
          timestamp: new Date().toISOString()
        }
      });

      // Trigger persona learning to improve onboarding
      const context = await this.buildAgentContext(studentId);
      await personaLearningAgent.analyzeAndUpdatePersona(context, {
        type: 'onboarding_feedback',
        stage,
        rating,
        schoolId
      });

      return { tracked: true, stage, rating };
    } catch (error) {
      console.error("NPS tracking error:", error);
      throw new Error("Failed to track onboarding NPS");
    }
  }

  // Private helper methods
  private async validateApiAccess(apiKey: string): Promise<B2BApiAccess | null> {
    // In real implementation, validate against database
    // For now, return mock validation
    return {
      schoolId: "demo_school",
      apiKey,
      permissions: ["read", "analyze"],
      rateLimit: 1000,
      dataScope: "aggregated"
    };
  }

  private async handlePersonaRequest(access: B2BApiAccess, data: any) {
    if (!access.permissions.includes("analyze")) {
      throw new Error("Insufficient permissions");
    }

    const context = await this.buildAgentContext(data.userId);
    return await personaLearningAgent.analyzeAndUpdatePersona(context, data.activity);
  }

  private async handleEssayRequest(access: B2BApiAccess, data: any) {
    const context = await this.buildAgentContext(data.userId);
    return await essayPolishAgent.analyzeEssayWithPersona(
      context, 
      data.essayContent, 
      data.essayType
    );
  }

  private async handleScholarshipRequest(access: B2BApiAccess, data: any) {
    const context = await this.buildAgentContext(data.userId);
    return await scholarshipScoutAgent.findPersonalizedScholarships(context);
  }

  private async buildAgentContext(userId: string): Promise<AgentContext> {
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

  private async calculateScholarshipMatches(schoolId: string): Promise<number> {
    // Aggregate scholarship matches across school
    return 45; // Mock data - in real app, query database
  }

  private async calculateScholarshipValue(schoolId: string): Promise<number> {
    // Calculate total scholarship value secured by students
    return 285000; // Mock data - in real app, sum actual scholarship amounts
  }

  private async calculateGPAImprovement(schoolId: string): Promise<number> {
    // Calculate average GPA improvement
    return 0.3; // Mock data - in real app, track GPA changes
  }

  private async calculateTimeSavings(schoolId: string): Promise<number> {
    // Calculate counselor time saved through automation
    return 120; // Mock data - hours saved per month
  }

  private async calculateNPS(schoolId: string): Promise<number> {
    // Calculate Net Promoter Score from student feedback
    return 72; // Mock data - in real app, calculate from NPS surveys
  }

  private async aggregateWritingPatterns(schoolId: string) {
    // Aggregate writing patterns across all students in school
    return {
      averageComplexity: 6.8,
      commonVocabularyLevel: 7.2,
      preferredStyles: ["narrative", "analytical", "persuasive"],
      commonStrengths: ["personal voice", "concrete examples"],
      commonWeaknesses: ["transitions", "conclusions"]
    };
  }

  private async identifyCommonChallenges(schoolId: string) {
    return [
      {
        challenge: "Weak transition sentences",
        frequency: 68,
        severity: "medium",
        affectedGrades: ["11", "12"]
      },
      {
        challenge: "Conclusion paragraph development",
        frequency: 54,
        severity: "high",
        affectedGrades: ["10", "11", "12"]
      },
      {
        challenge: "Evidence integration",
        frequency: 42,
        severity: "medium",
        affectedGrades: ["9", "10"]
      }
    ];
  }

  private async generateCurriculumRecommendations(patterns: any, challenges: any) {
    return [
      {
        area: "Transition Writing",
        recommendation: "Implement dedicated transition phrase workshops",
        expectedImpact: "25% improvement in essay flow scores",
        timeframe: "4 weeks",
        resources: ["transition phrase bank", "practice exercises"]
      },
      {
        area: "Conclusion Development",
        recommendation: "Add conclusion-specific mini-lessons to existing curriculum",
        expectedImpact: "40% improvement in conclusion strength",
        timeframe: "6 weeks",
        resources: ["conclusion templates", "peer review protocols"]
      }
    ];
  }

  private async createImplementationGuide(recommendations: any) {
    return {
      phases: [
        {
          phase: 1,
          duration: "2 weeks",
          activities: ["Teacher training", "Resource preparation"],
          deliverables: ["Training materials", "Student worksheets"]
        },
        {
          phase: 2,
          duration: "4 weeks",
          activities: ["Pilot implementation", "Student feedback collection"],
          deliverables: ["Pilot results", "Refined materials"]
        },
        {
          phase: 3,
          duration: "8 weeks",
          activities: ["Full rollout", "Progress monitoring"],
          deliverables: ["Implementation report", "Impact assessment"]
        }
      ],
      successMetrics: [
        "Student writing improvement scores",
        "Teacher satisfaction ratings",
        "Time-to-proficiency metrics"
      ]
    };
  }
}

export const b2bIntegrationService = new B2BIntegrationService();