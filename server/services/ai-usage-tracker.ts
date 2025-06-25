import OpenAI from "openai";
import { storage } from "../storage";
import type { InsertActivity } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ChatGPTThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIUsageInsight {
  skillCategory: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  evidenceCount: number;
  keyCapabilities: string[];
  businessValue: string;
  portfolioSummary: string;
}

export interface AIUsageLedger {
  userId: string;
  totalInteractions: number;
  skillCategories: AIUsageInsight[];
  professionalReadiness: {
    score: number;
    strengths: string[];
    recommendations: string[];
  };
  portfolioHighlights: {
    bestExamples: string[];
    uniqueApproaches: string[];
    problemSolvingEvidence: string[];
  };
  generatedAt: Date;
}

export class AIUsageTracker {
  async processChatGPTExport(userId: string, chatGPTData: any): Promise<AIUsageLedger> {
    const threads = this.parseChatGPTExport(chatGPTData);
    const insights = await this.analyzeUsagePatterns(threads);
    const ledger = await this.generateUsageLedger(userId, threads, insights);
    
    // Store as activity for tracking
    await storage.createActivity({
      userId,
      type: "ai_portfolio_update",
      description: `AI Usage Portfolio updated with ${threads.length} ChatGPT conversations`,
      metadata: { 
        threadCount: threads.length,
        skillCategories: insights.length,
        readinessScore: ledger.professionalReadiness.score
      }
    });

    return ledger;
  }

  private parseChatGPTExport(data: any): ChatGPTThread[] {
    // Handle different ChatGPT export formats
    if (Array.isArray(data)) {
      return data.map(thread => ({
        id: thread.id || Math.random().toString(36),
        title: thread.title || thread.name || "Untitled Conversation",
        messages: this.extractMessages(thread),
        created_at: thread.create_time || thread.created_at || new Date().toISOString(),
        updated_at: thread.update_time || thread.updated_at || new Date().toISOString()
      }));
    }
    
    // Single conversation format
    if (data.messages) {
      return [{
        id: data.id || Math.random().toString(36),
        title: data.title || "Conversation",
        messages: this.extractMessages(data),
        created_at: data.create_time || new Date().toISOString(),
        updated_at: data.update_time || new Date().toISOString()
      }];
    }

    return [];
  }

