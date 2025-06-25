// Agent Types and Interfaces for Multi-Agent System

export interface AgentContext {
  userId: string;
  persona: StudentPersona;
  writingSamples: WritingSample[];
  essays: Essay[];
  currentTask?: string;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  suggestions?: AgentSuggestion[];
  learningData?: PersonaLearningData;
  error?: string;
}

export interface AgentSuggestion {
  id: string;
  type: 'improvement' | 'opportunity' | 'warning' | 'celebration';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedImpact: string;
  deadline?: Date;
}

export interface PersonaLearningData {
  writingPatterns?: {
    vocabularyLevel: number;
    sentenceComplexity: number;
    preferredTopics: string[];
    stylisticChoices: Record<string, any>;
  };
  decisionPatterns?: {
    riskTolerance: number;
    timeManagement: string;
    preferredFeedbackStyle: string;
  };
  learningPreferences?: {
    learningStyle: string;
    motivationTriggers: string[];
    challengeAreas: string[];
  };
}

export interface ScholarshipOpportunity {
  id: string;
  title: string;
  provider: string;
  amount: number;
  deadline: Date;
  requirements: string[];
  matchScore: number;
  applicationUrl: string;
  estimatedTimeToComplete: number;
  competitiveness: 'low' | 'medium' | 'high';
}

export type AgentType = 
  | 'persona_learning'
  | 'essay_polish'
  | 'scholarship_scout'
  | 'test_prep'
  | 'college_fit'
  | 'internship_hunter'
  | 'financial_planner';

import type { StudentPersona, WritingSample, Essay } from "./schema";