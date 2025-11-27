/**
 * ============================================================
 * 🚦 Rate Limiting Middleware
 * ============================================================
 * 
 * Prevents abuse by limiting requests per IP
 */

import { CacheService } from '../services/cache';

const RATE_LIMITS = {
  '/api/report': { limit: 100, window: 3600 }, // 100 per hour
  '/api/dashboard': { limit: 50, window: 3600 }, // 50 per hour
  '/api/chat': { limit: 200, window: 3600 }, // 200 per hour
  '/api/routine': { limit: 50, window: 3600 }, // 50 per hour
  '/api/proactive-tip': { limit: 50, window: 3600 }, // 50 per hour
  default: { limit: 500, window: 3600 }, // 500 per hour
};

export async function rateLimit(
  request: Request,
  env: any
): Promise<Response | undefined> {
  try {
    // Get client IP
    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      'unknown';

    // Get endpoint
    const url = new URL(request.url);
    const endpoint = url.pathname;

    // Get rate limit config
    const config =
      RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;

    // Initialize cache
    const cache = new CacheService(env.CACHE, 'ratelimit');

    // Get current count
    const key = `${ip}:${endpoint}`;
    const current = (await cache.get<number>(key)) || 0;

    // Check limit
    if (current >= config.limit) {
      console.warn(`⚠️ Rate limit exceeded for ${ip} on ${endpoint}`);
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          limit: config.limit,
          window: config.window,
          retryAfter: config.window,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(config.window),
          },
        }
      );
    }

    // Increment counter
    await cache.set(key, current + 1, { ttl: config.window });
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    // Don't block on rate limit errors
  }
}

