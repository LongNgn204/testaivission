/**
 * ============================================================
 * 💬 Chat Handler
 * ============================================================
 * 
 * Handles chat conversations with Dr. Eva
 */

import { IRequest } from 'itty-router';
import { GeminiService } from '../services/gemini';
import { createChatPrompt } from '../prompts/chat';

export async function chat(
  request: IRequest,
  env: any
): Promise<Response> {
  try {
    const { message, lastTestResult, userProfile, language } =
      (await request.json()) as any;

    // Validate input
    if (!message || !language) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          required: ['message', 'language'],
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

    // Initialize Gemini
    const gemini = new GeminiService(env.GEMINI_API_KEY);

    // Build prompt
    const prompt = createChatPrompt(
      message,
      lastTestResult,
      userProfile,
      language
    );

    // Generate response
    const response = await gemini.generateContent(prompt, {
      temperature: 0.7,
      maxTokens: 500,
    });

    return new Response(
      JSON.stringify({
        message: response,
        timestamp: new Date().toISOString(),
        language,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat',
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

