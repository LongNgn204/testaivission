/**
 * ============================================================
 * 📋 AI Report Handler
 * ============================================================
 * 
 * Generates detailed medical reports for test results
 * using Gemini AI with caching
 */

import { IRequest } from 'itty-router';
import { createGeminiFromEnv } from '../services/gemini';
import { CacheService, CACHE_TTL } from '../services/cache';
import { createReportPrompt, createReportSchema } from '../prompts/report';

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

    // Initialize services
    const cacheService = new CacheService(env.CACHE);
    const gemini = createGeminiFromEnv(env);

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

    // Generate report
    const prompt = createReportPrompt(testType, testData, history, language);
    const schema = createReportSchema(language);

    const responseText = await gemini.generateContent(prompt, {
      temperature: 0.3,
      maxTokens: 4000,
      responseSchema: schema,
      responseMimeType: 'application/json',
    });

    // Parse response
    let report: any;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      report = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse report response:', responseText);
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

