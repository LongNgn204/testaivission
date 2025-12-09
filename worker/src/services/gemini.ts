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
  model?: string;  // Override model (default: gemini-2.5-flash for text)
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
  // Direct Gemini API URL
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  // Cloudflare AI Gateway URL (optional, for bypassing region restrictions)
  private gatewayUrl: string | null = null;

  constructor(apiKey: string, gatewayConfig?: { accountId?: string; gatewayName?: string }) {
    this.apiKey = apiKey;
    this.config = {
      apiKey,
      model: 'gemini-2.5-flash',  // Default to Flash for text generation
      temperature: 0.3,
      maxTokens: 4000,
      topP: 0.8,
      topK: 40,
    };

    // Configure Cloudflare AI Gateway if provided
    if (gatewayConfig?.accountId && gatewayConfig?.gatewayName) {
      this.gatewayUrl = `https://gateway.ai.cloudflare.com/v1/${gatewayConfig.accountId}/${gatewayConfig.gatewayName}/google-ai-studio`;
      console.log('Using Cloudflare AI Gateway for Gemini API');
    }
  }

  /**
   * Generate content using Gemini API (via Cloudflare AI Gateway if configured)
   */
  async generateContent(
    prompt: string,
    options?: GenerateContentOptions
  ): Promise<string> {
    const startTime = Date.now();

    try {
      const model = options?.model || this.config.model;

      // Use Cloudflare AI Gateway URL if configured, otherwise direct Gemini API
      let url: string;
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };

      if (this.gatewayUrl) {
        // Cloudflare AI Gateway format - uses v1beta for Gemini
        url = `${this.gatewayUrl}/v1beta/models/${model}:generateContent`;
        headers['x-goog-api-key'] = this.apiKey;
      } else {
        // Direct Gemini API format
        url = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;
      }

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
        headers,
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

export interface GatewayConfig {
  accountId?: string;
  gatewayName?: string;
}

export function initGemini(apiKey: string, gatewayConfig?: GatewayConfig): GeminiService {
  if (!geminiInstance) {
    geminiInstance = new GeminiService(apiKey, gatewayConfig);
  }
  return geminiInstance;
}

export function getGemini(apiKey: string, gatewayConfig?: GatewayConfig): GeminiService {
  return new GeminiService(apiKey, gatewayConfig);
}

/**
 * Create GeminiService from environment (helper for handlers)
 */
export function createGeminiFromEnv(env: any): GeminiService {
  return new GeminiService(env.GEMINI_API_KEY, {
    accountId: env.CF_AI_GATEWAY_ACCOUNT_ID,
    gatewayName: env.CF_AI_GATEWAY_NAME,
  });
}
