import OpenAI from "openai";
import { storage } from "../storage";
import type { StudentPersona, Scholarship, InsertScholarship, InsertScholarshipMatch } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ScholarshipCriteria {
  gpaMin?: number;
  gpaMax?: number;
  actMin?: number;
  satMin?: number;
  incomeMax?: number;
  demographics?: string[];
  majors?: string[];
  activities?: string[];
  states?: string[];
  essayRequired?: boolean;
  deadlineBefore?: Date;
  amountMin?: number;
  keywords?: string[];
}

export interface LiveScholarshipData {
  title: string;
  provider: string;
  amount: number;
  deadline: string;
  requirements: string[];
  description: string;
  applicationUrl: string;
  eligibilityDetails: {
    gpaRequirement?: number;
    testScoreRequirement?: string;
    majorRestrictions?: string[];
    demographicRequirements?: string[];
    activityRequirements?: string[];
    essayRequired: boolean;
    stateRestrictions?: string[];
    incomeRestrictions?: string;
  };
  tags: string[];
}

export class ScholarshipScout {
  private realScholarships: LiveScholarshipData[] = [
    {
      title: "Coca-Cola Scholars Program",
      provider: "The Coca-Cola Foundation",
      amount: 20000,
      deadline: "2024-10-31",
      requirements: ["3.0 GPA minimum", "Leadership experience", "Community service"],
      description: "Merit-based scholarship for high school seniors demonstrating leadership and academic excellence",
      applicationUrl: "https://www.coca-colascholarsfoundation.org/",
      eligibilityDetails: {
        gpaRequirement: 3.0,
        essayRequired: true,
        activityRequirements: ["leadership", "community service"]
      },
      tags: ["merit", "leadership", "national"]
    },
    {
      title: "Gates Scholarship",
      provider: "Gates Foundation",
      amount: 50000,
      deadline: "2024-09-15",
      requirements: ["Pell Grant eligible", "3.3 GPA minimum", "High academic achievement"],
      description: "Full scholarship for outstanding minority students with significant financial need",
      applicationUrl: "https://www.thegatesscholarship.org/",
      eligibilityDetails: {
        gpaRequirement: 3.3,
        demographicRequirements: ["minority"],
        incomeRestrictions: "Pell Grant eligible",
        essayRequired: true
      },
      tags: ["need-based", "minority", "full-ride"]
    },
    {
      title: "Dell Scholars Program",
      provider: "Dell Foundation",
      amount: 20000,
      deadline: "2024-12-01",
      requirements: ["2.4 GPA minimum", "Overcome significant obstacles", "College-bound"],
      description: "Scholarship for students who have overcome significant challenges to pursue higher education",
      applicationUrl: "https://www.dellscholars.org/",
      eligibilityDetails: {
        gpaRequirement: 2.4,
        essayRequired: true,
        activityRequirements: ["overcome obstacles"]
      },
      tags: ["resilience", "need-based", "mentorship"]
    },
    {
      title: "Jack Kent Cooke Foundation College Scholarship",
      provider: "Jack Kent Cooke Foundation",
      amount: 40000,
      deadline: "2024-11-15",
      requirements: ["3.5 GPA minimum", "High academic achievement", "Financial need"],
      description: "Scholarship for high-achieving students with financial need",
      applicationUrl: "https://www.jkcf.org/",
      eligibilityDetails: {
        gpaRequirement: 3.5,
        incomeRestrictions: "Financial need required",
        essayRequired: true
      },
      tags: ["merit", "need-based", "high-achieving"]
    },
    {
      title: "STEM Scholarship by Society of Women Engineers",
      provider: "Society of Women Engineers",
      amount: 15000,
      deadline: "2024-12-15",
      requirements: ["Female", "STEM major", "2.5 GPA minimum"],
      description: "Scholarship for women pursuing degrees in science, technology, engineering, or mathematics",
      applicationUrl: "https://swe.org/scholarships/",
      eligibilityDetails: {
        gpaRequirement: 2.5,
        demographicRequirements: ["female"],
        majorRestrictions: ["engineering", "computer science", "mathematics", "physics", "chemistry", "biology"],
        essayRequired: true
      },
      tags: ["STEM", "women", "engineering"]
    },
    {
      title: "Hispanic Scholarship Fund",
      provider: "Hispanic Scholarship Fund",
      amount: 10000,
      deadline: "2024-03-30",
      requirements: ["Hispanic heritage", "2.5 GPA minimum", "Enrolled in college"],
      description: "Scholarship for students of Hispanic heritage pursuing higher education",
      applicationUrl: "https://www.hsf.net/",
      eligibilityDetails: {
        gpaRequirement: 2.5,
        demographicRequirements: ["hispanic"],
        essayRequired: true
      },
      tags: ["hispanic", "cultural", "diversity"]
    },
    {
      title: "National Merit Scholarship",
      provider: "National Merit Scholarship Corporation",
      amount: 25000,
      deadline: "2024-10-15",
      requirements: ["PSAT/NMSQT score", "High academic achievement", "SAT confirmation"],
      description: "Merit scholarship based on PSAT/NMSQT performance and academic excellence",
      applicationUrl: "https://www.nationalmerit.org/",
      eligibilityDetails: {
        testScoreRequirement: "PSAT/NMSQT Semifinalist",
        essayRequired: true
      },
      tags: ["merit", "PSAT", "national", "academic-excellence"]
    },
    {
      title: "AXA Achievement Scholarship",
      provider: "AXA Foundation",
      amount: 25000,
      deadline: "2024-12-15",
      requirements: ["Demonstrate achievement", "Ambition", "Drive"],
      description: "Scholarship recognizing students who demonstrate achievement, ambition, and drive",
      applicationUrl: "https://www.axa-achievement.com/",
      eligibilityDetails: {
        essayRequired: true,
        activityRequirements: ["achievement", "leadership"]
      },
      tags: ["achievement", "ambition", "leadership"]
    }
  ];

