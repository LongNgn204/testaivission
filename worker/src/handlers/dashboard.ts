/**
 * ============================================================
 * 📊 Dashboard Handler
 * ============================================================
 * 
 * Generates dashboard insights from test history
 */

import { IRequest } from 'itty-router';
import { GeminiService } from '../services/gemini';
import { CacheService, CACHE_TTL } from '../services/cache';
import { createDashboardPrompt, createDashboardSchema } from '../prompts/dashboard';

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

    // Initialize services
    const cacheService = new CacheService(env.CACHE);
    const gemini = new GeminiService(env.GEMINI_API_KEY);

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

    // Generate insights
    const prompt = createDashboardPrompt(history, language);
    const schema = createDashboardSchema();

    const responseText = await gemini.generateContent(prompt, {
      temperature: 0.2,
      maxTokens: 4000,
      responseSchema: schema,
      responseMimeType: 'application/json',
    });

    // Parse response
    let insights: any;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      insights = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse dashboard response:', responseText);
      return new Response(
        JSON.stringify({
          error: 'Failed to parse AI response',
          details: parseError instanceof Error ? parseError.message : 'Unknown error',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

