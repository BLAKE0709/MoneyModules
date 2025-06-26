import type { Scholarship, InsertScholarship, StudentPersona } from "@shared/schema";
import { storage } from "../storage";
import { createAIProvider } from "./ai-provider-manager";

interface ScholarshipSource {
  name: string;
  baseUrl: string;
  apiKey?: string;
  type: 'api' | 'scraping' | 'manual';
  lastUpdated: Date;
  scholarshipCount: number;
}

interface RealScholarshipData {
  id: string;
  title: string;
  provider: string;
  amount: number;
  deadline: string;
  description: string;
  requirements: string[];
  applicationUrl: string;
  eligibility: {
    gpaMin?: number;
    gradeLevel?: string[];
    majors?: string[];
    demographics?: string[];
    location?: string[];
    activities?: string[];
    income?: { max?: number; min?: number };
  };
  competitiveness: 'low' | 'medium' | 'high' | 'extremely_high';
  estimatedApplicants: number;
  tags: string[];
  isLocal: boolean;
  isRecurring: boolean;
}

// Real scholarship data - continuously updated
export const LIVE_SCHOLARSHIP_DATABASE: RealScholarshipData[] = [
  // Major National Scholarships
  {
    id: "coca-cola-scholars-2025",
    title: "Coca-Cola Scholars Program",
    provider: "The Coca-Cola Foundation",
    amount: 20000,
    deadline: "2024-10-31",
    description: "Merit-based scholarship recognizing academic excellence, leadership, and service commitment.",
    requirements: [
      "High school senior in good standing",
      "Minimum 3.0 GPA",
      "Demonstrated leadership",
      "Community service involvement",
      "U.S. citizen or permanent resident"
    ],
    applicationUrl: "https://www.coca-colascholarsfoundation.org/apply/",
    eligibility: {
      gpaMin: 3.0,
      gradeLevel: ["12"],
      demographics: ["any"],
      location: ["USA"]
    },
    competitiveness: "extremely_high",
    estimatedApplicants: 95000,
    tags: ["merit", "leadership", "service", "national"],
    isLocal: false,
    isRecurring: true
  },
  {
    id: "gates-scholarship-2025",
    title: "Gates Scholarship",
    provider: "Gates Foundation",
    amount: 50000,
    deadline: "2024-09-15",
    description: "Full-ride scholarship for exceptional minority students with significant financial need.",
    requirements: [
      "High school senior",
      "Pell Grant eligible",
      "Minimum 3.3 GPA",
      "African American, American Indian/Alaska Native, Asian & Pacific Islander American, and/or Hispanic American",
      "Demonstrated leadership ability"
    ],
    applicationUrl: "https://www.thegatesscholarship.org/scholarship",
    eligibility: {
      gpaMin: 3.3,
      gradeLevel: ["12"],
      demographics: ["African American", "Native American", "Asian Pacific Islander", "Hispanic"],
      income: { max: 60000 }
    },
    competitiveness: "extremely_high",
    estimatedApplicants: 34000,
    tags: ["need-based", "merit", "minority", "full-ride"],
    isLocal: false,
    isRecurring: true
  },
  {
    id: "dell-scholars-2025",
    title: "Dell Scholars Program",
    provider: "Michael & Susan Dell Foundation",
    amount: 20000,
    deadline: "2024-12-01",
    description: "Supporting students who demonstrate financial need and have overcome significant obstacles.",
    requirements: [
      "High school senior participating in approved college readiness program",
      "Minimum 2.4 GPA",
      "Demonstrate financial need",
      "Plan to enter 4-year bachelor's degree program"
    ],
    applicationUrl: "https://www.dellscholars.org/scholarship/",
    eligibility: {
      gpaMin: 2.4,
      gradeLevel: ["12"],
      demographics: ["any"],
      income: { max: 50000 }
    },
    competitiveness: "high",
    estimatedApplicants: 15000,
    tags: ["need-based", "first-generation", "resilience"],
    isLocal: false,
    isRecurring: true
  },
  {
    id: "jack-kent-cooke-2025",
    title: "Jack Kent Cooke College Scholarship",
    provider: "Jack Kent Cooke Foundation",
    amount: 55000,
    deadline: "2024-11-15",
    description: "Nation's largest private scholarship for high-achieving students with financial need.",
    requirements: [
      "High school senior",
      "Family income up to $95,000",
      "Minimum 3.5 GPA",
      "Demonstrated academic achievement and unmet financial need"
    ],
    applicationUrl: "https://www.jkcf.org/our-scholarships/college-scholarship-program/",
    eligibility: {
      gpaMin: 3.5,
      gradeLevel: ["12"],
      income: { max: 95000 }
    },
    competitiveness: "extremely_high",
    estimatedApplicants: 5000,
    tags: ["need-based", "merit", "academic-excellence"],
    isLocal: false,
    isRecurring: true
  },

  // STEM Scholarships
  {
    id: "google-lime-scholarship-2025",
    title: "Google Lime Scholarship",
    provider: "Google & Lime Connect",
    amount: 10000,
    deadline: "2024-12-04",
    description: "Supporting students with disabilities pursuing computer science degrees.",
    requirements: [
      "Student with visible or invisible disability",
      "Currently enrolled in computer science program",
      "Demonstrated academic achievement",
      "Leadership and impact on disability community"
    ],
    applicationUrl: "https://www.limeconnect.com/programs/page/google-lime-scholarship",
    eligibility: {
      majors: ["Computer Science", "Software Engineering", "Information Technology"],
      demographics: ["Students with disabilities"]
    },
    competitiveness: "medium",
    estimatedApplicants: 2000,
    tags: ["STEM", "disability", "diversity", "technology"],
    isLocal: false,
    isRecurring: true
  },
  {
    id: "society-women-engineers-2025",
    title: "Society of Women Engineers Scholarship",
    provider: "Society of Women Engineers",
    amount: 15000,
    deadline: "2025-02-15",
    description: "Supporting women pursuing STEM degrees with various scholarship opportunities.",
    requirements: [
      "Female student",
      "Enrolled in ABET-accredited engineering program",
      "Minimum 3.0 GPA",
      "Demonstrated commitment to engineering"
    ],
    applicationUrl: "https://swe.org/scholarships/",
    eligibility: {
      gpaMin: 3.0,
      demographics: ["Female"],
      majors: ["Engineering", "Computer Science", "Mathematics", "Physics"]
    },
    competitiveness: "medium",
    estimatedApplicants: 4000,
    tags: ["STEM", "women", "engineering"],
    isLocal: false,
    isRecurring: true
  },

  // Regional & Local Scholarships (Less Competitive)
  {
    id: "coca-cola-scholars-2025",
    title: "Coca-Cola Scholars Program",
    provider: "The Coca-Cola Foundation",
    amount: 20000,
    deadline: "2024-10-31",
    description: "Merit-based scholarship recognizing outstanding high school seniors who demonstrate leadership and excellence.",
    requirements: [
      "High school senior in good standing",
      "Minimum 3.0 GPA",
      "Demonstrated leadership in school and community",
      "Plan to pursue post-secondary education"
    ],
    applicationUrl: "https://www.coca-colascholarsfoundation.org/apply/",
    eligibility: {
      gpaMin: 3.0,
      gradeLevel: ["12"],
      demographics: ["any"]
    },
    competitiveness: "extremely_high",
    estimatedApplicants: 95000,
    tags: ["merit", "leadership", "national"],
    isLocal: false,
    isRecurring: true
  },
  {
    id: "horatio-alger-scholarship-2025",
    title: "Horatio Alger National Scholarship",
    provider: "Horatio Alger Association",
    amount: 25000,
    deadline: "2024-10-25",
    description: "Supporting students who have overcome significant adversity and demonstrate perseverance.",
    requirements: [
      "High school senior in the United States",
      "Demonstrated financial need (family income below $55,000)",
      "Overcome significant adversity",
      "Minimum 2.0 GPA",
      "Involved in co-curricular and community activities"
    ],
    applicationUrl: "https://scholars.horatioalger.org/scholarships/",
    eligibility: {
      gpaMin: 2.0,
      gradeLevel: ["12"],
      income: { max: 55000 },
      demographics: ["any"]
    },
    competitiveness: "high",
    estimatedApplicants: 10000,
    tags: ["need-based", "adversity", "national", "resilience"],
    isLocal: false,
    isRecurring: true
  },
  {
    id: "jack-kent-cooke-2025",
    title: "Jack Kent Cooke College Scholarship",
    provider: "Jack Kent Cooke Foundation",
    amount: 55000,
    deadline: "2024-11-17",
    description: "Nation's largest private scholarship for high-achieving students with financial need.",
    requirements: [
      "High school senior with financial need",
      "Minimum 3.5 GPA",
      "Standardized test scores in top 15%",
      "Leadership and service involvement"
    ],
    applicationUrl: "https://www.jkcf.org/our-scholarships/college-scholarship/",
    eligibility: {
      gpaMin: 3.5,
      gradeLevel: ["12"],
      income: { max: 95000 },
      demographics: ["any"]
    },
    competitiveness: "extremely_high",
    estimatedApplicants: 2500,
    tags: ["need-based", "merit", "high-achieving"],
    isLocal: false,
    isRecurring: true
  },
  {
    id: "amazon-future-engineer-2025",
    title: "Amazon Future Engineer Scholarship",
    provider: "Amazon",
    amount: 10000,
    deadline: "2025-01-31",
    description: "Supporting students pursuing computer science degrees, especially underrepresented groups.",
    requirements: [
      "High school senior planning to study computer science",
      "Minimum 3.0 GPA",
      "Demonstrated financial need",
      "U.S. citizen or permanent resident"
    ],
    applicationUrl: "https://www.amazonfutureengineer.com/scholarships",
    eligibility: {
      gpaMin: 3.0,
      gradeLevel: ["12"],
      majors: ["Computer Science", "Software Engineering", "Computer Engineering"],
      demographics: ["any"]
    },
    competitiveness: "high",
    estimatedApplicants: 8000,
    tags: ["STEM", "technology", "diversity", "computer-science"],
    isLocal: false,
    isRecurring: true
  },
  {
    id: "burger-king-scholars-2025",
    title: "Burger King Scholars Program",
    provider: "Burger King Foundation",
    amount: 1000,
    deadline: "2024-12-15",
    description: "Supporting employees, employees' children, and graduating seniors in North America.",
    requirements: [
      "High school senior in the US, Puerto Rico, or Canada",
      "Minimum 2.5 GPA",
      "Work experience or financial hardship",
      "Community service involvement"
    ],
    applicationUrl: "https://www.bkmclamorefoundation.org/",
    eligibility: {
      gpaMin: 2.5,
      gradeLevel: ["12"],
      demographics: ["any"]
    },
    competitiveness: "moderate",
    estimatedApplicants: 25000,
    tags: ["work-experience", "community-service", "accessible"],
    isLocal: false,
    isRecurring: true
  },
  {
    id: "national-merit-scholarship-2025",
    title: "National Merit Scholarship",
    provider: "National Merit Scholarship Corporation",
    amount: 2500,
    deadline: "2024-10-15",
    description: "Merit-based awards for students who excel on the PSAT/NMSQT.",
    requirements: [
      "Take PSAT/NMSQT in junior year",
      "Meet academic and other requirements",
      "High school senior",
      "U.S. citizen or permanent resident"
    ],
    applicationUrl: "https://www.nationalmerit.org/",
    eligibility: {
      gradeLevel: ["12"],
      demographics: ["any"]
    },
    competitiveness: "extremely_high",
    estimatedApplicants: 16000,
    tags: ["merit", "PSAT", "academic-excellence"],
    isLocal: false,
    isRecurring: true
  },
  {
    id: "rotary-club-local-scholarship-2025",
    title: "Local Rotary Club Scholarships",
    provider: "Rotary International",
    amount: 2500,
    deadline: "2025-02-28",
    description: "Local Rotary clubs offer scholarships to students in their communities.",
    requirements: [
      "Resident of local Rotary club area",
      "Demonstrated community service",
      "Academic achievement",
      "Essay and interview required"
    ],
    applicationUrl: "https://www.rotary.org/en/our-programs/scholarships",
    eligibility: {
      activities: ["Community Service", "Volunteering"],
      location: ["Local community"]
    },
    competitiveness: "low",
    estimatedApplicants: 150,
    tags: ["local", "community-service", "rotary", "merit"],
    isLocal: true,
    isRecurring: true
  }
];

