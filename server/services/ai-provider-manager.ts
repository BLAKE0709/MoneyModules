import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from "@google/genai";

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  baseURL?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  customHeaders?: Record<string, string>;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: AIProvider;
}

export class AIProviderManager {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private google?: GoogleGenAI;

  constructor(private config: AIProviderConfig) {
    this.initializeProvider();
  }

  private initializeProvider() {
    switch (this.config.provider) {
      case 'openai':
        this.openai = new OpenAI({
          apiKey: this.config.apiKey || process.env.OPENAI_API_KEY,
          baseURL: this.config.baseURL
        });
        break;
      
      case 'anthropic':
        this.anthropic = new Anthropic({
          apiKey: this.config.apiKey || process.env.ANTHROPIC_API_KEY,
          baseURL: this.config.baseURL
        });
        break;
      
      case 'google':
        this.google = new GoogleGenAI({
          apiKey: this.config.apiKey || process.env.GEMINI_API_KEY || ""
        });
        break;
      
      case 'azure':
        this.openai = new OpenAI({
          apiKey: this.config.apiKey || process.env.AZURE_OPENAI_API_KEY,
          baseURL: this.config.baseURL,
          defaultHeaders: {
            'api-version': '2024-02-15-preview',
            ...this.config.customHeaders
          }
        });
        break;
      
      case 'custom':
        // For university custom endpoints
        this.openai = new OpenAI({
          apiKey: this.config.apiKey || 'custom-key',
          baseURL: this.config.baseURL,
          defaultHeaders: this.config.customHeaders
        });
        break;
    }
  }

  async generateCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: { temperature?: number; maxTokens?: number; responseFormat?: 'json' | 'text' }
  ): Promise<AIResponse> {
    const temperature = options?.temperature ?? this.config.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? this.config.maxTokens ?? 1000;

    try {
      switch (this.config.provider) {
        case 'openai':
        case 'azure':
        case 'custom':
          return await this.handleOpenAICompletion(messages, { temperature, maxTokens, responseFormat: options?.responseFormat });
        
        case 'anthropic':
          return await this.handleAnthropicCompletion(messages, { temperature, maxTokens });
        
        case 'google':
          return await this.handleGoogleCompletion(messages, { temperature, maxTokens });
        
        default:
          throw new Error(`Unsupported AI provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error(`AI Provider Error (${this.config.provider}):`, error);
      throw new Error(`Failed to generate completion with ${this.config.provider}: ${error.message}`);
    }
  }

  private async handleOpenAICompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: { temperature: number; maxTokens: number; responseFormat?: 'json' | 'text' }
  ): Promise<AIResponse> {
    if (!this.openai) throw new Error('OpenAI client not initialized');

    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      response_format: options.responseFormat === 'json' ? { type: "json_object" } : undefined
    });

    return {
      content: response.choices[0].message.content || '',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      } : undefined,
      model: response.model,
      provider: this.config.provider
    };
  }

  private async handleAnthropicCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: { temperature: number; maxTokens: number }
  ): Promise<AIResponse> {
    if (!this.anthropic) throw new Error('Anthropic client not initialized');

    // Convert messages format for Anthropic
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await this.anthropic.messages.create({
      model: this.config.model,
      system: systemMessage,
      messages: conversationMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      temperature: options.temperature,
      max_tokens: options.maxTokens
    });

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      usage: response.usage ? {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens
      } : undefined,
      model: response.model,
      provider: this.config.provider
    };
  }

  private async handleGoogleCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: { temperature: number; maxTokens: number }
  ): Promise<AIResponse> {
    if (!this.google) throw new Error('Google AI client not initialized');

    // Convert messages to Google format
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');
    
    const prompt = conversationMessages.map(m => 
      `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`
    ).join('\n\n');

    const response = await this.google.models.generateContent({
      model: this.config.model,
      config: {
        systemInstruction: systemMessage,
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens
      },
      contents: prompt
    });

    return {
      content: response.text || '',
      usage: response.usageMetadata ? {
        promptTokens: response.usageMetadata.promptTokenCount || 0,
        completionTokens: response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata.totalTokenCount || 0
      } : undefined,
      model: this.config.model,
      provider: this.config.provider
    };
  }

  // Provider capability checks
  supportsJSONMode(): boolean {
    return ['openai', 'azure', 'custom'].includes(this.config.provider);
  }

  supportsVision(): boolean {
    return ['openai', 'google', 'anthropic'].includes(this.config.provider);
  }

  getProviderInfo(): { provider: AIProvider; model: string; capabilities: string[] } {
    const capabilities = [];
    if (this.supportsJSONMode()) capabilities.push('JSON Mode');
    if (this.supportsVision()) capabilities.push('Vision');
    
    return {
      provider: this.config.provider,
      model: this.config.model,
      capabilities
    };
  }
}

// Factory function for creating AI providers based on institution preferences
export function createAIProvider(institutionId?: string): AIProviderManager {
  // Default to OpenAI GPT-4o for individual users
  let config: AIProviderConfig = {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 1500
  };

  // Institution-specific configurations would be loaded from database
  if (institutionId) {
    // This would fetch from database in real implementation
    const institutionConfigs: Record<string, AIProviderConfig> = {
      'stanford': {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        temperature: 0.6,
        maxTokens: 2000
      },
      'mit': {
        provider: 'azure',
        model: 'gpt-4',
        baseURL: 'https://mit-openai.openai.azure.com/',
        temperature: 0.7,
        maxTokens: 1500
      },
      'university-custom': {
        provider: 'custom',
        model: 'university-llm-v1',
        baseURL: 'https://ai.university.edu/v1',
        customHeaders: {
          'X-Institution-ID': institutionId,
          'X-API-Version': '2024-01'
        },
        temperature: 0.8,
        maxTokens: 2000
      }
    };

    config = institutionConfigs[institutionId] || config;
  }

  return new AIProviderManager(config);
}