  async findMatches(userId: string): Promise<any[]> {
    const persona = await storage.getStudentPersona(userId);
    if (!persona) {
      throw new Error("Student persona not found");
    }

    const criteria = this.buildCriteriaFromPersona(persona);
    const matches = await this.matchScholarships(criteria, persona);
    
    // Store matches in database
    for (const match of matches) {
      await this.storeScholarshipMatch(userId, match);
    }

    return matches;
  }

  private buildCriteriaFromPersona(persona: StudentPersona): ScholarshipCriteria {
    return {
      gpaMin: persona.gpa ? persona.gpa - 0.5 : undefined,
      gpaMax: 4.0,
      actMin: persona.actScore ? persona.actScore - 3 : undefined,
      satMin: persona.satScore ? persona.satScore - 50 : undefined,
      incomeMax: this.parseIncomeRange(persona.householdIncome),
      demographics: this.extractDemographics(persona),
      majors: persona.intendedMajors || [],
      activities: this.extractActivities(persona),
      states: persona.state ? [persona.state] : undefined,
      deadlineBefore: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Next year
      amountMin: 1000
    };
  }

  private parseIncomeRange(incomeRange?: string): number | undefined {
    if (!incomeRange) return undefined;
    
    const ranges: Record<string, number> = {
      "under_25k": 25000,
      "25k_50k": 50000,
      "50k_75k": 75000,
      "75k_100k": 100000,
      "100k_150k": 150000,
      "over_150k": 999999
    };
    
    return ranges[incomeRange];
  }

  private extractDemographics(persona: StudentPersona): string[] {
    const demographics: string[] = [];
    
    if (persona.ethnicity) {
      const ethnicityMap: Record<string, string> = {
        "hispanic": "hispanic",
        "african_american": "african american",
        "asian": "asian",
        "native_american": "native american",
        "pacific_islander": "pacific islander"
      };
      const mapped = ethnicityMap[persona.ethnicity];
      if (mapped) demographics.push(mapped);
    }
    
    if (persona.gender === "female") {
      demographics.push("female");
    }
    
    return demographics;
  }

