/**
 * Cloudflare Pages Function - AI Content Generation Stream Proxy
 * This function proxies streaming requests to Google Gemini API
 * API Key is stored securely on Cloudflare (not exposed to client)
 */

interface RequestBody {
  model: string;
  contents: string;
  config?: {
    temperature?: number;
    maxOutputTokens?: number;
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

    // Build the request to Google Gemini API with streaming
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${body.model}:streamGenerateContent?key=${apiKey}`;

    const geminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: body.contents,
            },
          ],
        },
      ],
      generationConfig: body.config ?? {},
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini API error:', error);
      return new Response(JSON.stringify(error), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stream the response back to client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

