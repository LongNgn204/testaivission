/**
 * ========================================
 * CACHE SERVICE
 * ========================================
 * Response caching service cho Cloudflare Worker
 */

export interface CacheConfig {
  ttl: number; // seconds
  key: string;
}

/**
 * Cache service using Cloudflare Cache API
 */
export class CacheService {
  /**
   * Get cached response
   */
  static async get(key: string): Promise<Response | null> {
    try {
      const cache = caches.default;
      const request = new Request(`https://cache/${key}`, { method: 'GET' });
      const response = await cache.match(request);
      return response ?? null;
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  /**
   * Set cached response
   */
  static async set(key: string, response: Response, ttl: number): Promise<void> {
    try {
      const cache = caches.default;
      const request = new Request(`https://cache/${key}`, { method: 'GET' });

      // Clone response to avoid consuming the body
      const cachedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      });

      // Add cache control header
      cachedResponse.headers.set('Cache-Control', `public, max-age=${ttl}`);

      await cache.put(request, cachedResponse);
    } catch (error) {
      console.warn('Cache set failed:', error);
    }
  }

  /**
   * Delete cached response
   */
  static async delete(key: string): Promise<void> {
    try {
      const cache = caches.default;
      const request = new Request(`https://cache/${key}`, { method: 'GET' });
      await cache.delete(request);
    } catch (error) {
      console.warn('Cache delete failed:', error);
    }
  }

  /**
   * Generate cache key
   */
  static generateKey(
    method: string,
    path: string,
    query?: Record<string, string>
  ): string {
    let key = `${method}:${path}`;

    if (query && Object.keys(query).length > 0) {
      const params = new URLSearchParams(query);
      key += `?${params.toString()}`;
    }

    return key;
  }
}

/**
 * Cache middleware
 */
export function cacheMiddleware(ttl: number = 3600) {
  return async (request: Request, handler: () => Promise<Response>): Promise<Response> => {
    // Only cache GET requests
    if (request.method !== 'GET') {
      return handler();
    }

    const url = new URL(request.url);
    const cacheKey = CacheService.generateKey(request.method, url.pathname, {
      ...Object.fromEntries(url.searchParams),
    });

    // Try to get from cache
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get fresh response
    const response = await handler();

    // Cache successful responses
    if (response.status === 200) {
      await CacheService.set(cacheKey, response.clone(), ttl);
    }

    return response;
  };
}

