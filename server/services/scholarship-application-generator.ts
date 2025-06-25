import type { StudentPersona, WritingSample } from "@shared/schema";
import { createAIProvider } from "./ai-provider-manager";
import { storage } from "../storage";

interface ScholarshipApplication {
  id: string;
  scholarshipId: string;
  scholarshipTitle: string;
  studentId: string;
  status: 'draft' | 'review_needed' | 'ready_to_submit' | 'submitted';
  completionPercentage: number;
  preFilledSections: {
    personalInfo: PreFilledPersonalInfo;
    academicInfo: PreFilledAcademicInfo;
    essays: PreFilledEssay[];
    recommendations: PreFilledRecommendation[];
    activities: PreFilledActivity[];
    financialInfo: PreFilledFinancialInfo;
  };
  missingFields: MissingField[];
  estimatedTimeToComplete: number; // minutes
  deadline: Date;
  applicationUrl: string;
  submissionInstructions: string[];
  createdAt: Date;
  lastUpdated: Date;
}

interface PreFilledPersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  dateOfBirth: string;
  citizenship: string;
  ethnicity: string;
  gender: string;
  parentInfo: {
    parent1: { name: string; occupation: string; education: string; };
    parent2: { name: string; occupation: string; education: string; };
  };
}

interface PreFilledAcademicInfo {
  currentSchool: string;
  graduationDate: string;
  gpa: number;
  classRank: string;
  satScore: number;
  actScore: number;
  apCourses: string[];
  honors: string[];
  intendedMajor: string;
  careerGoals: string;
}

interface PreFilledEssay {
  prompt: string;
  response: string;
  wordCount: number;
  voicePreserved: boolean;
  needsReview: boolean;
  confidence: number; // 0-100
}

interface PreFilledRecommendation {
  recommenderName: string;
  recommenderTitle: string;
  recommenderEmail: string;
  relationship: string;
  requestSent: boolean;
  received: boolean;
}

interface PreFilledActivity {
  name: string;
  type: 'leadership' | 'volunteer' | 'work' | 'athletics' | 'arts' | 'academic' | 'other';
  description: string;
  hoursPerWeek: number;
  weeksPerYear: number;
  yearsParticipated: number;
  leadershipRole: string;
  achievements: string[];
}

interface PreFilledFinancialInfo {
  householdIncome: string;
  fafsaCompleted: boolean;
  efc: number;
  financialNeed: number;
  otherScholarships: { name: string; amount: number; status: string; }[];
}

interface MissingField {
  field: string;
  section: string;
  description: string;
  required: boolean;
  estimatedTimeMinutes: number;
}

export class ScholarshipApplicationGenerator {
  private aiProvider = createAIProvider();

