/**
 * ============================================================
 * 📅 Routine Handler
 * ============================================================
 * 
 * Generates personalized weekly routine
 */

import { IRequest } from 'itty-router';
import { GeminiService } from '../services/gemini';
import { CacheService, CACHE_TTL } from '../services/cache';
import { createRoutinePrompt, createRoutineSchema } from '../prompts/routine';

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

    // Initialize services
    const cacheService = new CacheService(env.CACHE);
    const gemini = new GeminiService(env.GEMINI_API_KEY);

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

    // Generate routine
    const prompt = createRoutinePrompt(answers, language);
    const schema = createRoutineSchema();

    const responseText = await gemini.generateContent(prompt, {
      temperature: 0.5,
      maxTokens: 4000,
      responseSchema: schema,
      responseMimeType: 'application/json',
    });

    // Parse response
    let routine: any;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      routine = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse routine response:', responseText);
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

