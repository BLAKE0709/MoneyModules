import { Request, Response, NextFunction } from 'express';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  timestamp: Date;
  userId?: string;
  statusCode: number;
}

const metrics: PerformanceMetrics[] = [];

export function performanceMonitoring(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userId = (req as any).user?.claims?.sub;
    
    const metric: PerformanceMetrics = {
      endpoint: req.path,
      method: req.method,
      duration,
      timestamp: new Date(),
      userId,
      statusCode: res.statusCode
    };
    
    metrics.push(metric);
    
    // Keep only last 1000 metrics in memory
    if (metrics.length > 1000) {
      metrics.shift();
    }
    
    // Log slow requests (>2s as per o3 requirement)
    if (duration > 2000) {
      console.warn(`SLOW REQUEST: ${req.method} ${req.path} took ${duration}ms for user ${userId}`);
    }
  });
  
  next();
}

export function getPerformanceMetrics(): {
  p95ResponseTime: number;
  avgResponseTime: number;
  totalRequests: number;
  slowRequests: number;
  errorRate: number;
} {
  if (metrics.length === 0) {
    return {
      p95ResponseTime: 0,
      avgResponseTime: 0,
      totalRequests: 0,
      slowRequests: 0,
      errorRate: 0
    };
  }
  
  const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
  const p95Index = Math.floor(durations.length * 0.95);
  const p95ResponseTime = durations[p95Index] || 0;
  
  const avgResponseTime = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const slowRequests = metrics.filter(m => m.duration > 2000).length;
  const errorRequests = metrics.filter(m => m.statusCode >= 400).length;
  const errorRate = (errorRequests / metrics.length) * 100;
  
  return {
    p95ResponseTime: Math.round(p95ResponseTime),
    avgResponseTime: Math.round(avgResponseTime),
    totalRequests: metrics.length,
    slowRequests,
    errorRate: Math.round(errorRate * 100) / 100
  };
}