  private extractActivities(persona: StudentPersona): string[] {
    const activities: string[] = [];
    
    if (persona.extracurricularActivities) {
      // Parse common activities from the text
      const activityText = persona.extracurricularActivities.toLowerCase();
      
      if (activityText.includes("leader") || activityText.includes("president") || activityText.includes("captain")) {
        activities.push("leadership");
      }
      if (activityText.includes("volunteer") || activityText.includes("community service")) {
        activities.push("community service");
      }
      if (activityText.includes("sport") || activityText.includes("athletic")) {
        activities.push("athletics");
      }
      if (activityText.includes("music") || activityText.includes("band") || activityText.includes("orchestra")) {
        activities.push("music");
      }
      if (activityText.includes("art") || activityText.includes("theater") || activityText.includes("drama")) {
        activities.push("arts");
      }
    }
    
    return activities;
  }

  private async matchScholarships(criteria: ScholarshipCriteria, persona: StudentPersona): Promise<any[]> {
    const eligibleScholarships = this.realScholarships.filter(scholarship => 
      this.isEligible(scholarship, criteria, persona)
    );

    // Use AI to rank and analyze matches
    const rankedMatches = await this.rankMatches(eligibleScholarships, persona);
    
    return rankedMatches.map(match => ({
      id: Math.random().toString(36),
      title: match.scholarship.title,
      provider: match.scholarship.provider,
      amount: match.scholarship.amount,
      deadline: new Date(match.scholarship.deadline),
      requirements: match.scholarship.requirements,
      applicationUrl: match.scholarship.applicationUrl,
      matchScore: match.score,
      matchReasons: match.reasons,
      competitiveness: match.competitiveness,
      estimatedTimeToComplete: match.estimatedTime,
      aiRecommendation: match.recommendation
    }));
  }

  private isEligible(scholarship: LiveScholarshipData, criteria: ScholarshipCriteria, persona: StudentPersona): boolean {
    const eligibility = scholarship.eligibilityDetails;
    
    // GPA check
    if (eligibility.gpaRequirement && persona.gpa && persona.gpa < eligibility.gpaRequirement) {
      return false;
    }
    
    // Test score check
    if (eligibility.testScoreRequirement) {
      if (eligibility.testScoreRequirement.includes("SAT") && (!persona.satScore || persona.satScore < 1200)) {
        return false;
      }
      if (eligibility.testScoreRequirement.includes("ACT") && (!persona.actScore || persona.actScore < 25)) {
        return false;
      }
    }
    
    // Demographics check
    if (eligibility.demographicRequirements) {
      const personaDemographics = this.extractDemographics(persona);
      const hasRequiredDemo = eligibility.demographicRequirements.some(req => 
        personaDemographics.some(demo => demo.toLowerCase().includes(req.toLowerCase()))
      );
      if (!hasRequiredDemo) return false;
    }
    
    // Major check
    if (eligibility.majorRestrictions && persona.intendedMajors) {
      const hasMatchingMajor = eligibility.majorRestrictions.some(major =>
        persona.intendedMajors?.some(personaMajor => 
          personaMajor.toLowerCase().includes(major.toLowerCase()) ||
          major.toLowerCase().includes(personaMajor.toLowerCase())
        )
      );
      if (!hasMatchingMajor) return false;
    }
    
    // Income check (simplified)
    if (eligibility.incomeRestrictions && eligibility.incomeRestrictions.includes("Pell Grant")) {
      const maxIncome = this.parseIncomeRange(persona.householdIncome);
      if (!maxIncome || maxIncome > 60000) return false; // Rough Pell Grant threshold
    }
    
    return true;
  }

