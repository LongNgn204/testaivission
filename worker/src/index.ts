/**
 * ============================================================
 * 🚀 Cloudflare Worker - Vision Coach Backend
 * ============================================================
 * 
 * Entry point for all API endpoints
 * Handles routing, middleware, and request processing
 */

import { Router, IRequest } from 'itty-router';
import { generateReport } from './handlers/aiReport';
import { generateDashboardInsights } from './handlers/dashboard';
import { chat } from './handlers/chat';
import { generateRoutine } from './handlers/routine';
import { generateProactiveTip } from './handlers/proactiveTip';
import { adminAIAssistant } from './handlers/adminAssistant';
import { getAdminUsers, getAdminRecords, getAdminStats } from './handlers/admin';
import { syncPull, syncHistory, syncSettings, syncRoutine } from './handlers/sync';
import { login, verifyToken, logout } from './handlers/auth';
import { DatabaseService } from './services/database';

import { handleCors, addCorsHeaders } from './middleware/cors';
import { rateLimit } from './middleware/rateLimit';
import { validateRequest } from './middleware/validation';

// Create router
const router = Router();

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS handling
router.all('*', handleCors);

// Rate limiting
router.all('*', rateLimit);

// Request validation
router.post('*', validateRequest);

// ============================================================
// ROUTES
// ============================================================

/**
 * POST /api/auth/login
 * User login verification
 */
router.post('/api/auth/login', login);

/**
 * POST /api/auth/verify
 * Verify user token
 */
router.post('/api/auth/verify', verifyToken);

/**
 * POST /api/auth/logout
 * User logout
 */
router.post('/api/auth/logout', logout);

/**
 * POST /api/report
 * Generate AI report for a test result
 */
router.post('/api/report', generateReport);

/**
 * POST /api/dashboard
 * Generate dashboard insights from test history
 */
router.post('/api/dashboard', generateDashboardInsights);

/**
 * POST /api/chat
 * Chat with Dr. Eva
 */
router.post('/api/chat', chat);

/**
 * POST /api/routine
 * Generate personalized weekly routine
 */
router.post('/api/routine', generateRoutine);

/**
 * POST /api/proactive-tip
 * Generate proactive health tip
 */
router.post('/api/proactive-tip', generateProactiveTip);

/**
 * POST /api/admin/assistant
 * AI Assistant for doctors/admins
 */
router.post('/api/admin/assistant', adminAIAssistant);

/**
 * GET /api/admin/users - Get all users from D1 database
 * GET /api/admin/records - Get all test records
 * GET /api/admin/stats - Get dashboard statistics
 */
router.get('/api/admin/users', getAdminUsers);
router.get('/api/admin/records', getAdminRecords);
router.get('/api/admin/stats', getAdminStats);

/**
 * Sync Endpoints - Frontend-Backend Data Synchronization
 */
router.post('/api/sync/pull', syncPull);
router.post('/api/sync/history', syncHistory);
router.post('/api/sync/settings', syncSettings);
router.post('/api/sync/routine', syncRoutine);

/**
 * POST /api/tts/generate
 * Generate TTS audio using backend (hides API key)
 */