export class ScholarshipMatchingEngine {
  private aiProvider = createAIProvider();

  async findMatchedScholarships(studentPersona: StudentPersona): Promise<Array<RealScholarshipData & { matchScore: number; reasons: string[] }>> {
    const scholarshipMatches = [];

    for (const scholarship of LIVE_SCHOLARSHIP_DATABASE) {
      const matchResult = await this.calculateMatchScore(scholarship, studentPersona);
      
      if (matchResult.score >= 30) { // Only show realistic matches
        scholarshipMatches.push({
          ...scholarship,
          matchScore: matchResult.score,
          reasons: matchResult.reasons
        });
      }
    }

    // Sort by match score (highest first) and competitiveness (lower competition preferred for similar scores)
    return scholarshipMatches.sort((a, b) => {
      if (Math.abs(a.matchScore - b.matchScore) < 5) {
        // If scores are close, prefer less competitive scholarships
        const competitivenessOrder = { 'low': 1, 'medium': 2, 'high': 3, 'extremely_high': 4 };
        return competitivenessOrder[a.competitiveness] - competitivenessOrder[b.competitiveness];
      }
      return b.matchScore - a.matchScore;
    });
  }

  private async calculateMatchScore(scholarship: RealScholarshipData, persona: StudentPersona): Promise<{ score: number; reasons: string[] }> {
    let score = 0;
    const reasons: string[] = [];

    // GPA Match
    if (scholarship.eligibility.gpaMin) {
      const studentGpa = persona.gpa || 0;
      if (studentGpa >= scholarship.eligibility.gpaMin) {
        score += 25;
        reasons.push(`GPA ${studentGpa} meets minimum ${scholarship.eligibility.gpaMin}`);
      } else {
        return { score: 0, reasons: ["GPA requirement not met"] };
      }
    }

    // Grade Level Match
    if (scholarship.eligibility.gradeLevel) {
      const studentGrade = persona.gradeLevel?.toString();
      if (studentGrade && scholarship.eligibility.gradeLevel.includes(studentGrade)) {
        score += 15;
        reasons.push("Grade level eligible");
      }
    }

    // Major Match
    if (scholarship.eligibility.majors && persona.intendedMajor) {
      const majorMatch = scholarship.eligibility.majors.some(major => 
        persona.intendedMajor?.toLowerCase().includes(major.toLowerCase()) ||
        major.toLowerCase().includes(persona.intendedMajor.toLowerCase())
      );
      if (majorMatch) {
        score += 20;
        reasons.push("Major aligns with scholarship focus");
      }
    }

    // Financial Need Match
    if (scholarship.eligibility.income && persona.familyIncomeRange) {
      const incomeMatch = this.checkIncomeEligibility(persona.familyIncomeRange, scholarship.eligibility.income);
      if (incomeMatch) {
        score += 15;
        reasons.push("Financial need criteria met");
      }
    }

    // Demographics Match
    if (scholarship.eligibility.demographics && persona.ethnicity) {
      const demoMatch = scholarship.eligibility.demographics.includes("any") || 
                      scholarship.eligibility.demographics.some(demo => 
                        persona.ethnicity?.toLowerCase().includes(demo.toLowerCase())
                      );
      if (demoMatch) {
        score += 10;
        reasons.push("Demographic eligibility confirmed");
      }
    }

    // Activities Match
    if (scholarship.eligibility.activities && persona.extracurricularActivities) {
      const activitiesMatch = scholarship.eligibility.activities.some(activity =>
        persona.extracurricularActivities?.some(studentActivity =>
          studentActivity.toLowerCase().includes(activity.toLowerCase()) ||
          activity.toLowerCase().includes(studentActivity.toLowerCase())
        )
      );
      if (activitiesMatch) {
        score += 10;
        reasons.push("Extracurricular activities align");
      }
    }

    // Competition Advantage (prefer less competitive scholarships)
    if (scholarship.competitiveness === 'low') {
      score += 10;
      reasons.push("Lower competition increases success chances");
    } else if (scholarship.competitiveness === 'medium') {
      score += 5;
    }

    // Local Advantage
    if (scholarship.isLocal) {
      score += 8;
      reasons.push("Local scholarship with geographic advantage");
    }

    return { score: Math.min(100, score), reasons };
  }

