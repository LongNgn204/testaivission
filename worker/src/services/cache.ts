/**
 * ============================================================
 * 💾 Cache Service - Cloudflare KV Storage
 * ============================================================
 * 
 * Handles caching of API responses to reduce latency
 * and Gemini API calls
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  metadata?: Record<string, any>;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export class CacheService {
  private kv: KVNamespace;
  private prefix: string;

  constructor(kv: KVNamespace, prefix: string = 'vision-coach') {
    this.kv = kv;
    this.prefix = prefix;
  }

  /**
   * Generate cache key with prefix
   */
  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getKey(key);
      const value = await this.kv.get(fullKey, 'json');

      if (!value) {
        return null;
      }

      const entry = value as CacheEntry<T>;

      // Check if expired
      const age = Date.now() - entry.timestamp;
      if (age > entry.ttl * 1000) {
        await this.delete(key);
        return null;
      }

      // Update hit count
      entry.hits++;
      await this.kv.put(fullKey, JSON.stringify(entry), {
        expirationTtl: entry.ttl,
      });

      console.log(`✅ Cache HIT for key: ${key} (hits: ${entry.hits})`);
      return entry.data;
    } catch (error) {
      console.error(`❌ Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    options?: CacheOptions
  ): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      const ttl = options?.ttl ?? 3600; // Default 1 hour

      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
        hits: 0,
      };

      await this.kv.put(fullKey, JSON.stringify(entry), {
        expirationTtl: ttl,
        metadata: options?.metadata,
      });

      console.log(`✅ Cache SET for key: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      console.error(`❌ Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      await this.kv.delete(fullKey);
      console.log(`✅ Cache DELETE for key: ${key}`);
    } catch (error) {
      console.error(`❌ Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Clear all cache entries (use with caution)
   */
  async clear(): Promise<void> {
    try {
      // KV doesn't have a clear all method, so we'd need to track keys
      console.log('⚠️ Cache clear not implemented for KV');
    } catch (error) {
      console.error('❌ Cache clear error:', error);
    }
  }

  /**
   * Generate cache key from multiple parts
   */
  generateKey(...parts: string[]): string {
    return parts
      .map(part => {
        if (typeof part === 'object') {
          return JSON.stringify(part);
        }
        return String(part);
      })
      .join(':');
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    prefix: string;
    note: string;
  }> {
    return {
      prefix: this.prefix,
      note: 'Use Cloudflare Analytics for detailed KV statistics',
    };
  }
}

/**
 * Cache TTL constants
 */
export const CACHE_TTL = {
  REPORT: 3600, // 1 hour
  DASHBOARD: 7200, // 2 hours
  CHAT: 0, // No cache
  ROUTINE: 86400, // 24 hours
  PROACTIVE_TIP: 1800, // 30 minutes
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 86400, // 24 hours
};

/**
 * Create cache service instance
 */
export function createCacheService(
  kv: KVNamespace,
  prefix?: string
): CacheService {
  return new CacheService(kv, prefix);
}

