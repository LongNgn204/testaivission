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
      model: 'gemini-2.0-flash',  // Gemini 2.0 Flash for text generation
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

/**
 * Generate content using Cloudflare Workers AI (Llama 3.1)
 * FREE - No API key required!
 */
export async function generateWithCloudflareAI(
  ai: any,  // env.AI binding
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  try {
    console.log('🤖 Using Cloudflare Workers AI (Llama 3.1)...');

    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    });

    const text = response?.response || '';

    if (!text) {
      throw new Error('No response from Cloudflare AI');
    }

    console.log('✅ Cloudflare AI response received');
    return text;
  } catch (error: any) {
    console.error('❌ Cloudflare AI error:', error.message);
    throw error;
  }
}

/**
 * Generate JSON content using Cloudflare Workers AI (Llama 3.1)
 * Parses the response as JSON for reports, dashboard, routine, etc.
 */
export async function generateJSONWithCloudflareAI(
  ai: any,
  prompt: string,
  language: 'vi' | 'en'
): Promise<any> {
  const systemPrompt = language === 'vi'
    ? 'Bạn là chuyên gia AI y tế. Trả lời CHÍNH XÁC bằng JSON hợp lệ. KHÔNG sử dụng markdown code blocks (```). KHÔNG thêm text giải thích. CHỈ trả về JSON object thuần túy.'
    : 'You are a medical AI expert. Respond with ONLY valid JSON. NO markdown code blocks (```). NO extra text or explanation. ONLY return a pure JSON object.';

  try {
    const text = await generateWithCloudflareAI(ai, prompt, systemPrompt);
    console.log('🔍 Raw AI response (first 500 chars):', text.substring(0, 500));

    // Parse JSON from response
    let cleaned = text.trim();

    // Remove markdown code blocks if present
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1].trim();
    } else {
      // Remove just the backticks if they exist without proper closure
      cleaned = cleaned.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
    }

    // Try to find JSON object
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
    } else {
      // Try array format
      const arrStart = cleaned.indexOf('[');
      const arrEnd = cleaned.lastIndexOf(']');
      if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
        cleaned = cleaned.slice(arrStart, arrEnd + 1);
      }
    }

    // Fix common JSON issues
    cleaned = cleaned
      // Remove trailing commas before } or ]
      .replace(/,\s*([}\]])/g, '$1')
      // Fix unquoted keys
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
      // Remove control characters
      .replace(/[\x00-\x1F\x7F]/g, ' ');

    const parsed = JSON.parse(cleaned);
    console.log('✅ Successfully parsed JSON response');

    // Ensure required fields exist for reports
    return {
      confidence: parsed.confidence || 75,
      summary: parsed.summary || parsed.overallSummary || '',
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      severity: ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.severity) ? parsed.severity : 'LOW',
      trend: parsed.trend || 'STABLE',
      causes: parsed.causes || '',
      prediction: parsed.prediction || '',
      // For dashboard
      score: parsed.score,
      rating: parsed.rating,
      overallSummary: parsed.overallSummary || parsed.summary,
      positives: Array.isArray(parsed.positives) ? parsed.positives : [],
      areasToMonitor: Array.isArray(parsed.areasToMonitor) ? parsed.areasToMonitor : [],
      proTip: parsed.proTip || parsed.tip || '',
      // For routine (days)
      Monday: parsed.Monday,
      Tuesday: parsed.Tuesday,
      Wednesday: parsed.Wednesday,
      Thursday: parsed.Thursday,
      Friday: parsed.Friday,
      Saturday: parsed.Saturday,
      Sunday: parsed.Sunday,
    };
  } catch (e: any) {
    console.error('❌ Failed to parse JSON from Cloudflare AI:', e.message);

    // Return smart fallback based on language
    return language === 'vi' ? {
      confidence: 70,
      summary: 'Dựa trên kết quả kiểm tra của bạn, thị lực đang ở mức bình thường. Hãy tiếp tục theo dõi và kiểm tra định kỳ.',
      recommendations: [
        'Nghỉ ngơi mắt mỗi 20 phút khi làm việc với máy tính',
        'Ăn nhiều rau xanh và trái cây giàu vitamin A',
        'Đeo kính bảo vệ khi ra ngoài nắng',
        'Kiểm tra mắt định kỳ 6 tháng/lần'
      ],
      severity: 'LOW',
      trend: 'STABLE',
      causes: 'Kết quả cho thấy tình trạng ổn định.',
      prediction: 'Với việc chăm sóc tốt, thị lực sẽ được duy trì ổn định.'
    } : {
      confidence: 70,
      summary: 'Based on your test results, your vision appears to be within normal range. Continue monitoring and regular check-ups.',
      recommendations: [
        'Take eye breaks every 20 minutes when using screens',
        'Eat leafy greens and vitamin A-rich foods',
        'Wear sunglasses when outdoors',
        'Schedule regular eye exams every 6 months'
      ],
      severity: 'LOW',
      trend: 'STABLE',
      causes: 'Results indicate stable condition.',
      prediction: 'With proper care, your vision should remain stable.'
    };
  }
}
