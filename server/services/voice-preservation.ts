import { createAIProvider } from './ai-provider-manager';
import type { WritingSample } from '@shared/schema';

export interface VoiceAnalysis {
  vocabularyLevel: 'simple' | 'moderate' | 'advanced' | 'sophisticated';
  sentenceComplexity: 'simple' | 'mixed' | 'complex';
  tonality: 'casual' | 'conversational' | 'formal' | 'academic';
  personalityMarkers: string[];
  commonPhrases: string[];
  writingPatterns: {
    averageSentenceLength: number;
    paragraphStructure: string;
    transitionStyle: string;
    voiceConfidence: number; // 0-100 based on sample quality
  };
}

export interface VoicePreservedSuggestion {
  originalSuggestion: string;
  voicePreservedVersion: string;
  reasoning: string;
  voiceElements: string[];
}

export class VoicePreservationEngine {
  private aiProvider = createAIProvider();

  async analyzeWritingVoice(writingSamples: WritingSample[]): Promise<VoiceAnalysis> {
    if (!writingSamples.length) {
      return this.getDefaultVoiceProfile();
    }

    const combinedSamples = writingSamples
      .map(sample => `File: ${sample.originalName}\nContent: ${sample.content}`)
      .join('\n\n---\n\n');

    const analysisPrompt = `Analyze these writing samples to create a detailed voice profile for this student. Focus on preserving their authentic expression style.

Writing Samples:
${combinedSamples}

Provide analysis in JSON format with these fields:
- vocabularyLevel: How sophisticated their word choices are
- sentenceComplexity: Sentence structure patterns
- tonality: Overall tone and formality level
- personalityMarkers: Unique phrases or expressions that show personality
- commonPhrases: Recurring language patterns
- writingPatterns: Technical analysis of structure and style
  - averageSentenceLength: Approximate word count per sentence
  - paragraphStructure: How they organize ideas
  - transitionStyle: How they connect thoughts
  - voiceConfidence: 0-100 score of how distinctive their voice is

IMPORTANT: Focus on what makes this student's writing authentic and personal, not what would make it "better" by conventional standards.`;

    try {
      const response = await this.aiProvider.generateCompletion([
        {
          role: "system",
          content: "You are a writing voice analysis expert who helps preserve student authenticity in their writing. Your goal is to identify what makes each student's voice unique and valuable."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ], {
        responseFormat: this.aiProvider.supportsJSONMode() ? 'json' : 'text',
        temperature: 0.3, // Lower temperature for consistent analysis
        maxTokens: 1000
      });

      if (this.aiProvider.supportsJSONMode()) {
        return JSON.parse(response.content);
      } else {
        return this.parseTextVoiceAnalysis(response.content);
      }
    } catch (error) {
      console.error('Voice analysis failed:', error);
      return this.getDefaultVoiceProfile();
    }
  }

  async generateVoicePreservedSuggestions(
    essayContent: string,
    originalSuggestions: any[],
    voiceAnalysis: VoiceAnalysis
  ): Promise<VoicePreservedSuggestion[]> {
    const voicePreservedSuggestions: VoicePreservedSuggestion[] = [];

    for (const suggestion of originalSuggestions) {
      const preservationPrompt = `Given this student's writing voice profile and original suggestion, rewrite the suggestion to preserve their authentic style.

Student Voice Profile:
- Vocabulary Level: ${voiceAnalysis.vocabularyLevel}
- Sentence Complexity: ${voiceAnalysis.sentenceComplexity}
- Tonality: ${voiceAnalysis.tonality}
- Personality Markers: ${voiceAnalysis.personalityMarkers.join(', ')}
- Common Phrases: ${voiceAnalysis.commonPhrases.join(', ')}

Original Suggestion: ${suggestion.suggestion}

Essay Context: ${essayContent.substring(0, 500)}...

Rewrite this suggestion to:
1. Maintain the student's natural vocabulary level
2. Respect their sentence complexity preferences
3. Preserve their authentic tonality
4. Incorporate their personality markers where appropriate
5. Avoid making their writing sound generic or overly formal

Provide response in JSON format:
- voicePreservedVersion: The rewritten suggestion
- reasoning: Why this preserves their voice
- voiceElements: Specific voice elements being preserved`;

      try {
        const response = await this.aiProvider.generateCompletion([
          {
            role: "system",
            content: "You are a voice preservation specialist who helps maintain student authenticity while providing helpful feedback."
          },
          {
            role: "user",
            content: preservationPrompt
          }
        ], {
          responseFormat: this.aiProvider.supportsJSONMode() ? 'json' : 'text',
          temperature: 0.4,
          maxTokens: 300
        });

        let preservedSuggestion;
        if (this.aiProvider.supportsJSONMode()) {
          preservedSuggestion = JSON.parse(response.content);
        } else {
          preservedSuggestion = this.parseTextPreservation(response.content);
        }

        voicePreservedSuggestions.push({
          originalSuggestion: suggestion.suggestion,
          voicePreservedVersion: preservedSuggestion.voicePreservedVersion,
          reasoning: preservedSuggestion.reasoning,
          voiceElements: preservedSuggestion.voiceElements || []
        });
      } catch (error) {
        console.error('Voice preservation failed for suggestion:', error);
        // Fallback: use original suggestion with voice note
        voicePreservedSuggestions.push({
          originalSuggestion: suggestion.suggestion,
          voicePreservedVersion: `${suggestion.suggestion} (Note: Consider how this fits your natural writing style)`,
          reasoning: "Original suggestion with voice awareness note",
          voiceElements: []
        });
      }
    }

    return voicePreservedSuggestions;
  }

  async generateEssayDraft(
    prompt: string,
    essayType: string,
    voiceAnalysis: VoiceAnalysis,
    writingSamples: WritingSample[],
    keyPoints?: string[]
  ): Promise<string> {
    const sampleContext = writingSamples
      .map(sample => `"${sample.originalName}": ${sample.content.substring(0, 300)}...`)
      .join('\n\n');

    const voiceGuidelines = `
VOICE PRESERVATION REQUIREMENTS:
- Vocabulary Level: Use ${voiceAnalysis.vocabularyLevel} vocabulary that matches their natural word choices
- Sentence Style: Write in ${voiceAnalysis.sentenceComplexity} sentences like their samples
- Tone: Maintain their ${voiceAnalysis.tonality} voice throughout
- Personality: Include authentic expressions like: ${voiceAnalysis.personalityMarkers.join(', ')}
- Patterns: Follow their ${voiceAnalysis.writingPatterns.paragraphStructure} paragraph style
- Confidence: Voice strength is ${voiceAnalysis.writingPatterns.voiceConfidence}/100 - preserve this level of expression
`;

    const draftPrompt = `Write a ${essayType} essay that responds to this prompt while preserving the student's authentic voice.

Essay Prompt: ${prompt}

${voiceGuidelines}

Student's Writing Samples for Voice Reference:
${sampleContext}

${keyPoints ? `Key Points to Include: ${keyPoints.join(', ')}` : ''}

CRITICAL INSTRUCTIONS:
1. Write in their natural style, not an "improved" version
2. Use vocabulary they would actually use
3. Match their sentence complexity and flow
4. Include personality elements that make it authentically theirs
5. Keep their natural tonality - don't make it more formal if they're naturally casual
6. Aim for ${voiceAnalysis.writingPatterns.averageSentenceLength}-word average sentences
7. Use their transition style: ${voiceAnalysis.writingPatterns.transitionStyle}

Generate an essay draft that sounds like this student wrote it personally.`;

    try {
      const response = await this.aiProvider.generateCompletion([
        {
          role: "system",
          content: "You are a voice-preserving essay assistant who helps students express their authentic thoughts in their natural writing style. Never make their writing sound generic or artificially improved."
        },
        {
          role: "user",
          content: draftPrompt
        }
      ], {
        temperature: 0.7, // Higher temperature for natural expression
        maxTokens: 1500
      });

      return response.content;
    } catch (error) {
      console.error('Voice-preserved essay generation failed:', error);
      return `I encountered an issue generating your essay draft. Please try again or use the essay analysis tools to improve your own draft.`;
    }
  }

  private getDefaultVoiceProfile(): VoiceAnalysis {
    return {
      vocabularyLevel: 'moderate',
      sentenceComplexity: 'mixed',
      tonality: 'conversational',
      personalityMarkers: [],
      commonPhrases: [],
      writingPatterns: {
        averageSentenceLength: 15,
        paragraphStructure: 'standard',
        transitionStyle: 'simple',
        voiceConfidence: 50
      }
    };
  }

  private parseTextVoiceAnalysis(content: string): VoiceAnalysis {
    // Fallback parsing for non-JSON providers
    return this.getDefaultVoiceProfile();
  }

  private parseTextPreservation(content: string): any {
    // Fallback parsing for non-JSON providers
    return {
      voicePreservedVersion: content,
      reasoning: "Voice preservation applied",
      voiceElements: []
    };
  }
}

export const voicePreservationEngine = new VoicePreservationEngine();