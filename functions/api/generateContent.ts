/**
 * Cloudflare Pages Function - AI Content Generation Proxy
 * This function proxies requests to Google Gemini API
 * API Key is stored securely on Cloudflare (not exposed to client)
 */

interface RequestBody {
  model: string;
  contents: string;
  config?: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
    responseSchema?: any;
  };
}

export const onRequest: PagesFunction = async (context) => {
  const { request, env } = context;

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await request.json();
    const apiKey = env.GEMINI_API_KEY as string;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured on server' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Build the request to Google Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${body.model}:generateContent?key=${apiKey}`;

    // Normalize generation config to include both camelCase and snake_case keys
    const cfg: any = body.config || {};
    const generationConfig: Record<string, any> = { ...cfg };
    if (cfg.responseMimeType) generationConfig.response_mime_type = cfg.responseMimeType;
    if (cfg.responseSchema) generationConfig.response_schema = cfg.responseSchema;
    if (cfg.maxOutputTokens !== undefined) generationConfig.max_output_tokens = cfg.maxOutputTokens;
    if (cfg.topP !== undefined) generationConfig.top_p = cfg.topP;
    if (cfg.topK !== undefined) generationConfig.top_k = cfg.topK;

    const geminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: body.contents },
          ],
        },
      ],
      generationConfig,
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return new Response(JSON.stringify({
        error: data.error || data,
        request: geminiRequest,
      }), {
        status: response.status,
        headers: corsHeaders,
      });
    }

    // Extract text from response
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(
      JSON.stringify({
        text,
        candidates: data.candidates,
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};