router.post('/api/tts/generate', async (request: IRequest, env: any) => {
  try {
    const req = request as Request;
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

    if (!token) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify token
    const { verifyJWT } = await import('./handlers/auth');
    const decoded: any = await verifyJWT(token, env.JWT_SECRET);
    if (!decoded) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid or expired token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json() as any;
    const { text, language } = body || {};

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Text is required and must be a non-empty string',
        error: 'INVALID_TEXT'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!language || !['vi', 'en'].includes(language)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Language is required and must be "vi" or "en"',
        error: 'INVALID_LANGUAGE'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Limit text length
    const maxLength = 5000;
    if (text.length > maxLength) {
      return new Response(JSON.stringify({
        success: false,
        message: `Text too long. Maximum ${maxLength} characters allowed.`,
        error: 'TEXT_TOO_LONG'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use Google Cloud Text-to-Speech API
    const GOOGLE_TTS_API_KEY = env.GOOGLE_TTS_API_KEY || env.GEMINI_API_KEY;

    if (!GOOGLE_TTS_API_KEY) {
      // No API key - return fallback for client-side TTS
      return new Response(JSON.stringify({
        success: true,
        useFallback: true,
        message: 'Use browser TTS fallback',
        text: text.trim(),
        language: language
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Map language codes
    const languageMap: Record<string, string> = {
      vi: 'vi-VN',
      en: 'en-US',
    };

    const voiceMap: Record<string, string> = {
      vi: 'vi-VN-Standard-A',
      en: 'en-US-Standard-C',
    };

    const ttsLanguage = languageMap[language];
    const voiceName = voiceMap[language];

    // Call Google Cloud Text-to-Speech API
    const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`;

    const ttsRequest = {
      input: { text: text.trim() },
      voice: {
        languageCode: ttsLanguage,
        name: voiceName,
        ssmlGender: 'FEMALE' as const,
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: 1.0,
        pitch: 0,
        volumeGainDb: 0,
      },
    };

    const ttsResponse = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ttsRequest),
    });

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.json().catch(() => ({}));
      console.error('Google TTS API error:', errorData);
      // Return success with fallback flag - client will use browser TTS
      return new Response(JSON.stringify({
        success: true,
        useFallback: true,
        message: 'Use browser TTS fallback',
        text: text.trim(),
        language: language
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ttsData = await ttsResponse.json() as any;
    const audioContent = ttsData.audioContent;

    if (!audioContent) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No audio content received from TTS service',
        error: 'NO_AUDIO_CONTENT'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      audioContent,
      format: 'mp3',
      language,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('TTS generation error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to generate TTS',
      error: error?.message || 'UNKNOWN'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

/**
 * POST /api/tests/save
 * Save test result (D1 Database)
 */
router.post('/api/tests/save', async (request: IRequest, env: any) => {
  try {
    const auth = (request as Request).headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Verify token
    const { verifyJWT } = await import('./handlers/auth');
    const decoded: any = await verifyJWT(token, env.JWT_SECRET);
    if (!decoded) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid or expired token' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await (request as Request).json() as any;
    const { testType, testData, score, result, duration } = body || {};
    if (!testType || !testData) {
      return new Response(JSON.stringify({ success: false, message: 'Missing required fields: testType, testData' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Save to D1
    const db = new DatabaseService(env.DB);
    const testResult = await db.saveTestResult({
      user_id: decoded.userId,
      test_type: testType,
      test_data: JSON.stringify(testData),
      score,
      result,
      duration,
    });

    // Track analytics
    await db.trackEvent('test_completed', decoded.userId, { testType, score });

    return new Response(JSON.stringify({
      success: true,
      message: 'Test result saved',
      testResult: {
        id: testResult.id,
        testType: testResult.test_type,
        score: testResult.score,
        result: testResult.result,
        timestamp: testResult.created_at,
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, message: 'Failed to save test result', error: error?.message || 'UNKNOWN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});

/**
 * GET /api/tests/history
 * Get paginated test history (D1 Database)
 */
router.get('/api/tests/history', async (request: IRequest, env: any) => {
  try {
    const req = request as Request;
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const { verifyJWT } = await import('./handlers/auth');
    const decoded: any = await verifyJWT(token, env.JWT_SECRET);
    if (!decoded) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid or expired token' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 1000);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);

    const db = new DatabaseService(env.DB);
    const { tests, total } = await db.getUserTestHistory(decoded.userId, limit, offset);

    // Transform data for response
    const history = tests.map(test => ({
      id: test.id,
      testType: test.test_type,
      testData: JSON.parse(test.test_data),
      score: test.score,
      result: test.result,
      timestamp: test.created_at,
      duration: test.duration,
    }));

    return new Response(JSON.stringify({
      success: true,
      message: 'Test history retrieved',
      history,
      total,
      limit,
      offset
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, message: 'Failed to get test history', history: [], error: error?.message || 'UNKNOWN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});

// ============================================================
// SYNC ENDPOINTS
// ============================================================

/**
 * POST /api/sync/history
 * Sync test history from frontend to backend
 */
router.post('/api/sync/history', async (request: IRequest, env: any) => {
  try {
    const req = request as Request;
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

    if (!token) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }

    const { verifyJWT } = await import('./handlers/auth');
    const decoded: any = await verifyJWT(token, env.JWT_SECRET);
    if (!decoded) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid or expired token' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json() as any;
    const { history, lastSyncTimestamp } = body || {};

    if (!Array.isArray(history)) {
      return new Response(JSON.stringify({ success: false, message: 'history must be an array' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = new DatabaseService(env.DB);
    let syncedCount = 0;
    const errors: string[] = [];

    for (const item of history) {
      try {
        // Check if test already exists (by timestamp to avoid duplicates)
        const existing = await db.getTestResultByTimestamp(decoded.userId, item.timestamp);

        if (!existing) {
          await db.saveTestResult({
            user_id: decoded.userId,
            test_type: item.testType,
            test_data: JSON.stringify(item.testData || item.results || {}),
            score: item.score,
            result: item.result,
            duration: item.duration,
            created_at: item.timestamp,
          });
          syncedCount++;
        }
      } catch (err: any) {
        errors.push(`Failed to sync item: ${err?.message}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Synced ${syncedCount} items`,
      syncedCount,
      errors: errors.length > 0 ? errors : undefined,
      lastSyncTimestamp: new Date().toISOString(),
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, message: 'Sync failed', error: error?.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
});

/**
 * POST /api/sync/settings
 * Sync user settings
 */
router.post('/api/sync/settings', async (request: IRequest, env: any) => {
  try {
    const req = request as Request;
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

    if (!token) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }

    const { verifyJWT } = await import('./handlers/auth');
    const decoded: any = await verifyJWT(token, env.JWT_SECRET);
    if (!decoded) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid or expired token' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json() as any;
    const { settings } = body || {};

    if (!settings || typeof settings !== 'object') {
      return new Response(JSON.stringify({ success: false, message: 'settings object required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = new DatabaseService(env.DB);

    await db.saveUserSettings({
      user_id: decoded.userId,
      language: settings.language || 'vi',
      theme: settings.theme || 'light',
      notifications_enabled: settings.notifications ?? true,
      voice_enabled: settings.voiceEnabled ?? true,
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Settings synced successfully',
      lastSyncTimestamp: new Date().toISOString(),
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, message: 'Sync failed', error: error?.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
});

/**
 * POST /api/sync/routine
 * Sync weekly routine
 */
router.post('/api/sync/routine', async (request: IRequest, env: any) => {
  try {
    const req = request as Request;
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

    if (!token) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }

    const { verifyJWT } = await import('./handlers/auth');
    const decoded: any = await verifyJWT(token, env.JWT_SECRET);
    if (!decoded) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid or expired token' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json() as any;
    const { routine } = body || {};

    if (!routine || typeof routine !== 'object') {
      return new Response(JSON.stringify({ success: false, message: 'routine object required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = new DatabaseService(env.DB);

    await db.saveRoutine({
      user_id: decoded.userId,
      routine_data: JSON.stringify(routine),
      is_active: true,
      start_date: routine.startDate || new Date().toISOString(),
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Routine synced successfully',
      lastSyncTimestamp: new Date().toISOString(),
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, message: 'Sync failed', error: error?.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
});

/**
 * GET /api/sync/pull
 * Pull all user data from backend
 */
router.get('/api/sync/pull', async (request: IRequest, env: any) => {
  try {
    const req = request as Request;
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

    if (!token) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }

    const { verifyJWT } = await import('./handlers/auth');
    const decoded: any = await verifyJWT(token, env.JWT_SECRET);
    if (!decoded) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid or expired token' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = new DatabaseService(env.DB);

    // Get all user data
    const [historyResult, settings, routine] = await Promise.all([
      db.getUserTestHistory(decoded.userId, 1000, 0),
      db.getUserSettings(decoded.userId),
      db.getActiveRoutine(decoded.userId),
    ]);

    // Transform history
    const history = historyResult.tests.map(test => ({
      id: test.id,
      testType: test.test_type,
      testData: JSON.parse(test.test_data || '{}'),
      score: test.score,
      result: test.result,
      timestamp: test.created_at,
      duration: test.duration,
    }));

    return new Response(JSON.stringify({
      success: true,
      data: {
        history,
        settings: settings ? {
          language: settings.language,
          theme: settings.theme,
          notifications: settings.notifications_enabled,
        } : null,
        routine: routine ? JSON.parse(routine.routine_data || '{}') : null,
      },
      lastSyncTimestamp: new Date().toISOString(),
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, message: 'Pull failed', error: error?.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', () => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

/**
 * GET /metrics
 * Basic metrics endpoint
 */
router.get('/metrics', (_request: IRequest, _env: any) => {
  return new Response(
    JSON.stringify({
      uptime: 'N/A',
      requests: 'See Cloudflare Analytics',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

/**
 * 404 Handler
 */
router.all('*', () => {
  return new Response(
    JSON.stringify({
      error: 'Not Found',
      message: 'The requested endpoint does not exist',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

// ============================================================
// ERROR HANDLER
// ============================================================

export default {
  async fetch(request: Request, env: any, ctx: any) {
    try {
      const response = await router.handle(request, env, ctx);
      return addCorsHeaders(response);
    } catch (error: any) {
      console.error('Worker error:', error);
      return addCorsHeaders(
        new Response(
          JSON.stringify({
            error: 'Internal Server Error',
            message: error.message,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    }
  },
};

