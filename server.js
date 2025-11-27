/**
 * ============================================================
 * 🚀 Vision Coach Backend Server - Enhanced Edition
 * ============================================================
 * 
 * Express.js server for Vision Coach application
 * Handles authentication, AI reports, and user data
 * 
 * FEATURES:
 * - JWT Authentication with secure token management
 * - Rate limiting for security
 * - Session management with expiration
 * - Request logging and monitoring
 * - In-memory database simulation (for demo)
 * - AI-powered reports and insights
 * - CORS protection
 * - Error handling middleware
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'vision-coach-secret-key-change-in-production-2024';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.VITE_API_KEY;

// ============================================================
// MIDDLEWARE
// ============================================================

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000,http://localhost:5174')
  .split(',')
  .map((s) => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser clients
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware with colors
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  console.log(`\x1b[36m[${timestamp}]\x1b[0m \x1b[33m${method}\x1b[0m ${path}`);
  next();
});

// Rate limiting simulation (in-memory)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

function rateLimiter(req, res, next) {
  const clientId = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(clientId)) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientData = rateLimitMap.get(clientId);
  
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  }
  
  clientData.count++;
  next();
}

app.use(rateLimiter);

// ============================================================
// UTILITIES
// ============================================================

/**
 * Generate JWT token
 */
function generateToken(userId, userData) {
  return jwt.sign(
    {
      userId,
      ...userData,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware to verify token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }

  req.user = decoded;
  next();
}

// In-memory storage for demo (replace with database in production)
const users = new Map();
const sessions = new Map();
const loginHistory = new Map(); // Track login history

// Enhanced database simulation
const db = {
  users,
  sessions,
  loginHistory,
  
  // User operations
  createOrUpdateUser(userId, userData) {
    const existing = users.get(userId);
    const now = Date.now();
    
    const user = {
      ...userData,
      id: userId,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      lastLogin: now,
      loginCount: (existing?.loginCount || 0) + 1,
    };
    
    users.set(userId, user);
    
    // Track login history
    if (!loginHistory.has(userId)) {
      loginHistory.set(userId, []);
    }
    loginHistory.get(userId).push({
      timestamp: now,
      ip: userData.ip || 'unknown',
    });
    
    return user;
  },
  
  getUserById(userId) {
    return users.get(userId);
  },
  
  // Session operations
  createSession(token, sessionData) {
    sessions.set(token, {
      ...sessionData,
      createdAt: Date.now(),
      lastAccess: Date.now(),
    });
  },
  
  getSession(token) {
    const session = sessions.get(token);
    if (session) {
      session.lastAccess = Date.now();
    }
    return session;
  },
  
  deleteSession(token) {
    return sessions.delete(token);
  },
  
  // Clean expired sessions
  cleanExpiredSessions() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [token, session] of sessions.entries()) {
      if (session.expiresAt < now) {
        sessions.delete(token);
        cleaned++;
      }
    }
    
    return cleaned;
  },
  
  // Get stats
  getStats() {
    return {
      totalUsers: users.size,
      activeSessions: sessions.size,
      totalLogins: Array.from(loginHistory.values()).reduce((sum, arr) => sum + arr.length, 0),
    };
  },
};

// Auto cleanup expired sessions every 5 minutes
setInterval(() => {
  const cleaned = db.cleanExpiredSessions();
  if (cleaned > 0) {
    console.log(`\x1b[32m✓ Cleaned ${cleaned} expired sessions\x1b[0m`);
  }
}, 5 * 60 * 1000);

// ============================================================
// ROUTES - HEALTH CHECK
// ============================================================

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

/**
 * GET /metrics
 * Basic metrics endpoint
 */
app.get('/metrics', (req, res) => {
  const stats = db.getStats();
  
  res.json({
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    activeUsers: stats.totalUsers,
    activeSessions: stats.activeSessions,
    totalLogins: stats.totalLogins,
    timestamp: new Date().toISOString(),
    rateLimit: {
      activeClients: rateLimitMap.size,
    },
  });
});

// ============================================================
// ROUTES - AUTHENTICATION
// ============================================================

/**
 * POST /api/auth/login
 * User login with enhanced security
 */
