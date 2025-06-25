import OpenAI from "openai";
import { createAIProvider, AIProviderManager } from "./ai-provider-manager";
import { logAIInteraction, checkSimilarity } from "../middleware/security";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export interface EssayAnalysis {
  clarityScore: number;
  impactScore: number;
  originalityScore: number;
  wordCount: number;
  suggestions: {
    type: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
  }[];
}

export async function analyzeEssay(
  content: string,
  prompt: string,
  essayType: string,
  writingSamples?: string[]
): Promise<EssayAnalysis> {
  const writingStyleContext = writingSamples && writingSamples.length > 0 
    ? `\n\nWRITING STYLE DNA - Use these authentic samples to understand this student's natural voice, vocabulary choices, sentence patterns, and personal expression style. ALL suggestions must preserve this authentic voice:\n\n${writingSamples.map((sample, idx) => `Sample ${idx + 1}:\n${sample}`).join('\n\n---\n\n')}`
    : '';

  try {
    const analysisPrompt = `Analyze this ${essayType} essay and provide a comprehensive analysis that preserves the student's authentic voice.
    
    Essay Prompt: ${prompt}
    
    Please evaluate the essay on the following criteria and provide scores out of 10:
    1. Clarity - How clear and well-structured is the writing?
    2. Impact - How compelling and memorable is the essay?
    3. Originality - How unique and authentic is the voice and content?
    
    Also provide 2-3 specific improvement suggestions with their impact level (high/medium/low).
    
    ${writingSamples && writingSamples.length > 0 ? 'Consider the student\'s writing style from the reference samples when making suggestions. Maintain their authentic voice while improving the essay.' : ''}
    
    Essay content:
    ${content}${writingStyleContext}
    
    Respond with JSON in this format:
    {
      "clarityScore": number,
      "impactScore": number, 
      "originalityScore": number,
      "wordCount": number,
      "suggestions": [
        {
          "type": "strengthen_conclusion" | "add_transition" | "improve_clarity" | "enhance_specificity" | "fix_structure",
          "suggestion": "specific suggestion text",
          "impact": "high" | "medium" | "low"
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert essay reviewer and writing coach. Provide detailed, actionable feedback to help students improve their essays.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      clarityScore: Math.max(1, Math.min(10, result.clarityScore || 5)),
      impactScore: Math.max(1, Math.min(10, result.impactScore || 5)),
      originalityScore: Math.max(1, Math.min(10, result.originalityScore || 5)),
      wordCount: result.wordCount || content.split(/\s+/).length,
      suggestions: result.suggestions || [],
    };
  } catch (error) {
    console.error("Failed to analyze essay:", error);
    throw new Error("Failed to analyze essay with AI");
  }
}

export async function generateEssayImprovement(
  originalContent: string,
  suggestionType: string,
  specificSuggestion: string
): Promise<string> {
  try {
    const prompt = `Please improve this essay by applying the following suggestion:
    
    Suggestion Type: ${suggestionType}
    Specific Suggestion: ${specificSuggestion}
    
    Original Essay:
    ${originalContent}
    
    Please provide the improved version of the essay, maintaining the original voice and style while implementing the suggestion. Return only the improved essay text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert essay editor. Help improve essays while maintaining the student's authentic voice and style.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.choices[0].message.content || originalContent;
  } catch (error) {
    console.error("Failed to generate essay improvement:", error);
    throw new Error("Failed to generate essay improvement");
  }
}

export async function findScholarshipMatches(
  studentPersona: any
): Promise<{ scholarshipName: string; matchScore: number; reasoning: string }[]> {
  try {
    const prompt = `Based on this student profile, identify potential scholarship matches and provide match scores.
    
    Student Profile:
    - GPA: ${studentPersona.gpa}
    - Intended Majors: ${studentPersona.intendedMajors?.join(', ')}
    - Extracurriculars: ${studentPersona.extracurriculars}
    - Income Range: ${studentPersona.incomeRange}
    - SAT Score: ${studentPersona.satScore}
    - ACT Score: ${studentPersona.actScore}
    
    Provide 5-10 scholarship opportunities with match scores and reasoning.
    
    Respond with JSON in this format:
    {
      "matches": [
        {
          "scholarshipName": "scholarship name",
          "matchScore": number (0-100),
          "reasoning": "brief explanation of why this is a good match"
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a scholarship matching expert with knowledge of various merit-based, need-based, and field-specific scholarships.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.matches || [];
  } catch (error) {
    console.error("Failed to find scholarship matches:", error);
    throw new Error("Failed to find scholarship matches");
  }
}
