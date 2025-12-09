/**
 * ============================================================
 * 💡 Proactive Tip Handler (Cloudflare AI - FREE)
 * ============================================================
 * 
 * Generates proactive health tips
 * using Cloudflare Workers AI - FREE!
 */

import { IRequest } from 'itty-router';
import { generateWithCloudflareAI } from '../services/gemini';
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

    // Generate tip using Cloudflare AI
    const prompt = createProactiveTipPrompt(lastTest, userProfile, language);

    const systemPrompt = language === 'vi'
      ? 'Đưa ra 1 mẹo hữu ích ngắn gọn (20-30 từ) về chăm sóc mắt. Thân thiện, có emoji.'
      : 'Give 1 short helpful tip (20-30 words) about eye care. Friendly, with emoji.';

    const tip = await generateWithCloudflareAI(env.AI, prompt, systemPrompt);

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
