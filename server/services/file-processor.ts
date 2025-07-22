import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import OpenAI from 'openai';
import { storage } from '../storage';
import type { PersonaFile } from '@shared/schema';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class FileProcessor {
  
  async extractText(filePath: string, mimetype: string): Promise<string> {
    try {
      switch (mimetype) {
        case 'application/pdf':
          return await this.extractFromPDF(filePath);
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractFromDOCX(filePath);
        case 'text/plain':
          return await this.extractFromTXT(filePath);
        default:
          throw new Error(`Unsupported file type: ${mimetype}`);
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      throw error;
    }
  }

  private async extractFromPDF(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    const data = await pdf(buffer);
    return data.text;
  }

  private async extractFromDOCX(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  private async extractFromTXT(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf-8');
  }

  splitIntoChunks(text: string, maxTokens: number = 512): string[] {
    // Simple chunking by sentences, approximating ~4 chars per token
    const maxChars = maxTokens * 4;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (currentChunk.length + trimmedSentence.length + 1 > maxChars) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = trimmedSentence;
        } else {
          // Single sentence is too long, split it
          chunks.push(trimmedSentence.substring(0, maxChars));
          currentChunk = trimmedSentence.substring(maxChars);
        }
      } else {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text.substring(0, maxChars)];
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small', // Using 3-small for cost efficiency, still 1536 dimensions
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  calculateReadingLevel(text: string): number {
    // Simple Flesch Reading Ease approximation
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const syllables = this.countSyllables(text);

    if (sentences === 0 || words === 0) return 12; // Default to grade 12

    const avgSentenceLength = words / sentences;
    const avgSyllablesPerWord = syllables / words;
    
    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    // Convert Flesch score to grade level (approximate)
    if (fleschScore >= 90) return 5;
    if (fleschScore >= 80) return 6;
    if (fleschScore >= 70) return 7;
    if (fleschScore >= 60) return 8;
    if (fleschScore >= 50) return 9;
    if (fleschScore >= 30) return 10;
    return 12;
  }

  private countSyllables(text: string): number {
    // Simple syllable counting
    const words = text.toLowerCase().split(/\s+/);
    let syllableCount = 0;

    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (cleanWord.length === 0) continue;

      let syllables = cleanWord.match(/[aeiouy]+/g)?.length || 1;
      if (cleanWord.endsWith('e')) syllables--;
      syllableCount += Math.max(1, syllables);
    }

    return syllableCount;
  }

  async processFile(personaFileId: string): Promise<void> {
    try {
      const personaFile = await storage.getPersonaFile(personaFileId);
      if (!personaFile) {
        throw new Error(`Persona file not found: ${personaFileId}`);
      }

      console.log(`Processing file: ${personaFile.filename}`);

      // Use the storage URL path from multer
      const tempFilePath = personaFile.storageUrl || `/tmp/uploads/${personaFile.filename}`;
      
      // Extract text
      const text = await this.extractText(tempFilePath, personaFile.mimetype);
      const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
      const readingLevel = this.calculateReadingLevel(text);

      // Update file metadata
      await storage.updatePersonaFile(personaFileId, {
        wordCount,
        readingLevel,
        status: 'processing'
      });

      // Split into chunks
      const chunks = this.splitIntoChunks(text);
      console.log(`Split into ${chunks.length} chunks`);

      // Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await this.generateEmbeddings(chunk);
        
        await storage.createPersonaVector({
          personaFileId,
          chunkIndex: i,
          text: chunk,
          embedding: JSON.stringify(embedding) // Store as JSON string for now
        });

        console.log(`Processed chunk ${i + 1}/${chunks.length}`);
      }

      // Mark as processed
      await storage.updatePersonaFile(personaFileId, {
        status: 'processed'
      });

      // Clean up temp file
      try {
        await fs.unlink(tempFilePath);
      } catch (error) {
        console.warn('Could not delete temp file:', error);
      }

      console.log(`Successfully processed file: ${personaFile.filename}`);

    } catch (error) {
      console.error('Error processing file:', error);
      
      // Mark as failed
      await storage.updatePersonaFile(personaFileId, {
        status: 'failed'
      });
      
      throw error;
    }
  }
}

export const fileProcessor = new FileProcessor();