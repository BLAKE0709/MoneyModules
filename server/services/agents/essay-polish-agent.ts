import OpenAI from "openai";
import { storage } from "../../storage";
import type { AgentContext, AgentResponse, AgentSuggestion } from "@shared/agent-types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class EssayPolishAgent {
  async analyzeEssayWithPersona(context: AgentContext, essayContent: string, essayType: string): Promise<AgentResponse> {
    try {
      // Get student's writing style from persona and samples
      const writingProfile = await this.buildWritingProfile(context);
      
      // Analyze essay maintaining authentic voice
      const analysis = await this.performStyleConsistentAnalysis(essayContent, essayType, writingProfile);
      
      // Generate improvement suggestions that preserve voice
      const suggestions = await this.generateVoiceAwareSuggestions(essayContent, analysis, writingProfile);
      
      return {
        success: true,
        data: {
          analysis,
          voiceConsistencyScore: analysis.voiceConsistencyScore,
          authenticityPreserved: true
        },
        suggestions
      };
    } catch (error) {
      console.error("Essay polish error:", error);
      return {
        success: false,
        error: "Failed to analyze essay with persona context"
      };
    }
  }

  private async buildWritingProfile(context: AgentContext) {
    const samples = context.writingSamples.slice(0, 5); // Use most recent 5 samples
    
    if (samples.length === 0) {
      return {
        tone: "authentic",
        complexity: 7,
        vocabulary: 7,
        patterns: [],
        voice: "developing"
      };
    }

    const prompt = `
Analyze these writing samples to create a comprehensive writing profile:

${samples.map((sample, i) => `
Sample ${i + 1}: ${sample.originalName}
Content: ${sample.content.substring(0, 500)}...
`).join('\n')}

Create a detailed writing profile as JSON:
{
  "tone": "formal/casual/academic/personal",
  "complexity": 1-10,
  "vocabulary": 1-10,
  "sentenceStructure": "simple/varied/complex",
  "voiceCharacteristics": ["authentic", "thoughtful", "analytical"],
  "preferredExpressions": ["phrase1", "phrase2"],
  "writingStrengths": ["strength1", "strength2"],
  "naturalPatterns": {
    "introStyle": "description",
    "transitionStyle": "description", 
    "conclusionStyle": "description"
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

  private async performStyleConsistentAnalysis(essayContent: string, essayType: string, writingProfile: any) {
    const prompt = `
Analyze this essay while considering the student's authentic writing profile:

Essay Type: ${essayType}
Essay Content: ${essayContent}

Student's Writing Profile:
${JSON.stringify(writingProfile)}

Provide analysis that respects their natural voice:
{
  "clarityScore": 1-10,
  "impactScore": 1-10,
  "originalityScore": 1-10,
  "voiceConsistencyScore": 1-10,
  "authenticityScore": 1-10,
  "strengths": ["strength1", "strength2"],
  "voicePreservingImprovements": ["improvement1", "improvement2"],
  "wordCount": number,
  "readabilityLevel": "grade level",
  "emotionalImpact": 1-10
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  private async generateVoiceAwareSuggestions(essayContent: string, analysis: any, writingProfile: any): Promise<AgentSuggestion[]> {
    const prompt = `
Generate improvement suggestions that preserve the student's authentic voice:

Essay: ${essayContent.substring(0, 1000)}...
Analysis: ${JSON.stringify(analysis)}
Writing Profile: ${JSON.stringify(writingProfile)}

Create 3-5 suggestions that:
1. Maintain their natural voice and style
2. Build on their existing strengths
3. Offer specific, actionable improvements
4. Respect their vocabulary level and complexity preferences

Return as JSON array:
[{
  "id": "unique_id",
  "type": "improvement",
  "title": "Brief title",
  "description": "Specific suggestion that preserves voice",
  "priority": "low|medium|high",
  "estimatedImpact": "How this helps while maintaining authenticity",
  "actionable": true,
  "voicePreserving": true,
  "beforeExample": "original text snippet",
  "afterExample": "improved version in their voice"
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

  async generatePersonalizedPrompts(context: AgentContext, essayType: string): Promise<AgentResponse> {
    try {
      const prompt = `
Based on this student's profile, generate 3-5 essay prompts for ${essayType}:

Student Profile:
- Major Interest: ${context.persona.intendedMajor}
- Career Goals: ${context.persona.careerGoals}
- Extracurriculars: ${context.persona.extracurriculars?.join(', ')}
- Volunteering: ${context.persona.volunteering?.join(', ')}

Past Writing Topics: ${context.essays.map(e => e.title).join(', ')}

Generate prompts that:
1. Connect to their interests and experiences
2. Allow them to showcase their authentic voice
3. Are relevant to their academic/career goals
4. Haven't been covered in previous essays

Return as JSON:
{
  "prompts": [
    {
      "title": "Prompt title",
      "question": "The actual prompt question",
      "guidance": "Why this fits their profile",
      "keyPoints": ["point1", "point2"],
      "estimatedLength": "word count recommendation"
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
      
      return {
        success: true,
        data: result.prompts || []
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to generate personalized prompts"
      };
    }
  }

  async improveEssayPreservingVoice(context: AgentContext, essayContent: string, focusAreas: string[]): Promise<AgentResponse> {
    try {
      const writingProfile = await this.buildWritingProfile(context);
      
      const prompt = `
Improve this essay while strictly preserving the student's authentic voice:

Original Essay: ${essayContent}
Writing Profile: ${JSON.stringify(writingProfile)}
Focus Areas: ${focusAreas.join(', ')}

Rules:
1. Maintain their natural vocabulary level
2. Preserve their sentence structure preferences
3. Keep their authentic tone and style
4. Only suggest changes that sound like they would write them
5. Focus on structural and clarity improvements, not voice changes

Return JSON:
{
  "improvedVersion": "full improved essay text",
  "changes": [
    {
      "type": "clarity|structure|impact",
      "original": "original text",
      "improved": "improved version",
      "reason": "why this improvement helps"
    }
  ],
  "voicePreservationScore": 1-10,
  "improvementSummary": "brief summary of changes made"
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to improve essay while preserving voice"
      };
    }
  }
}

export const essayPolishAgent = new EssayPolishAgent();