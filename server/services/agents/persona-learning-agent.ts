import OpenAI from "openai";
import { storage } from "../../storage";
import type { AgentContext, AgentResponse, PersonaLearningData } from "@shared/agent-types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class PersonaLearningAgent {
  async analyzeAndUpdatePersona(context: AgentContext, newActivity: any): Promise<AgentResponse> {
    try {
      // Analyze new activity for learning patterns
      const learningData = await this.extractLearningData(context, newActivity);
      
      // Update persona with new insights
      await this.updatePersonaProfile(context.userId, learningData);
      
      // Generate personalized suggestions based on updated persona
      const suggestions = await this.generatePersonalizedSuggestions(context, learningData);
      
      return {
        success: true,
        learningData,
        suggestions,
        data: {
          updated: true,
          insights: learningData,
          nextRecommendations: suggestions
        }
      };
    } catch (error) {
      console.error("Persona learning error:", error);
      return {
        success: false,
        error: "Failed to analyze persona learning data"
      };
    }
  }

  private async extractLearningData(context: AgentContext, activity: any): Promise<PersonaLearningData> {
    const prompt = `
Analyze this student activity and extract learning patterns for persona development:

Student Context:
- Current Major Interest: ${context.persona.intendedMajor || 'Undecided'}
- Career Goals: ${context.persona.careerGoals || 'Exploring'}
- Academic Level: GPA ${context.persona.gpa || 'N/A'}

Recent Activity:
Type: ${activity.type}
Description: ${activity.description}
Content: ${JSON.stringify(activity.metadata || {})}

Previous Writing Samples: ${context.writingSamples.length} samples
Recent Essays: ${context.essays.length} essays

Extract and return JSON with learning insights:
{
  "writingPatterns": {
    "vocabularyLevel": 1-10,
    "sentenceComplexity": 1-10,
    "preferredTopics": ["topic1", "topic2"],
    "stylisticChoices": {"tone": "formal/casual", "perspective": "first/third"}
  },
  "decisionPatterns": {
    "riskTolerance": 1-10,
    "timeManagement": "early/ontime/lastminute",
    "preferredFeedbackStyle": "direct/encouraging/detailed"
  },
  "learningPreferences": {
    "learningStyle": "visual/auditory/kinesthetic/reading",
    "motivationTriggers": ["achievement", "recognition", "growth"],
    "challengeAreas": ["time management", "essay writing", "test anxiety"]
  }
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  private async updatePersonaProfile(userId: string, learningData: PersonaLearningData): Promise<void> {
    const currentPersona = await storage.getStudentPersona(userId);
    if (!currentPersona) return;

    // Merge new learning data with existing persona
    const updatedProfile = {
      writingStyleProfile: {
        ...currentPersona.writingStyleProfile,
        ...learningData.writingPatterns
      },
      learningPreferences: {
        ...currentPersona.learningPreferences,
        ...learningData.learningPreferences
      },
      decisionPatterns: {
        ...currentPersona.decisionPatterns,
        ...learningData.decisionPatterns
      },
      interactionHistory: {
        ...currentPersona.interactionHistory,
        lastUpdate: new Date().toISOString(),
        totalInteractions: (currentPersona.interactionHistory?.totalInteractions || 0) + 1
      }
    };

    await storage.updateStudentPersona(currentPersona.id, updatedProfile);
  }

  private async generatePersonalizedSuggestions(context: AgentContext, learningData: PersonaLearningData) {
    const prompt = `
Based on this student's learning profile, generate 3-5 personalized suggestions:

Learning Profile:
${JSON.stringify(learningData)}

Student Context:
- Major: ${context.persona.intendedMajor}
- Career Goals: ${context.persona.careerGoals}
- Academic Performance: ${context.persona.gpa}

Generate suggestions as JSON array:
[{
  "type": "improvement|opportunity|warning|celebration",
  "title": "Brief title",
  "description": "Detailed description",
  "priority": "low|medium|high|urgent",
  "estimatedImpact": "Description of potential impact",
  "actionable": true|false
}]
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "[]");
    return result.suggestions || [];
  }

  async getPersonaInsights(userId: string): Promise<AgentResponse> {
    try {
      const persona = await storage.getStudentPersona(userId);
      if (!persona) {
        return { success: false, error: "Persona not found" };
      }

      return {
        success: true,
        data: {
          writingStyle: persona.writingStyleProfile,
          learningPreferences: persona.learningPreferences,
          decisionPatterns: persona.decisionPatterns,
          totalInteractions: persona.interactionHistory?.totalInteractions || 0,
          lastUpdate: persona.interactionHistory?.lastUpdate
        }
      };
    } catch (error) {
      return { success: false, error: "Failed to retrieve persona insights" };
    }
  }
}

export const personaLearningAgent = new PersonaLearningAgent();