app.post('/api/auth/login', (req, res) => {
  try {
    const { name, age, phone } = req.body;

    // Validate input
    if (!name || !age || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, age, phone',
        error: 'MISSING_FIELDS',
      });
    }

    // Validate name
    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters',
        error: 'INVALID_NAME',
      });
    }

    // Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 5 || ageNum > 120) {
      return res.status(400).json({
        success: false,
        message: 'Age must be between 5 and 120',
        error: 'INVALID_AGE',
      });
    }

    // Validate phone format (Vietnamese phone numbers)
    const phoneClean = phone.replace(/\D/g, '');
    if (!/^0\d{9,10}$/.test(phoneClean)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format (Vietnamese format required)',
        error: 'INVALID_PHONE',
      });
    }

    // Create or update user
    const userId = `user_${phoneClean}`;
    const userData = db.createOrUpdateUser(userId, {
      name: name.trim(),
      age: age.trim(),
      phone: phoneClean,
      ip: req.ip || req.connection.remoteAddress,
    });

    // Generate token
    const token = generateToken(userId, {
      name: userData.name,
      phone: userData.phone,
      age: userData.age,
    });

    // Store session
    db.createSession(token, {
      userId,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    console.log(`\x1b[32m✓ User logged in: ${userData.name} (${userId})\x1b[0m`);

    res.json({
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
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/verify
 * Verify user token with enhanced checks
 */
app.post('/api/auth/verify', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    const session = db.getSession(token);
    if (!session || session.expiresAt < Date.now()) {
      db.deleteSession(token);
      return res.status(403).json({
        success: false,
        message: 'Session expired',
      });
    }

    // Get user data
    const user = db.getUserById(session.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        userId: decoded.userId,
        name: user.name,
        phone: user.phone,
        age: user.age,
        loginCount: user.loginCount,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/logout
 * User logout with session cleanup
 */
app.post('/api/auth/logout', (req, res) => {
  try {
    const { token } = req.body;
    const authHeader = req.headers['authorization'];
    const headerToken = authHeader && authHeader.split(' ')[1];
    
    const tokenToDelete = token || headerToken;

    if (tokenToDelete) {
      const session = db.getSession(tokenToDelete);
      if (session) {
        db.deleteSession(tokenToDelete);
        console.log(`\x1b[33m✓ User logged out: ${session.userId}\x1b[0m`);
      }
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message,
    });
  }
});

// ============================================================
// ROUTES - AI SERVICES
// ============================================================

/**
 * Initialize Gemini AI
 */
function initializeGemini() {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenerativeAI(GEMINI_API_KEY);
}

/**
 * POST /api/report
 * Generate AI report for test results
 */
app.post('/api/report', authenticateToken, async (req, res) => {
  try {
    const { testType, testData, history, language } = req.body;

    // Validate input
    if (!testType || !testData || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: testType, testData, language',
      });
    }

    if (!['vi', 'en'].includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language. Supported: vi, en',
      });
    }

    // Initialize Gemini
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create prompt
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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    let report;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        report = JSON.parse(jsonMatch[0]);
      } else {
        report = {
          summary: responseText,
          findings: [],
          recommendations: [],
          doctorVisit: 'Consult with an eye care professional',
          preventiveMeasures: [],
        };
      }
    } catch (parseError) {
      report = {
        summary: responseText,
        findings: [],
        recommendations: [],
        doctorVisit: 'Consult with an eye care professional',
        preventiveMeasures: [],
      };
    }

    res.json({
      success: true,
      id: `report_${Date.now()}`,
      testType,
      timestamp: new Date().toISOString(),
      language,
      ...report,
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message,
    });
  }
});

/**
 * POST /api/dashboard
 * Generate dashboard insights
 */
app.post('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const { testHistory, language } = req.body;

    if (!language) {
      return res.status(400).json({
        success: false,
        message: 'Language is required',
      });
    }

    if (!['vi', 'en'].includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language. Supported: vi, en',
      });
    }

    // Initialize Gemini
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let insights;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        insights = {
          status: 'Good',
          trends: [],
          metrics: {},
          recommendations: [],
          riskFactors: [],
        };
      }
    } catch (parseError) {
      insights = {
        status: 'Good',
        trends: [],
        metrics: {},
        recommendations: [],
        riskFactors: [],
      };
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      language,
      ...insights,
    });
  } catch (error) {
    console.error('Dashboard insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate dashboard insights',
      error: error.message,
    });
  }
});

