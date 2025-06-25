import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { storage } from '../storage';

// Audit logging for AI interactions
export interface AuditLog {
  userId: string;
  action: 'ai_request' | 'ai_response' | 'essay_generation' | 'scholarship_match';
  prompt?: string;
  response?: string;
  promptHash: string;
  responseHash?: string;
  timestamp: Date;
  sessionId: string;
}

export function createHash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').hexDigest();
}

export async function logAIInteraction(
  userId: string,
  action: AuditLog['action'],
  prompt: string,
  response?: string,
  sessionId?: string
): Promise<void> {
  const auditLog: AuditLog = {
    userId,
    action,
    prompt,
    response,
    promptHash: createHash(prompt),
    responseHash: response ? createHash(response) : undefined,
    timestamp: new Date(),
    sessionId: sessionId || crypto.randomUUID()
  };

  // Store audit log in activity table for now
  await storage.createActivity({
    userId,
    type: 'ai_audit',
    description: `AI interaction: ${action}`,
    metadata: {
      promptHash: auditLog.promptHash,
      responseHash: auditLog.responseHash,
      sessionId: auditLog.sessionId,
      action
    }
  });
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
}

// Rate limiting for AI endpoints
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function aiRateLimit(maxRequests = 50, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.claims?.sub;
    if (!userId) return next();

    const now = Date.now();
    const userLimit = rateLimitStore.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      rateLimitStore.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({ 
        message: 'Too many AI requests. Please wait before trying again.',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
    }

    userLimit.count++;
    next();
  };
}

// Similarity detection for essays
export async function checkSimilarity(content: string, userId: string): Promise<{ similarity: number; flag: boolean }> {
  // Simple hash-based similarity check
  const contentHash = createHash(content.toLowerCase().replace(/\s+/g, ' ').trim());
  
  // Check against user's existing essays
  const userEssays = await storage.getEssaysByUser(userId);
  let maxSimilarity = 0;

  for (const essay of userEssays) {
    const essayHash = createHash(essay.content.toLowerCase().replace(/\s+/g, ' ').trim());
    if (essayHash === contentHash) {
      maxSimilarity = 100;
      break;
    }
    
    // Simple word overlap similarity (production would use better algorithms)
    const words1 = new Set(content.toLowerCase().split(/\s+/));
    const words2 = new Set(essay.content.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    const similarity = (intersection.size / union.size) * 100;
    
    maxSimilarity = Math.max(maxSimilarity, similarity);
  }

  const SIMILARITY_THRESHOLD = 25; // 25% as per o3 suggestion
  return {
    similarity: Math.round(maxSimilarity),
    flag: maxSimilarity > SIMILARITY_THRESHOLD
  };
}