  private async rankMatches(scholarships: LiveScholarshipData[], persona: StudentPersona): Promise<any[]> {
    if (scholarships.length === 0) return [];

    try {
      const personaText = this.createPersonaText(persona);
      const scholarshipTexts = scholarships.map(s => `${s.title} by ${s.provider}: $${s.amount} - ${s.description}`).join('\n');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a scholarship matching expert. Rank these scholarships for the student based on their profile and provide detailed analysis.

For each scholarship, provide:
- Match score (0-100)
- Match reasons (why it's a good fit)
- Competitiveness level (low/medium/high)
- Estimated time to complete application (hours)
- Personalized recommendation

Respond with JSON in this format:
{
  "matches": [
    {
      "scholarshipTitle": "Title",
      "score": 85,
      "reasons": ["Strong GPA match", "Relevant major"],
      "competitiveness": "medium",
      "estimatedTime": 4,
      "recommendation": "Strong match - your leadership experience aligns perfectly with their values"
    }
  ]
}`
          },
          {
            role: "user",
            content: `Student Profile:\n${personaText}\n\nScholarships:\n${scholarshipTexts}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      return scholarships.map(scholarship => {
        const match = analysis.matches?.find((m: any) => 
          m.scholarshipTitle.includes(scholarship.title.split(' ')[0])
        ) || {
          score: 50,
          reasons: ["General eligibility match"],
          competitiveness: "medium",
          estimatedTime: 3,
          recommendation: "Review requirements carefully"
        };
        
        return {
          scholarship,
          score: match.score,
          reasons: match.reasons,
          competitiveness: match.competitiveness,
          estimatedTime: match.estimatedTime,
          recommendation: match.recommendation
        };
      }).sort((a, b) => b.score - a.score);
      
    } catch (error) {
      console.error("Error ranking scholarships:", error);
      // Fallback to simple scoring
      return scholarships.map(scholarship => ({
        scholarship,
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        reasons: ["Meets basic eligibility requirements"],
        competitiveness: "medium",
        estimatedTime: 3,
        recommendation: "Review this opportunity carefully"
      })).sort((a, b) => b.score - a.score);
    }
  }

  private createPersonaText(persona: StudentPersona): string {
    return `
Student Profile:
- GPA: ${persona.gpa || 'Not provided'}
- SAT: ${persona.satScore || 'Not provided'}
- ACT: ${persona.actScore || 'Not provided'}
- Intended Majors: ${persona.intendedMajors?.join(', ') || 'Not specified'}
- Activities: ${persona.extracurricularActivities || 'Not specified'}
- State: ${persona.state || 'Not specified'}
- Ethnicity: ${persona.ethnicity || 'Not specified'}
- Gender: ${persona.gender || 'Not specified'}
- Income Range: ${persona.householdIncome || 'Not specified'}
- Career Goals: ${persona.careerGoals || 'Not specified'}
    `.trim();
  }

  private async storeScholarshipMatch(userId: string, match: any): Promise<void> {
    try {
      // First ensure the scholarship exists in our database
      let scholarship = await storage.getScholarships().then(scholarships => 
        scholarships.find(s => s.title === match.title)
      );
      
      if (!scholarship) {
        // Create the scholarship record
        const scholarshipData: InsertScholarship = {
          title: match.title,
          provider: match.provider,
          amount: match.amount,
          deadline: match.deadline,
          requirements: match.requirements,
          description: match.title, // Using title as description for now
          applicationUrl: match.applicationUrl,
          tags: ["curated"]
        };
        
        scholarship = await storage.createScholarship(scholarshipData);
      }
      
      // Create the match record
      const matchData: InsertScholarshipMatch = {
        userId,
        scholarshipId: scholarship.id,
        matchScore: match.matchScore,
        status: "discovered",
        notes: match.aiRecommendation
      };
      
      await storage.createScholarshipMatch(matchData);
      
    } catch (error) {
      console.error("Error storing scholarship match:", error);
      // Don't throw - we don't want matching to fail if storage fails
    }
  }

  async getStoredMatches(userId: string): Promise<any[]> {
    try {
      const matches = await storage.getScholarshipMatches(userId);
      return matches.map(match => ({
        id: match.id,
        title: match.scholarship?.title || "Unknown Scholarship",
        provider: match.scholarship?.provider || "Unknown Provider",
        amount: match.scholarship?.amount || 0,
        deadline: match.scholarship?.deadline,
        requirements: match.scholarship?.requirements || [],
        applicationUrl: match.scholarship?.applicationUrl || "#",
        matchScore: match.matchScore,
        status: match.status,
        notes: match.notes
      }));
    } catch (error) {
      console.error("Error fetching stored matches:", error);
      return [];
    }
  }
}

export const scholarshipScout = new ScholarshipScout();