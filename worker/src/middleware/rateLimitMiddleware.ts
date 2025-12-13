/**
 * ========================================
 * RATE LIMITING MIDDLEWARE
 * ========================================
 * Rate limiting middleware cho Cloudflare Worker
 */

import { RateLimitError } from '../../../utils/errors';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // milliseconds
  keyGenerator?: (request: Request) => string;
}

/**
 * In-memory rate limiter (for single worker instance)
 * Trong production, nên dùng Cloudflare KV hoặc Durable Objects
 */
class RateLimiter {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry
      this.store.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return { allowed: true };
    }

    if (entry.count < this.config.maxRequests) {
      entry.count++;
      return { allowed: true };
    }

    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  /**
   * Clean up old entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Create rate limiter middleware
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = new RateLimiter(config);

  // Cleanup every 5 minutes
  setInterval(() => limiter.cleanup(), 5 * 60 * 1000);

  return (request: Request): void => {
    const keyGenerator = config.keyGenerator || ((req: Request) => {
      // Use IP address as key (from Cloudflare headers)
      return req.headers.get('CF-Connecting-IP') || 'unknown';
    });

    const key = keyGenerator(request);
    const { allowed, retryAfter } = limiter.isAllowed(key);

    if (!allowed) {
      throw new RateLimitError('Too many requests', retryAfter);
    }
  };
}

/**
 * Rate limit middleware factory
 */
export function rateLimitMiddleware(
  maxRequests: number = 60,
  windowMs: number = 60 * 1000 // 1 minute
) {
  return createRateLimitMiddleware({
    maxRequests,
    windowMs,
  });
}

