/**
 * ============================================================
 * 🚀 Vision Coach Backend - Cloudflare Workers Edition
 * ============================================================
 * 
 * Cloudflare Workers backend for Vision Coach application
 * Handles authentication, AI reports, and user data
 * 
 * FEATURES:
 * - JWT Authentication with secure token management
 * - Rate limiting using Cloudflare KV (optional)
 * - Session management
 * - AI-powered reports via Gemini API
 * - CORS handling
 * - Global edge deployment
 */

// In-memory storage (reset on deployment, use KV/Durable Objects for persistence)
const db = {
  users: new Map(),
  sessions: new Map(),
  loginHistory: new Map(),
};

/**
 * Main fetch handler
 */
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  },
};

/**
 * Handle incoming requests
 */
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Sẽ được cập nhật với domain cụ thể
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  // Handle preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let response;

    // Route handling
    if (path === '/health' && method === 'GET') {
      response = handleHealth(request, env);
    } else if (path === '/metrics' && method === 'GET') {
      response = handleMetrics(request, env);
    } else if (path === '/api/auth/login' && method === 'POST') {
      response = await handleLogin(request, env);
    } else if (path === '/api/auth/verify' && method === 'POST') {
      response = await handleVerify(request, env);
    } else if (path === '/api/auth/logout' && method === 'POST') {
      response = await handleLogout(request, env);
    } else if (path === '/api/report' && method === 'POST') {
      response = await handleReport(request, env);
    } else if (path === '/api/dashboard' && method === 'POST') {
      response = await handleDashboard(request, env);
    } else if (path === '/api/chat' && method === 'POST') {
      response = await handleChat(request, env);
    } else if (path === '/api/routine' && method === 'POST') {
      response = await handleRoutine(request, env);
    } else if (path === '/api/proactive-tip' && method === 'POST') {
      response = await handleProactiveTip(request, env);
    } else {
      response = new Response(
        JSON.stringify({
          success: false,
          message: 'Endpoint not found',
          path,
          method,
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Add CORS headers to response
    const headers = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error('Worker error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Health check endpoint
 */
function handleHealth(request, env) {
  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '2.0.0-cloudflare',
      worker: 'vision-coach-backend',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Metrics endpoint
 */
function handleMetrics(request, env) {
  return new Response(
    JSON.stringify({
      activeUsers: db.users.size,
      activeSessions: db.sessions.size,
      totalLogins: Array.from(db.loginHistory.values()).reduce(
        (sum, arr) => sum + arr.length,
        0
      ),
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Login handler
 */
async function handleLogin(request, env) {
  try {
    const body = await request.json();
    const { name, age, phone } = body;

    // Validate input
    if (!name || !age || !phone) {
      return jsonResponse(
        {
          success: false,
          message: 'Missing required fields: name, age, phone',
          error: 'MISSING_FIELDS',
        },
        400
      );
    }

    // Validate name
    if (name.trim().length < 2) {
      return jsonResponse(
        {
          success: false,
          message: 'Name must be at least 2 characters',
          error: 'INVALID_NAME',
        },
        400
      );
    }

    // Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 5 || ageNum > 120) {
      return jsonResponse(
        {
          success: false,
          message: 'Age must be between 5 and 120',
          error: 'INVALID_AGE',
        },
        400
      );
    }

    // Validate phone format (Vietnamese)
    const phoneClean = phone.replace(/\D/g, '');
    if (!/^0\d{9,10}$/.test(phoneClean)) {
      return jsonResponse(
        {
          success: false,
          message: 'Invalid phone number format (Vietnamese format required)',
          error: 'INVALID_PHONE',
        },
        400
      );
    }

    // Create user
    const userId = `user_${phoneClean}`;
    const now = Date.now();
    const existing = db.users.get(userId);

    const userData = {
      id: userId,
      name: name.trim(),
      age: age.trim(),
      phone: phoneClean,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      lastLogin: now,
      loginCount: (existing?.loginCount || 0) + 1,
    };

    db.users.set(userId, userData);

    // Track login history
    if (!db.loginHistory.has(userId)) {
      db.loginHistory.set(userId, []);
    }
    db.loginHistory.get(userId).push({
      timestamp: now,
      ip: request.headers.get('CF-Connecting-IP') || 'unknown',
    });

    // Generate token
    const token = await generateToken(userId, userData, env);

    // Create session
    db.sessions.set(token, {
      userId,
      createdAt: now,
      lastAccess: now,
      expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return jsonResponse({
      success: true,
      message: 'Login successful',
      user: {
        id: userId,
        name: userData.name,
        age: userData.age,
        phone: userData.phone,
        loginTime: userData.lastLogin,
        loginCount: userData.loginCount,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return jsonResponse(
      {
        success: false,
        message: 'Login failed',
        error: error.message,
      },
      500
    );
  }
}

/**
 * Verify token handler
 */
async function handleVerify(request, env) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return jsonResponse(
        {
          success: false,
          message: 'Token is required',
        },
        400
      );
    }

    const decoded = await verifyToken(token, env);
    if (!decoded) {
      return jsonResponse(
        {
          success: false,
          message: 'Invalid or expired token',
        },
        403
      );
    }

    const session = db.sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      db.sessions.delete(token);
      return jsonResponse(
        {
          success: false,
          message: 'Session expired',
        },
        403
      );
    }

    // Update last access
    session.lastAccess = Date.now();

    const user = db.users.get(session.userId);
    if (!user) {
      return jsonResponse(
        {
          success: false,
          message: 'User not found',
        },
        404
      );
    }

    return jsonResponse({
      success: true,
      message: 'Token is valid',
      user: {
        userId: user.id,
        name: user.name,
        phone: user.phone,
        age: user.age,
        loginCount: user.loginCount,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Verify error:', error);
    return jsonResponse(
      {
        success: false,
        message: 'Token verification failed',
        error: error.message,
      },
      500
    );
  }
}

/**
 * Logout handler
 */
async function handleLogout(request, env) {
  try {
    const body = await request.json();
    const { token } = body;

    if (token) {
      db.sessions.delete(token);
    }

    return jsonResponse({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        message: 'Logout failed',
        error: error.message,
      },
      500
    );
  }
}

/**
 * AI Report handler
 */
async function handleReport(request, env) {
  try {
    const auth = await authenticateRequest(request, env);
    if (!auth.success) {
      return jsonResponse(auth, auth.status || 401);
    }

    const body = await request.json();
    const { testType, testData, history, language } = body;

    if (!testType || !testData || !language) {
      return jsonResponse(
        {
          success: false,
          message: 'Missing required fields: testType, testData, language',
        },
        400
      );
    }

    const prompt = `
You are a professional eye care specialist. Analyze the following vision test result and provide a detailed medical report.

Test Type: ${testType}
Test Data: ${JSON.stringify(testData)}
User History: ${history ? JSON.stringify(history) : 'No previous history'}
Language: ${language}

Please provide:
1. Summary of the test result
2. Key findings
3. Recommendations
4. When to see a doctor
5. Preventive measures

Format the response as JSON with fields: summary, findings, recommendations, doctorVisit, preventiveMeasures
`;

    const aiResponse = await callGeminiAPI(prompt, env);

    return jsonResponse({
      success: true,
      id: `report_${Date.now()}`,
      testType,
      timestamp: new Date().toISOString(),
      language,
      ...aiResponse,
    });
  } catch (error) {
    console.error('Report error:', error);
    return jsonResponse(
      {
        success: false,
        message: 'Failed to generate report',
        error: error.message,
      },
      500
    );
  }
}

/**
 * Dashboard handler
 */
async function handleDashboard(request, env) {
  try {
    const auth = await authenticateRequest(request, env);
    if (!auth.success) {
      return jsonResponse(auth, auth.status || 401);
    }

    const body = await request.json();
    const { testHistory, language } = body;

    const prompt = `
Analyze the following vision test history and provide comprehensive dashboard insights.

Test History: ${JSON.stringify(testHistory || [])}
Language: ${language}

Please provide:
1. Overall vision health status
2. Trends and patterns
3. Key metrics summary
4. Recommendations for improvement
5. Risk factors to monitor

Format as JSON with fields: status, trends, metrics, recommendations, riskFactors
`;

    const aiResponse = await callGeminiAPI(prompt, env);

    return jsonResponse({
      success: true,
      timestamp: new Date().toISOString(),
      language,
      ...aiResponse,
    });
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        message: 'Failed to generate dashboard insights',
        error: error.message,
      },
      500
    );
  }
}

/**
 * Chat handler
 */
async function handleChat(request, env) {
  try {
    const auth = await authenticateRequest(request, env);
    if (!auth.success) {
      return jsonResponse(auth, auth.status || 401);
    }

    const body = await request.json();
    const { message, language, context } = body;

    const systemPrompt =
      language === 'vi'
        ? 'Bạn là Dr. Eva, một chuyên gia chăm sóc mắt thân thiện và chuyên nghiệp. Hãy trả lời các câu hỏi về sức khỏe mắt một cách chi tiết, dễ hiểu và hữu ích.'
        : 'You are Dr. Eva, a friendly and professional eye care specialist. Answer questions about eye health in detail, clearly, and helpfully.';

    const prompt = `${systemPrompt}

User message: ${message}
${context ? `Context: ${JSON.stringify(context)}` : ''}

Provide a helpful and professional response in ${language === 'vi' ? 'Vietnamese' : 'English'}.`;

    const aiResponse = await callGeminiAPI(prompt, env);

    return jsonResponse({
      success: true,
      message: aiResponse.text || aiResponse.summary || 'Response received',
      timestamp: new Date().toISOString(),
      language,
    });
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        message: 'Failed to process chat',
        error: error.message,
      },
      500
    );
  }
}

/**
 * Routine handler
 */
async function handleRoutine(request, env) {
  try {
    const auth = await authenticateRequest(request, env);
    if (!auth.success) {
      return jsonResponse(auth, auth.status || 401);
    }

    const body = await request.json();
    const { userProfile, testResults, language } = body;

    const prompt = `
Create a personalized weekly eye care routine based on the following information.

User Profile: ${JSON.stringify(userProfile || {})}
Test Results: ${JSON.stringify(testResults || [])}
Language: ${language}

Please provide:
1. Daily eye care schedule
2. Recommended exercises
3. Screen time management
4. Nutrition recommendations
5. Weekly checkpoints

Format as JSON with fields: dailySchedule, exercises, screenTime, nutrition, checkpoints
`;

    const aiResponse = await callGeminiAPI(prompt, env);

    return jsonResponse({
      success: true,
      timestamp: new Date().toISOString(),
      language,
      ...aiResponse,
    });
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        message: 'Failed to generate routine',
        error: error.message,
      },
      500
    );
  }
}

/**
 * Proactive tip handler
 */
async function handleProactiveTip(request, env) {
  try {
    const auth = await authenticateRequest(request, env);
    if (!auth.success) {
      return jsonResponse(auth, auth.status || 401);
    }

    const body = await request.json();
    const { userProfile, language } = body;

    const prompt = `
Generate a personalized eye health tip for today.

User Profile: ${JSON.stringify(userProfile || {})}
Language: ${language}

Provide a single, actionable, and relevant eye health tip in ${language === 'vi' ? 'Vietnamese' : 'English'}.
Keep it concise (2-3 sentences) and practical.`;

    const aiResponse = await callGeminiAPI(prompt, env);

    return jsonResponse({
      success: true,
      tip: aiResponse.text || aiResponse.summary || 'Take care of your eyes!',
      timestamp: new Date().toISOString(),
      language,
    });
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        message: 'Failed to generate tip',
        error: error.message,
      },
      500
    );
  }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Generate JWT token (simplified for Workers)
 */
async function generateToken(userId, userData, env) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    userId,
    name: userData.name,
    phone: userData.phone,
    age: userData.age,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const secret = env.JWT_SECRET || 'vision-coach-secret-key';

  const signature = await signHMAC(
    `${encodedHeader}.${encodedPayload}`,
    secret
  );
  const encodedSignature = base64UrlEncode(signature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Verify JWT token
 */
async function verifyToken(token, env) {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
    const secret = env.JWT_SECRET || 'vision-coach-secret-key';

    const expectedSignature = await signHMAC(
      `${encodedHeader}.${encodedPayload}`,
      secret
    );
    const expectedEncodedSignature = base64UrlEncode(expectedSignature);

    if (encodedSignature !== expectedEncodedSignature) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Authenticate request
 */
async function authenticateRequest(request, env) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return { success: false, message: 'No token provided', status: 401 };
  }

  const decoded = await verifyToken(token, env);
  if (!decoded) {
    return { success: false, message: 'Invalid or expired token', status: 403 };
  }

  return { success: true, user: decoded };
}

/**
 * Call Gemini API
 */
async function callGeminiAPI(prompt, env) {
  try {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Try to parse JSON from response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If not JSON, return as text
    }

    return { text, summary: text };
  } catch (error) {
    console.error('Gemini API error:', error);
    return { text: 'Error generating response', summary: 'Error' };
  }
}

/**
 * HMAC signature
 */
async function signHMAC(data, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const dataBuffer = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, dataBuffer);
  return new Uint8Array(signature);
}

/**
 * Base64 URL encoding
 */
function base64UrlEncode(data) {
  if (typeof data === 'string') {
    data = new TextEncoder().encode(data);
  }

  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Base64 URL decoding
 */
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

/**
 * JSON response helper
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