/**
 * POST /api/chat
 * Chat with Dr. Eva
 */
app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { message, language, context } = req.body;

    if (!message || !language) {
      return res.status(400).json({
        success: false,
        message: 'Message and language are required',
      });
    }

    if (!['vi', 'en'].includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language. Supported: vi, en',
      });
    }

    // Initialize Gemini
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = language === 'vi'
      ? 'Bạn là Dr. Eva, một chuyên gia chăm sóc mắt thân thiện và chuyên nghiệp. Hãy trả lời các câu hỏi về sức khỏe mắt một cách chi tiết, dễ hiểu và hữu ích.'
      : 'You are Dr. Eva, a friendly and professional eye care specialist. Answer questions about eye health in detail, clearly, and helpfully.';

    const prompt = `${systemPrompt}

User message: ${message}
${context ? `Context: ${JSON.stringify(context)}` : ''}

Provide a helpful and professional response in ${language === 'vi' ? 'Vietnamese' : 'English'}.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({
      success: true,
      message: responseText,
      timestamp: new Date().toISOString(),
      language,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat',
      error: error.message,
    });
  }
});

/**
 * POST /api/routine
 * Generate personalized routine
 */
app.post('/api/routine', authenticateToken, async (req, res) => {
  try {
    const { userProfile, testResults, language } = req.body;

    if (!language) {
      return res.status(400).json({
        success: false,
        message: 'Language is required',
      });
    }

    if (!['vi', 'en'].includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language. Supported: vi, en',
      });
    }

    // Initialize Gemini
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let routine;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        routine = JSON.parse(jsonMatch[0]);
      } else {
        routine = {
          dailySchedule: [],
          exercises: [],
          screenTime: {},
          nutrition: [],
          checkpoints: [],
        };
      }
    } catch (parseError) {
      routine = {
        dailySchedule: [],
        exercises: [],
        screenTime: {},
        nutrition: [],
        checkpoints: [],
      };
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      language,
      ...routine,
    });
  } catch (error) {
    console.error('Routine generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate routine',
      error: error.message,
    });
  }
});

/**
 * POST /api/proactive-tip
 * Generate proactive health tip
 */
app.post('/api/proactive-tip', authenticateToken, async (req, res) => {
  try {
    const { userProfile, language } = req.body;

    if (!language) {
      return res.status(400).json({
        success: false,
        message: 'Language is required',
      });
    }

    if (!['vi', 'en'].includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language. Supported: vi, en',
      });
    }

    // Initialize Gemini
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
Generate a personalized eye health tip for today.

User Profile: ${JSON.stringify(userProfile || {})}
Language: ${language}

Provide a single, actionable, and relevant eye health tip in ${language === 'vi' ? 'Vietnamese' : 'English'}.
Keep it concise (2-3 sentences) and practical.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({
      success: true,
      tip: responseText,
      timestamp: new Date().toISOString(),
      language,
    });
  } catch (error) {
    console.error('Proactive tip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate tip',
      error: error.message,
    });
  }
});

// ============================================================
// ERROR HANDLING
// ============================================================

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║    🚀 Vision Coach Backend Server - Enhanced Edition     ║
╠════════════════════════════════════════════════════════════╣
║ Server:      http://localhost:${PORT}                          
║ Health:      http://localhost:${PORT}/health                   
║ Metrics:     http://localhost:${PORT}/metrics                 
║ Environment: ${process.env.NODE_ENV || 'development'}
║ Gemini API:  ${GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}
║ JWT Secret:  ${JWT_SECRET ? '✅ Configured' : '❌ Using default'}
╠════════════════════════════════════════════════════════════╣
║ 📌 FEATURES:                                               ║
║    ✓ JWT Authentication                                    ║
║    ✓ Rate Limiting                                         ║
║    ✓ Session Management                                    ║
║    ✓ Auto Session Cleanup                                  ║
║    ✓ Enhanced Security                                     ║
║    ✓ AI Reports & Insights                                 ║
╚════════════════════════════════════════════════════════════╝
  `);
  
  console.log('\x1b[36m👉 Ready to accept connections...\x1b[0m\n');
});

export default app;

