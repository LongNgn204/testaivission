/**
 * ============================================================
 * ✅ Request Validation Middleware
 * ============================================================
 * 
 * Validates incoming requests
 */

export async function validateRequest(
  request: Request
): Promise<Response | undefined> {
  // Only validate POST requests
  if (request.method !== 'POST') {
    return;
  }

  // Check Content-Type
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return new Response(
      JSON.stringify({
        error: 'Invalid Content-Type',
        expected: 'application/json',
        received: contentType,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Validate JSON body
  try {
    const body = await request.clone().json();
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON body',
          message: 'Body must be a valid JSON object',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Invalid JSON',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

