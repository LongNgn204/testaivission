/**
 * ============================================================
 * 📊 Dashboard Handler (Cloudflare AI - FREE)
 * ============================================================
 * 
 * Generates dashboard insights from test history
 * using Cloudflare Workers AI - FREE!
 */

import { IRequest } from 'itty-router';
import { generateJSONWithCloudflareAI } from '../services/gemini';
import { CacheService, CACHE_TTL } from '../services/cache';
import { createDashboardPrompt } from '../prompts/dashboard';

export async function generateDashboardInsights(
  request: IRequest,
  env: any
): Promise<Response> {
  try {
    const { history, language } = await (request as unknown as Request).json() as any;

    // Validate input
    if (!history || !Array.isArray(history) || !language) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          required: ['history (array)', 'language'],
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['vi', 'en'].includes(language)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid language',
          supported: ['vi', 'en'],
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if Cloudflare AI is available
    if (!env.AI) {
      return new Response(
        JSON.stringify({
          error: 'AI service not configured',
          message: 'Cloudflare Workers AI binding not found',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize cache service
    const cacheService = new CacheService(env.CACHE);

    // Generate cache key based on recent history
    const recentHistory = history.slice(0, 5);
    const cacheKey = cacheService.generateKey(
      'dashboard',
      language,
      JSON.stringify(recentHistory)
    );

    // Check cache
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
      return new Response(
        JSON.stringify({
          ...cached,
          fromCache: true,
          cacheKey,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate insights using Cloudflare AI
    const prompt = createDashboardPrompt(history, language);

    const insights = await generateJSONWithCloudflareAI(env.AI, prompt, language);

    // Add metadata
    const result = {
      ...insights,
      timestamp: new Date().toISOString(),
      language,
      fromCache: false,
    };

    // Cache result
    await cacheService.set(cacheKey, result, { ttl: CACHE_TTL.DASHBOARD });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Dashboard insights error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate dashboard insights',
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
