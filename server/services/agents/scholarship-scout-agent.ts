import OpenAI from "openai";
import { storage } from "../../storage";
import type { AgentContext, AgentResponse, ScholarshipOpportunity } from "@shared/agent-types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class ScholarshipScoutAgent {
  async findPersonalizedScholarships(context: AgentContext): Promise<AgentResponse> {
    try {
      // Analyze student profile for scholarship matching
      const matchingCriteria = await this.buildMatchingProfile(context);
      
      // Search for relevant scholarships (in real app, this would query external APIs)
      const opportunities = await this.searchScholarships(matchingCriteria);
      
      // Score and rank opportunities
      const rankedOpportunities = await this.rankOpportunities(opportunities, context);
      
      // Generate application strategy
      const applicationStrategy = await this.generateApplicationStrategy(rankedOpportunities, context);
      
      return {
        success: true,
        data: {
          opportunities: rankedOpportunities,
          strategy: applicationStrategy,
          totalValue: rankedOpportunities.reduce((sum, opp) => sum + opp.amount, 0),
          applicationsRecommended: rankedOpportunities.filter(opp => opp.matchScore >= 70).length
        }
      };
    } catch (error) {
      console.error("Scholarship scout error:", error);
      return {
        success: false,
        error: "Failed to find personalized scholarships"
      };
    }
  }

  private async buildMatchingProfile(context: AgentContext) {
    const prompt = `
Build a comprehensive scholarship matching profile from this student data:

Academic Profile:
- GPA: ${context.persona.gpa}
- SAT: ${context.persona.satScore}
- ACT: ${context.persona.actScore}
- AP Courses: ${context.persona.apCourses?.join(', ')}
- Class Rank: ${context.persona.classRank}

Personal Profile:
- Intended Major: ${context.persona.intendedMajor}
- Career Goals: ${context.persona.careerGoals}
- Extracurriculars: ${context.persona.extracurriculars?.join(', ')}
- Volunteering: ${context.persona.volunteering?.join(', ')}

Financial Profile:
- Need-Based Aid: ${context.persona.needBasedAid}
- EFC: ${context.persona.expectedFamilyContribution}
- Household Income: ${context.persona.householdIncome}

Create a matching profile as JSON:
{
  "academicStrengths": ["strength1", "strength2"],
  "eligibilityKeywords": ["keyword1", "keyword2"],
  "demographicFactors": ["factor1", "factor2"],
  "uniqueQualifiers": ["qualifier1", "qualifier2"],
  "financialNeed": "high|medium|low|none",
  "geographicPreferences": ["location1", "location2"],
  "fieldOfStudy": "primary field",
  "leadershipExperience": "description",
  "communityInvolvement": "description"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  private async searchScholarships(matchingCriteria: any): Promise<ScholarshipOpportunity[]> {
    // In a real implementation, this would query multiple scholarship databases
    // For now, we'll generate realistic scholarship opportunities based on the profile
    
    const prompt = `
Generate 8-12 realistic scholarship opportunities based on this student profile:

Matching Criteria: ${JSON.stringify(matchingCriteria)}

Create diverse scholarship opportunities including:
- Merit-based scholarships
- Need-based awards
- Field-specific scholarships
- Community/local scholarships
- Unique/niche opportunities

Return as JSON array:
[{
  "id": "unique_id",
  "title": "Scholarship name",
  "provider": "Organization name",
  "amount": dollar_amount,
  "deadline": "2024-MM-DD",
  "requirements": ["requirement1", "requirement2"],
  "applicationUrl": "https://example.com/apply",
  "estimatedTimeToComplete": hours_needed,
  "competitiveness": "low|medium|high",
  "description": "Brief description",
  "eligibilityDetails": "Detailed eligibility requirements"
}]
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.scholarships || [];
  }

  private async rankOpportunities(opportunities: ScholarshipOpportunity[], context: AgentContext): Promise<ScholarshipOpportunity[]> {
    const prompt = `
Rank these scholarship opportunities for this specific student:

Student Profile:
- Major: ${context.persona.intendedMajor}
- GPA: ${context.persona.gpa}
- Activities: ${context.persona.extracurriculars?.join(', ')}
- Financial Need: ${context.persona.needBasedAid}

Scholarships: ${JSON.stringify(opportunities)}

For each scholarship, calculate a match score (0-100) based on:
1. Eligibility alignment
2. Competition level vs student strength
3. Application effort vs reward ratio
4. Deadline feasibility
5. Strategic value

Return JSON with match scores:
{
  "rankedScholarships": [
    {
      ...original_scholarship_data,
      "matchScore": 0-100,
      "matchReasons": ["reason1", "reason2"],
      "applicationPriority": "high|medium|low",
      "estimatedWinProbability": "percentage"
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    const rankedOpportunities = result.rankedScholarships || opportunities;
    
    // Sort by match score
    return rankedOpportunities.sort((a: any, b: any) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  private async generateApplicationStrategy(opportunities: ScholarshipOpportunity[], context: AgentContext) {
    const highPriorityOpps = opportunities.filter((opp: any) => opp.matchScore >= 70);
    
    const prompt = `
Create a strategic scholarship application plan:

High Priority Opportunities: ${JSON.stringify(highPriorityOpps)}
Student Time Capacity: Assume 10-15 hours per week for scholarship work
Current Essays: ${context.essays.length} essays already written

Generate a strategic plan:
{
  "timeline": [
    {
      "week": "Week 1",
      "tasks": ["task1", "task2"],
      "scholarships": ["scholarship1", "scholarship2"],
      "estimatedHours": 12
    }
  ],
  "essayReuse": [
    {
      "existingEssay": "essay title",
      "applicableScholarships": ["scholarship1", "scholarship2"],
      "adaptationNeeded": "minor|moderate|major"
    }
  ],
  "priorities": {
    "immediateAction": ["scholarship1", "scholarship2"],
    "nextMonth": ["scholarship3", "scholarship4"],
    "longTerm": ["scholarship5", "scholarship6"]
  },
  "estimatedTotalValue": dollar_amount,
  "timeInvestment": "total hours needed",
  "successProbability": "estimated percentage"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  async trackApplicationProgress(userId: string, scholarshipId: string, status: string): Promise<AgentResponse> {
    try {
      // Store application tracking data
      await storage.createActivity({
        userId,
        type: 'scholarship_application_update',
        description: `Scholarship application ${status}`,
        agentType: 'scholarship_scout',
        metadata: {
          scholarshipId,
          status,
          timestamp: new Date().toISOString()
        }
      });

      return {
        success: true,
        data: { tracked: true, status }
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to track application progress"
      };
    }
  }

  async generateApplicationReminders(context: AgentContext): Promise<AgentResponse> {
    try {
      // Get scholarship matches for user
      const matches = await storage.getScholarshipMatches(context.userId);
      const upcomingDeadlines = matches.filter(match => {
        const deadline = new Date(match.applicationDeadline || '');
        const now = new Date();
        const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntil > 0 && daysUntil <= 30; // Next 30 days
      });

      const reminders = upcomingDeadlines.map(match => ({
        id: match.id,
        title: `${match.scholarshipId} Application Due Soon`,
        description: `Application deadline in ${Math.ceil((new Date(match.applicationDeadline!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`,
        priority: match.matchScore! > 80 ? 'high' : 'medium',
        type: 'warning' as const,
        actionable: true,
        estimatedImpact: `Potential $${match.estimatedAward} scholarship opportunity`
      }));

      return {
        success: true,
        data: { reminders },
        suggestions: reminders
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to generate application reminders"
      };
    }
  }
}

export const scholarshipScoutAgent = new ScholarshipScoutAgent();