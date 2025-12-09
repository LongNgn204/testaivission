/**
 * ============================================================
 * 📅 Routine Handler (Cloudflare AI - FREE)
 * ============================================================
 * 
 * Generates personalized weekly routine
 * using Cloudflare Workers AI - FREE!
 */

import { IRequest } from 'itty-router';
import { generateJSONWithCloudflareAI } from '../services/gemini';
import { CacheService, CACHE_TTL } from '../services/cache';
import { createRoutinePrompt } from '../prompts/routine';

export async function generateRoutine(
  request: IRequest,
  env: any
): Promise<Response> {
  try {
    const { answers, language } = await (request as unknown as Request).json() as any;

    // Validate input
    if (!answers || !language) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          required: ['answers (object)', 'language'],
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

    // Generate cache key
    const cacheKey = cacheService.generateKey(
      'routine',
      language,
      JSON.stringify(answers)
    );

    // Check cache
    const cached = await cacheService.get(cacheKey);
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

    // Generate routine using Cloudflare AI
    const prompt = createRoutinePrompt(answers, language);

    const routine = await generateJSONWithCloudflareAI(env.AI, prompt, language);

    // Add metadata
    const result = {
      ...routine,
      timestamp: new Date().toISOString(),
      language,
      fromCache: false,
    };

    // Cache result
    await cacheService.set(cacheKey, result, { ttl: CACHE_TTL.ROUTINE });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Routine generation error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate routine',
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
