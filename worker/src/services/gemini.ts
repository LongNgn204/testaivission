/**
 * ============================================================
 * 🤖 Gemini Service - Google AI API Wrapper
 * ============================================================
 * 
 * Handles all Gemini API calls with error handling and logging
 */

export interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
}

export interface GenerateContentOptions {
  temperature?: number;
  maxTokens?: number;
  responseSchema?: any;
  responseMimeType?: string;
  topP?: number;
  topK?: number;
}

export class GeminiService {
  private apiKey: string;
  private config: GeminiConfig;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.config = {
      apiKey,
      model: 'gemini-2.5-flash',
      temperature: 0.3,
      maxTokens: 4000,
      topP: 0.8,
      topK: 40,
    };
  }

  /**
   * Generate content using Gemini API
   */
  async generateContent(
    prompt: string,
    options?: GenerateContentOptions
  ): Promise<string> {
    const startTime = Date.now();

    try {
      const model = this.config.model;
      const url = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: options?.temperature ?? this.config.temperature,
          maxOutputTokens: options?.maxTokens ?? this.config.maxTokens,
          topP: options?.topP ?? this.config.topP,
          topK: options?.topK ?? this.config.topK,
          responseMimeType: options?.responseMimeType || 'text/plain',
          responseSchema: options?.responseSchema,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData: any = await response.json();
        throw new Error(
          `Gemini API error: ${response.status} - ${((errorData as any).error?.message) || 'Unknown error'}`
        );
      }

      const data: any = await response.json();
      const elapsed = Date.now() - startTime;

      // Extract text from response
      const text =
        (data as any).candidates?.[0]?.content?.parts?.[0]?.text ||
        (data as any).candidates?.[0]?.content?.parts?.[0]?.functionCall?.name ||
        '';

      if (!text) {
        throw new Error('No content in Gemini response');
      }

      console.log(
        `✅ Gemini API call completed in ${elapsed}ms (model: ${model})`
      );

      return text;
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      console.error(`❌ Gemini API error after ${elapsed}ms:`, error.message);
      throw new Error(`Gemini API failed: ${error.message}`);
    }
  }

  /**
   * Generate content with JSON response
   */
  async generateJSON(
    prompt: string,
    schema: any,
    options?: GenerateContentOptions
  ): Promise<any> {
    const response = await this.generateContent(prompt, {
      ...options,
      responseMimeType: 'application/json',
      responseSchema: schema,
    });

    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse JSON response:', response);
      throw new Error('Failed to parse Gemini JSON response');
    }
  }

  /**
   * Stream content (for future use)
   */
  async *streamContent(
    prompt: string,
    options?: GenerateContentOptions
  ): AsyncGenerator<string> {
    // Streaming not yet implemented in Workers
    // For now, return full response
    const response = await this.generateContent(prompt, options);
    yield response;
  }
}

/**
 * Create a singleton instance
 */
let geminiInstance: GeminiService | null = null;

export function initGemini(apiKey: string): GeminiService {
  if (!geminiInstance) {
    geminiInstance = new GeminiService(apiKey);
  }
  return geminiInstance;
}

export function getGemini(apiKey: string): GeminiService {
  return new GeminiService(apiKey);
}

