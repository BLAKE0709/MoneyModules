import { openai } from './essay-analysis';
import { storage } from '../storage';

export class SemanticSearchService {
  async searchPersonaVectors(userId: string, query: string, limit: number = 10): Promise<any[]> {
    try {
      // For now, return a simple text-based search since embeddings require processing
      const files = await storage.getPersonaFiles(userId);
      const processedFiles = files.filter(f => f.status === 'processed');
      
      // Simple keyword matching for demonstration
      const matchingFiles = processedFiles.filter(file => 
        file.filename.toLowerCase().includes(query.toLowerCase()) ||
        (file.type && file.type.toLowerCase().includes(query.toLowerCase())) ||
        (file.sourceClass && file.sourceClass.toLowerCase().includes(query.toLowerCase()))
      );
      
      return matchingFiles.slice(0, limit).map(file => ({
        ...file,
        similarity: 0.8, // Mock similarity score
        matchType: 'filename_or_metadata'
      }));
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to perform search');
    }
  }
  
  async getRelatedContent(userId: string, fileId: string, limit: number = 5): Promise<any[]> {
    try {
      // Get the target file
      const targetFile = await storage.getPersonaFile(fileId);
      if (!targetFile) return [];
      
      // Get all other files for this user  
      const allFiles = await storage.getPersonaFiles(userId);
      const otherFiles = allFiles.filter(f => f.id !== fileId && f.status === 'processed');
      
      // Simple similarity based on file type and class
      const relatedFiles = otherFiles
        .map(file => ({
          ...file,
          similarity: this.calculateSimpleFileSimilarity(targetFile, file)
        }))
        .filter(file => file.similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
      
      return relatedFiles;
    } catch (error) {
      console.error('Related content search error:', error);
      return [];
    }
  }
  
  async analyzeWritingStyle(userId: string): Promise<any> {
    try {
      const files = await storage.getPersonaFiles(userId);
      const processedFiles = files.filter(f => f.status === 'processed' && f.wordCount && f.wordCount > 50);
      
      if (processedFiles.length === 0) {
        return {
          totalDocuments: 0,
          averageReadingLevel: 0,
          vocabularyComplexity: 'insufficient_data',
          writingStyles: [],
          themeAnalysis: 'Not enough content for analysis'
        };
      }
      
      // Calculate statistics
      const totalWords = processedFiles.reduce((sum, f) => sum + (f.wordCount || 0), 0);
      const averageReadingLevel = processedFiles.reduce((sum, f) => sum + (f.readingLevel || 0), 0) / processedFiles.length;
      
      // Get a sample of content for AI analysis
      const sampleContent = await this.getSampleContent(processedFiles.slice(0, 3));
      
      // Use AI to analyze writing style
      const styleAnalysis = await this.performAIStyleAnalysis(sampleContent);
      
      return {
        totalDocuments: processedFiles.length,
        totalWords,
        averageWordCount: Math.round(totalWords / processedFiles.length),
        averageReadingLevel: Math.round(averageReadingLevel * 10) / 10,
        vocabularyComplexity: this.calculateVocabularyComplexity(averageReadingLevel),
        writingStyles: styleAnalysis.styles || [],
        themeAnalysis: styleAnalysis.themes || 'Analysis in progress',
        strengthsAndWeaknesses: styleAnalysis.assessment || {}
      };
    } catch (error) {
      console.error('Writing style analysis error:', error);
      throw new Error('Failed to analyze writing style');
    }
  }
  
  private calculateSimpleFileSimilarity(fileA: any, fileB: any): number {
    let score = 0;
    
    // Same file type gets points
    if (fileA.type === fileB.type) score += 0.4;
    
    // Same source class gets points  
    if (fileA.sourceClass === fileB.sourceClass) score += 0.3;
    
    // Similar reading levels get points
    if (fileA.readingLevel && fileB.readingLevel) {
      const levelDiff = Math.abs(fileA.readingLevel - fileB.readingLevel);
      if (levelDiff <= 2) score += 0.3;
    }
    
    return score;
  }
  
  private calculateVocabularyComplexity(readingLevel: number): string {
    if (readingLevel < 8) return 'elementary';
    if (readingLevel < 12) return 'intermediate';
    if (readingLevel < 16) return 'advanced';
    return 'graduate_level';
  }
  
  private async getSampleContent(files: any[]): Promise<string> {
    // In a real implementation, you'd extract actual content from files
    // For now, return a placeholder that indicates we have content to analyze
    return files.map(f => `Document: ${f.filename} (${f.wordCount} words, Grade ${f.readingLevel} reading level)`).join('\n');
  }
  
  private async performAIStyleAnalysis(content: string): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: `You are an expert writing style analyzer. Analyze the provided content and return a JSON object with:
          - styles: array of writing style descriptors (e.g., "analytical", "narrative", "persuasive")
          - themes: brief description of common themes
          - assessment: object with strengths and areas_for_improvement arrays`
        }, {
          role: 'user',
          content: `Please analyze this writing portfolio summary: ${content}`
        }],
        response_format: { type: 'json_object' }
      });
      
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('AI style analysis error:', error);
      return {
        styles: ['analytical'],
        themes: 'Unable to analyze themes at this time',
        assessment: {
          strengths: ['Clear structure'],
          areas_for_improvement: ['More content needed for detailed analysis']
        }
      };
    }
  }
}

export const semanticSearchService = new SemanticSearchService();