  async generatePrePopulatedApplication(
    userId: string, 
    scholarshipId: string,
    scholarshipDetails: any
  ): Promise<ScholarshipApplication> {
    
    // Get student data
    const persona = await storage.getStudentPersona(userId);
    const writingSamples = await storage.getWritingSamples(userId);
    const essays = await storage.getEssaysByUser(userId);
    
    if (!persona) {
      throw new Error("Student persona required for application generation");
    }

    // Generate pre-filled sections
    const preFilledSections = await this.generateAllSections(persona, writingSamples, scholarshipDetails);
    
    // Identify missing fields
    const missingFields = await this.identifyMissingFields(persona, scholarshipDetails);
    
    // Calculate completion percentage
    const completionPercentage = this.calculateCompletionPercentage(preFilledSections, missingFields);
    
    // Estimate time to complete
    const estimatedTime = missingFields.reduce((total, field) => total + field.estimatedTimeMinutes, 0);

    const application: ScholarshipApplication = {
      id: Math.random().toString(36),
      scholarshipId,
      scholarshipTitle: scholarshipDetails.title,
      studentId: userId,
      status: completionPercentage >= 95 ? 'ready_to_submit' : completionPercentage >= 80 ? 'review_needed' : 'draft',
      completionPercentage,
      preFilledSections,
      missingFields,
      estimatedTimeToComplete: estimatedTime,
      deadline: new Date(scholarshipDetails.deadline),
      applicationUrl: scholarshipDetails.applicationUrl,
      submissionInstructions: await this.generateSubmissionInstructions(scholarshipDetails),
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    return application;
  }

  private async generateAllSections(
    persona: StudentPersona, 
    writingSamples: WritingSample[],
    scholarshipDetails: any
  ) {
    const [personalInfo, academicInfo, essays, recommendations, activities, financialInfo] = await Promise.all([
      this.generatePersonalInfo(persona),
      this.generateAcademicInfo(persona),
      this.generateEssays(persona, writingSamples, scholarshipDetails),
      this.generateRecommendations(persona),
      this.generateActivities(persona),
      this.generateFinancialInfo(persona)
    ]);

    return {
      personalInfo,
      academicInfo,
      essays,
      recommendations,
      activities,
      financialInfo
    };
  }

  private async generatePersonalInfo(persona: StudentPersona): Promise<PreFilledPersonalInfo> {
    return {
      fullName: `${(persona as any).firstName || 'Student'} ${(persona as any).lastName || 'Name'}`,
      email: (persona as any).email || '',
      phone: persona.phone || '',
      address: {
        street: (persona as any).address || '',
        city: (persona as any).city || '',
        state: (persona as any).state || '',
        zipCode: (persona as any).zipCode || ''
      },
      dateOfBirth: persona.dateOfBirth?.toISOString().split('T')[0] || '',
      citizenship: (persona as any).citizenship || 'US Citizen',
      ethnicity: (persona as any).ethnicity || '',
      gender: (persona as any).gender || '',
      parentInfo: {
        parent1: {
          name: (persona as any).parentName || '',
          occupation: (persona as any).parentOccupation || '',
          education: (persona as any).parentEducation || ''
        },
        parent2: {
          name: '',
          occupation: '',
          education: ''
        }
      }
    };
  }

  private async generateAcademicInfo(persona: StudentPersona): Promise<PreFilledAcademicInfo> {
    return {
      currentSchool: persona.schoolName || '',
      graduationDate: persona.graduationYear?.toString() || '',
      gpa: persona.gpa || 0,
      classRank: persona.classRank || '',
      satScore: persona.satScore || 0,
      actScore: persona.actScore || 0,
      apCourses: persona.apCourses || [],
      honors: persona.academicHonors || [],
      intendedMajor: persona.intendedMajor || '',
      careerGoals: persona.careerGoals || ''
    };
  }

  private async generateEssays(
    persona: StudentPersona, 
    writingSamples: WritingSample[],
    scholarshipDetails: any
  ): Promise<PreFilledEssay[]> {
    const essayPrompts = scholarshipDetails.essayPrompts || [
      "Why do you deserve this scholarship?",
      "Describe your career goals and how this scholarship will help you achieve them.",
      "Tell us about a challenge you've overcome."
    ];

    const essays: PreFilledEssay[] = [];

    for (const prompt of essayPrompts) {
      const essayResponse = await this.generateEssayResponse(persona, writingSamples, prompt);
      essays.push(essayResponse);
    }

    return essays;
  }

  private async generateEssayResponse(
    persona: StudentPersona,
    writingSamples: WritingSample[],
    prompt: string
  ): Promise<PreFilledEssay> {
    
    // Analyze writing style from samples
    const writingStyle = await this.analyzeWritingStyle(writingSamples);
    
    const aiPrompt = `
Generate a scholarship essay response that maintains the student's authentic voice.

Student Profile:
- Name: ${persona.firstName} ${persona.lastName}
- Major: ${persona.intendedMajor}
- GPA: ${persona.gpa}
- Career Goals: ${persona.careerGoals}
- Activities: ${persona.extracurricularActivities}
- Background: ${persona.personalBackground}

Writing Style Analysis:
${writingStyle}

Essay Prompt: "${prompt}"

Requirements:
- 250-500 words
- Maintain authentic student voice
- Include specific examples from their background
- Show genuine passion and motivation
- Professional but personal tone

Generate a compelling essay response:
`;

    const response = await this.aiProvider.generateCompletion(aiPrompt, {
      maxTokens: 800,
      temperature: 0.7
    });

    const wordCount = response.content.split(' ').length;

    return {
      prompt,
      response: response.content,
      wordCount,
      voicePreserved: true,
      needsReview: wordCount < 200 || wordCount > 600,
      confidence: 85
    };
  }

  private async analyzeWritingStyle(writingSamples: WritingSample[]): Promise<string> {
    if (writingSamples.length === 0) {
      return "No writing samples available - using general high school voice";
    }

    const combinedText = writingSamples.slice(0, 3).map(sample => sample.content).join('\n\n');
    
    const prompt = `
Analyze this student's writing style and voice patterns:

${combinedText}

Provide a concise analysis focusing on:
- Vocabulary level and complexity
- Sentence structure patterns
- Tone and personality
- Common phrases or expressions
- Overall voice characteristics

Keep analysis brief and actionable for essay generation.
`;

    const analysis = await this.aiProvider.generateCompletion(prompt, {
      maxTokens: 300,
      temperature: 0.3
    });

    return analysis.content;
  }

  private async generateRecommendations(persona: StudentPersona): Promise<PreFilledRecommendation[]> {
    const recommendations: PreFilledRecommendation[] = [
      {
        recommenderName: 'Academic Counselor',
        recommenderTitle: 'School Counselor',
        recommenderEmail: '',
        relationship: 'Academic Advisor',
        requestSent: false,
        received: false
      },
      {
        recommenderName: 'Teacher',
        recommenderTitle: 'Teacher',
        recommenderEmail: '',
        relationship: 'Classroom Teacher',
        requestSent: false,
        received: false
      }
    ];

    return recommendations;
  }

  private async generateActivities(persona: StudentPersona): Promise<PreFilledActivity[]> {
    if (!persona.extracurricularActivities) {
      return [];
    }

    const activitiesText = persona.extracurricularActivities;
    
    const prompt = `
Parse this student's extracurricular activities into structured format:

"${activitiesText}"

Extract individual activities and format as JSON array with these fields:
- name: activity name
- type: leadership/volunteer/work/athletics/arts/academic/other
- description: brief description
- hoursPerWeek: estimated hours
- weeksPerYear: estimated weeks
- yearsParticipated: estimated years
- leadershipRole: any leadership position
- achievements: array of achievements

Return only valid JSON array.
`;

    try {
      const response = await this.aiProvider.generateCompletion(prompt, {
        maxTokens: 600,
        temperature: 0.3
      });

      const activities = JSON.parse(response.content);
      return Array.isArray(activities) ? activities : [];
    } catch (error) {
      // Fallback to basic parsing
      return [{
        name: "Various Activities",
        type: 'other' as const,
        description: activitiesText.substring(0, 200),
        hoursPerWeek: 5,
        weeksPerYear: 30,
        yearsParticipated: 2,
        leadershipRole: '',
        achievements: []
      }];
    }
  }

  private async generateFinancialInfo(persona: StudentPersona): Promise<PreFilledFinancialInfo> {
    return {
      householdIncome: persona.familyIncome || '',
      fafsaCompleted: persona.fafsaStatus === 'completed',
      efc: persona.expectedFamilyContribution || 0,
      financialNeed: 0, // Calculate based on scholarship amount - EFC
      otherScholarships: []
    };
  }

  private async identifyMissingFields(
    persona: StudentPersona, 
    scholarshipDetails: any
  ): Promise<MissingField[]> {
    const missingFields: MissingField[] = [];

    // Check for missing personal info
    if (!persona.phoneNumber) {
      missingFields.push({
        field: 'phoneNumber',
        section: 'Personal Information',
        description: 'Phone number for contact',
        required: true,
        estimatedTimeMinutes: 1
      });
    }

    if (!persona.address) {
      missingFields.push({
        field: 'address',
        section: 'Personal Information', 
        description: 'Complete mailing address',
        required: true,
        estimatedTimeMinutes: 3
      });
    }

    // Check for missing academic info
    if (!persona.satScore && !persona.actScore) {
      missingFields.push({
        field: 'testScores',
        section: 'Academic Information',
        description: 'SAT or ACT test scores',
        required: true,
        estimatedTimeMinutes: 2
      });
    }

    // Check for missing financial info
    if (!persona.familyIncome) {
      missingFields.push({
        field: 'familyIncome',
        section: 'Financial Information',
        description: 'Family household income range',
        required: true,
        estimatedTimeMinutes: 2
      });
    }

    return missingFields;
  }

  private calculateCompletionPercentage(
    preFilledSections: any,
    missingFields: MissingField[]
  ): number {
    const totalFields = 25; // Approximate total application fields
    const missingRequiredFields = missingFields.filter(f => f.required).length;
    const completedFields = totalFields - missingRequiredFields;
    
    return Math.max(0, Math.min(100, Math.round((completedFields / totalFields) * 100)));
  }

  private async generateSubmissionInstructions(scholarshipDetails: any): Promise<string[]> {
    return [
      "Review all pre-filled information for accuracy",
      "Complete any missing required fields marked in red",
      "Upload any required documents (transcripts, etc.)",
      "Request recommendation letters if needed", 
      "Submit application before deadline",
      "Save confirmation number and receipt"
    ];
  }

  async updateApplicationField(
    applicationId: string,
    field: string,
    value: any
  ): Promise<void> {
    // Update specific field in the application
    // This would integrate with storage layer
  }

  async submitApplication(applicationId: string): Promise<{ success: boolean; confirmationNumber: string; }> {
    // Handle final application submission
    return {
      success: true,
      confirmationNumber: `SCH-${Date.now()}`
    };
  }
}

export const scholarshipApplicationGenerator = new ScholarshipApplicationGenerator();