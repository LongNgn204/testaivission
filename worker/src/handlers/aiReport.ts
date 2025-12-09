/**
 * ============================================================
 * 📋 AI Report Handler (Cloudflare AI - FREE)
 * ============================================================
 * 
 * Generates detailed medical reports for test results
 * using Cloudflare Workers AI (LLAMA 3.1) - FREE!
 */

import { IRequest } from 'itty-router';
import { generateJSONWithCloudflareAI } from '../services/gemini';
import { CacheService, CACHE_TTL } from '../services/cache';
import { createReportPrompt } from '../prompts/report';

export async function generateReport(
  request: IRequest,
  env: any
): Promise<Response> {
  try {
    const { testType, testData, history, language } = (await request.json()) as any;

    // Validate input
    if (!testType || !testData || !language) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          required: ['testType', 'testData', 'language'],
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
      'report',
      testType,
      language,
      JSON.stringify(testData)
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

    // Generate report using Cloudflare AI
    const prompt = createReportPrompt(testType, testData, history, language);

    const report = await generateJSONWithCloudflareAI(env.AI, prompt, language);

    // Add metadata
    const result = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      testType,
      timestamp: new Date().toISOString(),
      language,
      ...report,
      fromCache: false,
    };

    // Cache result
    await cacheService.set(cacheKey, result, { ttl: CACHE_TTL.REPORT });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Report generation error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate report',
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
