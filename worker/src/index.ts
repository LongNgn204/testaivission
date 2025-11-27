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
import { login, verifyToken, logout } from './handlers/auth';
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
router.get('/metrics', (request: IRequest, env: any) => {
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