  private extractMessages(thread: any): ChatMessage[] {
    const messages = thread.messages || thread.mapping || {};
    const messageList: ChatMessage[] = [];

    // Handle different message formats
    if (Array.isArray(messages)) {
      return messages.map(msg => ({
        id: msg.id || Math.random().toString(36),
        role: msg.role || (msg.author?.role === 'user' ? 'user' : 'assistant'),
        content: msg.content || msg.text || msg.parts?.[0] || "",
        timestamp: msg.create_time || msg.timestamp || new Date().toISOString()
      }));
    }

    // Handle mapping format from ChatGPT exports
    Object.values(messages).forEach((msg: any) => {
      if (msg.message?.content?.parts?.length > 0) {
        messageList.push({
          id: msg.id,
          role: msg.message.author.role,
          content: msg.message.content.parts.join(' '),
          timestamp: msg.message.create_time || new Date().toISOString()
        });
      }
    });

    return messageList.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  private async analyzeUsagePatterns(threads: ChatGPTThread[]): Promise<AIUsageInsight[]> {
    const allMessages = threads.flatMap(t => t.messages.filter(m => m.role === 'user'));
    
    if (allMessages.length === 0) {
      return [];
    }

    const conversationSample = allMessages
      .slice(0, 50) // Analyze first 50 user messages for efficiency
      .map(m => m.content)
      .join('\n\n');

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI usage analyst. Analyze these ChatGPT conversations to identify professional AI skills.

Categorize the user's AI interactions into skill categories like:
- Research & Analysis
- Creative Problem Solving  
- Technical Assistance
- Writing & Communication
- Data Analysis
- Strategic Planning
- Learning & Education
- Code Development
- Business Intelligence

For each category found, assess:
- Proficiency level (beginner/intermediate/advanced/expert)
- Key capabilities demonstrated
- Business value this skill provides
- Portfolio-worthy summary

Respond with JSON in this format:
{
  "skillCategories": [
    {
      "skillCategory": "Research & Analysis",
      "proficiencyLevel": "advanced",
      "evidenceCount": 15,
      "keyCapabilities": ["Complex query formulation", "Source verification", "Synthesis of multiple perspectives"],
      "businessValue": "Can conduct thorough market research and competitive analysis using AI tools",
      "portfolioSummary": "Demonstrated advanced research skills through systematic use of AI for multi-faceted analysis"
    }
  ]
}`
          },
          {
            role: "user", 
            content: conversationSample
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      return analysis.skillCategories || [];
    } catch (error) {
      console.error("Error analyzing AI usage patterns:", error);
      return [];
    }
  }

  private async generateUsageLedger(
    userId: string, 
    threads: ChatGPTThread[], 
    insights: AIUsageInsight[]
  ): Promise<AIUsageLedger> {
    const totalInteractions = threads.reduce((sum, t) => sum + t.messages.length, 0);
    
    // Calculate professional readiness score
    const avgProficiency = insights.length > 0 
      ? insights.reduce((sum, i) => {
          const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
          return sum + levels[i.proficiencyLevel];
        }, 0) / insights.length
      : 0;

    const diversityBonus = Math.min(insights.length * 10, 40); // Up to 40 points for diversity
    const volumeBonus = Math.min(Math.floor(totalInteractions / 10), 20); // Up to 20 points for volume
    const readinessScore = Math.min(Math.round((avgProficiency * 20) + diversityBonus + volumeBonus), 100);

    return {
      userId,
      totalInteractions,
      skillCategories: insights,
      professionalReadiness: {
        score: readinessScore,
        strengths: insights
          .filter(i => i.proficiencyLevel === 'advanced' || i.proficiencyLevel === 'expert')
          .map(i => i.skillCategory),
        recommendations: this.generateRecommendations(insights, readinessScore)
      },
      portfolioHighlights: {
        bestExamples: insights.slice(0, 3).map(i => i.portfolioSummary),
        uniqueApproaches: insights.map(i => i.keyCapabilities).flat().slice(0, 5),
        problemSolvingEvidence: insights
          .filter(i => i.skillCategory.includes('Problem') || i.skillCategory.includes('Analysis'))
          .map(i => i.businessValue)
      },
      generatedAt: new Date()
    };
  }

  private generateRecommendations(insights: AIUsageInsight[], score: number): string[] {
    const recommendations: string[] = [];

    if (score < 50) {
      recommendations.push("Explore AI tools for research and analysis to build foundational skills");
      recommendations.push("Practice using AI for different types of problem-solving scenarios");
    } else if (score < 75) {
      recommendations.push("Focus on developing advanced prompting techniques");
      recommendations.push("Document specific business outcomes from AI-assisted projects");
    } else {
      recommendations.push("Create case studies showcasing AI-driven business solutions");
      recommendations.push("Mentor others in professional AI usage best practices");
    }

    const missingCategories = [
      "Research & Analysis", "Creative Problem Solving", "Technical Assistance",
      "Writing & Communication", "Data Analysis", "Strategic Planning"
    ].filter(cat => !insights.some(i => i.skillCategory === cat));

    if (missingCategories.length > 0) {
      recommendations.push(`Explore AI applications in: ${missingCategories.slice(0, 2).join(', ')}`);
    }

    return recommendations;
  }

  async generatePortfolioDocument(ledger: AIUsageLedger): Promise<string> {
    const document = `
# AI Proficiency Portfolio

**Student:** ${ledger.userId}
**Generated:** ${ledger.generatedAt.toDateString()}
**Professional Readiness Score:** ${ledger.professionalReadiness.score}/100

## Executive Summary
This portfolio demonstrates proficiency in professional AI usage through ${ledger.totalInteractions} documented interactions across ${ledger.skillCategories.length} skill categories.

## Core AI Competencies

${ledger.skillCategories.map(skill => `
### ${skill.skillCategory} - ${skill.proficiencyLevel.toUpperCase()}
**Business Value:** ${skill.businessValue}

**Key Capabilities:**
${skill.keyCapabilities.map(cap => `- ${cap}`).join('\n')}

**Evidence:** ${skill.evidenceCount} documented interactions
`).join('\n')}

## Professional Strengths
${ledger.professionalReadiness.strengths.map(s => `- ${s}`).join('\n')}

## Portfolio Highlights
${ledger.portfolioHighlights.bestExamples.map(ex => `- ${ex}`).join('\n')}

## Growth Recommendations
${ledger.professionalReadiness.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*This portfolio demonstrates measurable AI literacy - a critical skill for the modern workforce.*
    `.trim();

    return document;
  }
}

export const aiUsageTracker = new AIUsageTracker();