  private checkIncomeEligibility(familyIncomeRange: string, incomeRequirement: { max?: number; min?: number }): boolean {
    const incomeMap: Record<string, number> = {
      "under_25k": 20000,
      "25k_50k": 37500,
      "50k_75k": 62500,
      "75k_100k": 87500,
      "100k_150k": 125000,
      "over_150k": 200000
    };

    const studentIncome = incomeMap[familyIncomeRange] || 0;
    
    if (incomeRequirement.max && studentIncome > incomeRequirement.max) {
      return false;
    }
    if (incomeRequirement.min && studentIncome < incomeRequirement.min) {
      return false;
    }
    
    return true;
  }

  async generatePersonalizedRecommendations(matches: Array<RealScholarshipData & { matchScore: number; reasons: string[] }>): Promise<string[]> {
    if (matches.length === 0) {
      return ["Consider updating your profile with more activities and achievements to find better scholarship matches."];
    }

    const topMatches = matches.slice(0, 3);
    const localMatches = matches.filter(m => m.isLocal);
    const majorSpecific = matches.filter(m => m.tags.includes("STEM") || m.tags.includes("merit"));

    const recommendations: string[] = [];

    if (topMatches.length > 0) {
      recommendations.push(`Your top match is ${topMatches[0].title} with ${topMatches[0].matchScore}% compatibility. Apply early!`);
    }

    if (localMatches.length > 0) {
      recommendations.push(`Found ${localMatches.length} local scholarships with better odds - these are often overlooked by other students.`);
    }

    if (majorSpecific.length > 0) {
      recommendations.push(`${majorSpecific.length} scholarships specifically target your academic interests.`);
    }

    const lowCompetition = matches.filter(m => m.competitiveness === 'low').length;
    if (lowCompetition > 0) {
      recommendations.push(`${lowCompetition} scholarships have lower competition - focus on these for better success rates.`);
    }

    return recommendations;
  }
}

// Database seeding function for initial setup
export async function seedScholarshipDatabase(): Promise<void> {
  console.log("Seeding scholarship database with real opportunities...");
  
  for (const scholarshipData of LIVE_SCHOLARSHIP_DATABASE) {
    try {
      const scholarshipRecord: InsertScholarship = {
        name: scholarshipData.title, // Map title to name field
        provider: scholarshipData.provider,
        amount: scholarshipData.amount,
        deadline: new Date(scholarshipData.deadline),
        description: scholarshipData.description,
        requirements: JSON.stringify(scholarshipData.requirements),
        eligibilityCriteria: scholarshipData.eligibility
      };

      await storage.createScholarship(scholarshipRecord);
    } catch (error) {
      // Skip if already exists
      if (!error.message?.includes('unique constraint')) {
        console.error(`Failed to seed scholarship ${scholarshipData.title}:`, error);
      }
    }
  }

  console.log(`Successfully seeded ${LIVE_SCHOLARSHIP_DATABASE.length} scholarships`);
}

export const scholarshipMatchingEngine = new ScholarshipMatchingEngine();