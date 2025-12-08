/**
 * ============================================================
 * 💡 Proactive Tip Handler
 * ============================================================
 * 
 * Generates proactive health tips
 */

import { IRequest } from 'itty-router';
import { createGeminiFromEnv } from '../services/gemini';
import { CacheService, CACHE_TTL } from '../services/cache';
import { createProactiveTipPrompt } from '../prompts/proactiveTip';

export async function generateProactiveTip(
  request: IRequest,
  env: any
): Promise<Response> {
  try {
    const { lastTest, userProfile, language } = await (request as unknown as Request).json() as any;

    // Validate input
    if (!language) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          required: ['language'],
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

    // Initialize services
    const cacheService = new CacheService(env.CACHE);
    const gemini = createGeminiFromEnv(env);

    // Generate cache key
    const cacheKey = cacheService.generateKey(
      'proactive-tip',
      language,
      lastTest ? JSON.stringify(lastTest) : 'no-test',
      userProfile ? JSON.stringify(userProfile) : 'no-profile'
    );

    // Check cache
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
      return new Response(
        JSON.stringify({
          tip: cached.tip,
          fromCache: true,
          cacheKey,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate tip
    const prompt = createProactiveTipPrompt(lastTest, userProfile, language);

    const tip = await gemini.generateContent(prompt, {
      temperature: 0.6,
      maxTokens: 100,
    });

    // Cache result
    await cacheService.set(
      cacheKey,
      { tip },
      { ttl: CACHE_TTL.PROACTIVE_TIP }
    );

    return new Response(
      JSON.stringify({
        tip,
        fromCache: false,
        timestamp: new Date().toISOString(),
        language,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Proactive tip error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate proactive tip',
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

