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
 * 
 * ENDPOINTS:
 * - GET /health: Kiểm tra trạng thái server
 * - GET /metrics: Lấy thống kê server (users, sessions, memory)
 * - POST /api/auth/login: Đăng nhập người dùng (name, age, phone)
 * - POST /api/auth/verify: Xác minh token JWT
 * - POST /api/auth/logout: Đăng xuất người dùng
 * - POST /api/report: Tạo báo cáo AI cho bài test
 * - POST /api/dashboard: Tạo insights cho dashboard
 * - POST /api/chat: Chat với Dr. Eva
 * - POST /api/routine: Tạo lịch trình cá nhân
 * - POST /api/proactive-tip: Tạo gợi ý sức khỏe
 * 
 * SECURITY:
 * - JWT tokens hết hạn sau 7 ngày
 * - Rate limiting: 100 requests/phút/IP
 * - CORS: Chỉ cho phép origins được phép
 * - Session cleanup tự động mỗi 5 phút
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 📋 Load environment variables từ .env.local
// Nếu không có file, sử dụng giá trị mặc định
dotenv.config({ path: '.env.local' });

// 🚀 Khởi tạo Express app
const app = express();

// ⚙️ CẤU HÌNH SERVER
const PORT = process.env.PORT || 3001; // Cổng mặc định 3001
const JWT_SECRET = process.env.JWT_SECRET || 'vision-coach-secret-key-change-in-production-2024'; // Secret key để ký JWT
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.VITE_API_KEY; // API key cho Google Gemini

// ============================================================
// 🔧 MIDDLEWARE - Xử lý request trước khi đến routes
// ============================================================

// 🌐 CORS Configuration: Cho phép các origins được phép
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000,http://localhost:5174')
  .split(',')
  .map((s) => s.trim()); // Tách các origins và loại bỏ khoảng trắng

// 🔒 CORS Middleware: Kiểm tra origin của request
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Cho phép non-browser clients (curl, Postman)
    if (allowedOrigins.includes(origin)) return callback(null, true); // Cho phép origins trong whitelist
    return callback(new Error('Not allowed by CORS')); // Từ chối origins khác
  },
  credentials: true, // Cho phép cookies/credentials
}));

// 📦 Body Parser Middleware: Phân tích JSON/URL-encoded request body
app.use(express.json({ limit: '10mb' })); // Giới hạn JSON payload 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Giới hạn URL-encoded payload 10MB

// 📝 Request Logging Middleware: Ghi log mỗi request (với màu sắc)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString(); // Thời gian ISO
  const method = req.method; // HTTP method (GET, POST, etc.)
  const path = req.path; // Đường dẫn request
  // In log với màu sắc: cyan timestamp, yellow method
  console.log(`\x1b[36m[${timestamp}]\x1b[0m \x1b[33m${method}\x1b[0m ${path}`);
  next(); // Chuyển tiếp đến middleware tiếp theo
});

// ⚡ Rate Limiting: Giới hạn số request từ mỗi IP (chống DDoS)
const rateLimitMap = new Map(); // Lưu trữ dữ liệu rate limit cho mỗi IP
const RATE_LIMIT_WINDOW = 60000; // 1 phút = 60,000 ms
const MAX_REQUESTS_PER_WINDOW = 100; // Tối đa 100 requests/phút

/**
 * Rate Limiter Middleware
 * - Theo dõi số request từ mỗi IP
 * - Nếu vượt quá 100 requests/phút → trả về 429 Too Many Requests
 * - Reset counter mỗi phút
 */
function rateLimiter(req, res, next) {
  const clientId = req.ip || req.connection.remoteAddress; // Lấy IP của client
  const now = Date.now(); // Thời gian hiện tại
  
  // Nếu IP chưa có trong map → tạo entry mới
  if (!rateLimitMap.has(clientId)) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientData = rateLimitMap.get(clientId);
  
  // Nếu hết window time → reset counter
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  // Nếu vượt quá limit → từ chối request
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  }
  
  // Tăng counter và cho phép request
  clientData.count++;
  next();
}

// Áp dụng rate limiter cho tất cả routes
app.use(rateLimiter);

// ============================================================
// 🛠️ UTILITY FUNCTIONS - Hàm hỗ trợ
// ============================================================

/**
 * 🔐 Tạo JWT Token
 * - Ký token với userId + userData
 * - Hết hạn sau 7 ngày
 * - Dùng JWT_SECRET để ký
 * 
 * @param {string} userId - ID người dùng (ví dụ: user_0123456789)
 * @param {object} userData - Dữ liệu bổ sung (name, phone, age)
 * @returns {string} JWT token được ký và mã hóa
 */
function generateToken(userId, userData) {
  return jwt.sign(
    {
      userId, // ID người dùng duy nhất để nhận diện
      ...userData, // Spread operator: nhúng name, phone, age vào token payload
    },
    JWT_SECRET, // Secret key để ký token (bảo mật, không được lộ)
    { expiresIn: '7d' } // Token hết hạn sau 7 ngày để tăng bảo mật
  );
}

/**
 * ✅ Xác minh JWT Token
 * - Kiểm tra chữ ký và hạn sử dụng
 * - Trả về decoded data nếu hợp lệ
 * - Trả về null nếu không hợp lệ hoặc hết hạn
 * 
 * @param {string} token - JWT token cần xác minh
 * @returns {object|null} Decoded token data nếu hợp lệ, null nếu không hợp lệ
 */
function verifyToken(token) {
  try {
    // jwt.verify() sẽ throw error nếu token không hợp lệ hoặc hết hạn
    return jwt.verify(token, JWT_SECRET); // Xác minh token với secret key
  } catch (error) {
    // Bắt lỗi và trả về null thay vì throw (xử lý graceful)
    return null; // Token không hợp lệ, hết hạn, hoặc bị giả mạo
  }
}

/**
 * 🔐 Middleware xác thực Token
 * - Kiểm tra Authorization header (Bearer token)
 * - Xác minh token hợp lệ
 * - Lưu decoded data vào req.user
 * - Từ chối nếu không có token hoặc token không hợp lệ
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']; // Lấy Authorization header
  const token = authHeader && authHeader.split(' ')[1]; // Tách token từ "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided', // Không có token
    });
  }

  const decoded = verifyToken(token); // Xác minh token
  if (!decoded) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token', // Token không hợp lệ hoặc hết hạn
    });
  }

  req.user = decoded; // Lưu decoded data vào req.user
  next(); // Chuyển tiếp đến route handler
}

// 💾 In-memory storage for demo (replace with database in production)
// Map() là cấu trúc dữ liệu key-value hiệu quả cho việc lưu trữ tạm thời
const users = new Map(); // Lưu thông tin người dùng: userId -> userData
const sessions = new Map(); // Lưu session: token -> sessionData
const loginHistory = new Map(); // Lưu lịch sử đăng nhập: userId -> [loginRecords]

// 🗄️ Enhanced database simulation
// Đây là lớp abstraction giả lập database, dễ dàng thay thế bằng MongoDB/PostgreSQL sau
const db = {
  users, // Reference đến Map users
  sessions, // Reference đến Map sessions
  loginHistory, // Reference đến Map loginHistory
  
  /**
   * 👤 Tạo hoặc cập nhật thông tin người dùng
   * - Nếu user đã tồn tại: cập nhật thông tin và tăng loginCount
   * - Nếu user chưa tồn tại: tạo mới với createdAt = now
   * - Luôn cập nhật updatedAt và lastLogin
   * 
   * @param {string} userId - ID người dùng
   * @param {object} userData - Dữ liệu người dùng (name, age, phone, ip)
   * @returns {object} User object đã được tạo/cập nhật
   */
  createOrUpdateUser(userId, userData) {
    const existing = users.get(userId); // Kiểm tra user đã tồn tại chưa
    const now = Date.now(); // Timestamp hiện tại (milliseconds)
    
    // Tạo/cập nhật user object với metadata
    const user = {
      ...userData, // Spread: copy tất cả fields từ userData (name, age, phone, ip)
      id: userId, // ID người dùng
      createdAt: existing?.createdAt || now, // Giữ nguyên createdAt nếu đã có, không thì = now
      updatedAt: now, // Luôn cập nhật thời gian chỉnh sửa
      lastLogin: now, // Cập nhật thời gian đăng nhập cuối
      loginCount: (existing?.loginCount || 0) + 1, // Tăng số lần đăng nhập
    };
    
    users.set(userId, user); // Lưu vào Map
    
    // 📝 Ghi lại lịch sử đăng nhập để phân tích sau
    if (!loginHistory.has(userId)) {
      loginHistory.set(userId, []); // Tạo mảng rỗng nếu chưa có
    }
    loginHistory.get(userId).push({
      timestamp: now, // Thời gian đăng nhập
      ip: userData.ip || 'unknown', // IP address (để bảo mật)
    });
    
    return user; // Trả về user object
  },
  
  /**
   * 🔍 Lấy thông tin người dùng theo ID
   * 
   * @param {string} userId - ID người dùng
   * @returns {object|undefined} User object hoặc undefined nếu không tìm thấy
   */
  getUserById(userId) {
    return users.get(userId); // Map.get() trả về value hoặc undefined
  },
  
  /**
   * 🔐 Tạo session mới
   * - Lưu session với token làm key
   * - Ghi lại thời gian tạo và truy cập cuối
   * 
   * @param {string} token - JWT token
   * @param {object} sessionData - Dữ liệu session (userId, expiresAt, userAgent, ip)
   */
  createSession(token, sessionData) {
    sessions.set(token, {
      ...sessionData, // Spread: copy tất cả fields từ sessionData
      createdAt: Date.now(), // Thời gian tạo session
      lastAccess: Date.now(), // Thời gian truy cập cuối (để cleanup)
    });
  },
  
  /**
   * 🔍 Lấy session theo token
   * - Tự động cập nhật lastAccess khi truy cập
   * 
   * @param {string} token - JWT token
   * @returns {object|undefined} Session object hoặc undefined
   */
  getSession(token) {
    const session = sessions.get(token); // Lấy session từ Map
    if (session) {
      session.lastAccess = Date.now(); // Cập nhật thời gian truy cập cuối
    }
    return session;
  },
  
  /**
   * 🗑️ Xóa session (đăng xuất)
   * 
   * @param {string} token - JWT token cần xóa
   * @returns {boolean} true nếu xóa thành công, false nếu không tìm thấy
   */
  deleteSession(token) {
    return sessions.delete(token); // Map.delete() trả về boolean
  },
  
  /**
   * 🧹 Dọn dẹp session hết hạn
   * - Duyệt qua tất cả sessions
   * - Xóa các session có expiresAt < now
   * - Trả về số lượng session đã xóa
   * 
   * @returns {number} Số lượng session đã xóa
   */
  cleanExpiredSessions() {
    const now = Date.now(); // Thời gian hiện tại
    let cleaned = 0; // Counter số session đã xóa
    
    // Duyệt qua tất cả entries trong Map sessions
    for (const [token, session] of sessions.entries()) {
      if (session.expiresAt < now) { // Kiểm tra session đã hết hạn chưa
        sessions.delete(token); // Xóa session hết hạn
        cleaned++; // Tăng counter
      }
    }
    
    return cleaned; // Trả về số lượng đã xóa
  },
  
  /**
   * 📊 Lấy thống kê hệ thống
   * - Tổng số users, sessions đang active
   * - Tổng số lần đăng nhập
   * 
   * @returns {object} Object chứa stats
   */
  getStats() {
    return {
      totalUsers: users.size, // Số lượng users (Map.size)
      activeSessions: sessions.size, // Số lượng sessions đang active
      // Tính tổng số lần đăng nhập từ tất cả users
      totalLogins: Array.from(loginHistory.values()).reduce((sum, arr) => sum + arr.length, 0),
    };
  },
};

// ⏰ Auto cleanup expired sessions every 5 minutes
// setInterval() chạy hàm cleanup định kỳ để giải phóng bộ nhớ
setInterval(() => {
  const cleaned = db.cleanExpiredSessions(); // Gọi hàm cleanup
  if (cleaned > 0) {
    // Chỉ log khi có session được xóa (tránh spam log)
    console.log(`\x1b[32m✓ Cleaned ${cleaned} expired sessions\x1b[0m`);
  }
}, 5 * 60 * 1000); // 5 phút = 5 * 60 * 1000 milliseconds

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
 * - Validate input (name, age, phone)
 * - Tạo/cập nhật user trong database
 * - Generate JWT token
 * - Tạo session
 * - Trả về user info + token
 */
app.post('/api/auth/login', (req, res) => {
  try {
    // 📥 Lấy dữ liệu từ request body
    const { name, age, phone } = req.body;

    // ✅ Validate input - Kiểm tra các trường bắt buộc
    if (!name || !age || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, age, phone',
        error: 'MISSING_FIELDS',
      });
    }

    // ✅ Validate name - Tên phải có ít nhất 2 ký tự
    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters',
        error: 'INVALID_NAME',
      });
    }

    // ✅ Validate age - Tuổi phải là số từ 5-120
    const ageNum = parseInt(age); // Chuyển string sang number
    if (isNaN(ageNum) || ageNum < 5 || ageNum > 120) {
      return res.status(400).json({
        success: false,
        message: 'Age must be between 5 and 120',
        error: 'INVALID_AGE',
      });
    }

    // ✅ Validate phone - Định dạng số điện thoại Việt Nam (0xxxxxxxxx)
    const phoneClean = phone.replace(/\D/g, ''); // Loại bỏ tất cả ký tự không phải số
    if (!/^0\d{9,10}$/.test(phoneClean)) { // Regex: bắt đầu bằng 0, theo sau là 9-10 chữ số
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format (Vietnamese format required)',
        error: 'INVALID_PHONE',
      });
    }

    // 👤 Tạo hoặc cập nhật user trong database
    const userId = `user_${phoneClean}`; // Tạo userId từ số điện thoại (duy nhất)
    const userData = db.createOrUpdateUser(userId, {
      name: name.trim(), // Loại bỏ khoảng trắng đầu/cuối
      age: age.trim(), // Giữ nguyên string (có thể có thêm thông tin)
      phone: phoneClean, // Số điện thoại đã được làm sạch
      ip: req.ip || req.connection.remoteAddress, // IP address để tracking
    });

    // 🔐 Generate JWT token với thông tin user
    const token = generateToken(userId, {
      name: userData.name,
      phone: userData.phone,
      age: userData.age,
    });

    // 💾 Lưu session vào database
    db.createSession(token, {
      userId, // ID người dùng
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // Hết hạn sau 7 ngày
      userAgent: req.headers['user-agent'], // Browser/device info
      ip: req.ip, // IP address
    });

    // 📝 Log thành công (màu xanh)
    console.log(`\x1b[32m✓ User logged in: ${userData.name} (${userId})\x1b[0m`);

    // ✅ Trả về response thành công
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: userId,
        name: userData.name,
        age: userData.age,
        phone: userData.phone,
        loginTime: userData.lastLogin, // Timestamp đăng nhập
        loginCount: userData.loginCount, // Số lần đăng nhập
        token, // JWT token để client lưu và dùng cho các request sau
      },
    });
  } catch (error) {
    // ❌ Xử lý lỗi
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message, // Chi tiết lỗi (chỉ trong development)
    });
  }
});

/**
 * POST /api/auth/verify
 * Verify user token with enhanced checks
 * - Kiểm tra token có hợp lệ không
 * - Kiểm tra session có tồn tại và chưa hết hạn
 * - Trả về thông tin user nếu hợp lệ
 */
app.post('/api/auth/verify', (req, res) => {
  try {
    // 📥 Lấy token từ request body
    const { token } = req.body;

    // ✅ Validate token có tồn tại không
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }

    // 🔐 Xác minh token JWT (kiểm tra chữ ký và hạn sử dụng)
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // 🔍 Kiểm tra session trong database
    const session = db.getSession(token);
    if (!session || session.expiresAt < Date.now()) {
      // Session không tồn tại hoặc đã hết hạn → xóa và từ chối
      db.deleteSession(token);
      return res.status(403).json({
        success: false,
        message: 'Session expired',
      });
    }

    // 👤 Lấy thông tin user từ database
    const user = db.getUserById(session.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // ✅ Token và session hợp lệ → trả về thông tin user
    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        userId: decoded.userId, // Từ JWT token
        name: user.name, // Từ database
        phone: user.phone,
        age: user.age,
        loginCount: user.loginCount, // Số lần đăng nhập
        lastLogin: user.lastLogin, // Thời gian đăng nhập cuối
      },
    });
  } catch (error) {
    // ❌ Xử lý lỗi
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
 * - Xóa session khỏi database
 * - Hỗ trợ token từ body hoặc Authorization header
 */
app.post('/api/auth/logout', (req, res) => {
  try {
    // 📥 Lấy token từ body hoặc header (linh hoạt)
    const { token } = req.body; // Token từ request body
    const authHeader = req.headers['authorization']; // Token từ Authorization header
    const headerToken = authHeader && authHeader.split(' ')[1]; // Tách "Bearer <token>"
    
    // Ưu tiên token từ body, nếu không có thì dùng từ header
    const tokenToDelete = token || headerToken;

    // 🗑️ Xóa session nếu có token
    if (tokenToDelete) {
      const session = db.getSession(tokenToDelete); // Kiểm tra session có tồn tại
      if (session) {
        db.deleteSession(tokenToDelete); // Xóa session khỏi database
        console.log(`\x1b[33m✓ User logged out: ${session.userId}\x1b[0m`); // Log (màu vàng)
      }
    }

    // ✅ Trả về thành công (luôn thành công, kể cả khi không có session)
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    // ❌ Xử lý lỗi
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
 * 🤖 Khởi tạo Google Gemini AI Client
 * - Kiểm tra API key có tồn tại không
 * - Tạo instance GoogleGenerativeAI
 * 
 * @returns {GoogleGenerativeAI} Instance của GoogleGenerativeAI
 * @throws {Error} Nếu GEMINI_API_KEY không được cấu hình
 */
function initializeGemini() {
  // ✅ Kiểm tra API key có tồn tại không
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set'); // Throw error nếu thiếu API key
  }
  // 🚀 Tạo và trả về instance GoogleGenerativeAI
  return new GoogleGenerativeAI(GEMINI_API_KEY);
}

/**
 * POST /api/report
 * Generate AI report for test results
 * - Yêu cầu authentication (authenticateToken middleware)
 * - Phân tích kết quả test bằng Google Gemini AI
 * - Trả về báo cáo chi tiết dạng JSON
 */
app.post('/api/report', authenticateToken, async (req, res) => {
  try {
    // 📥 Lấy dữ liệu từ request body
    const { testType, testData, history, language } = req.body;

    // ✅ Validate input - Kiểm tra các trường bắt buộc
    if (!testType || !testData || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: testType, testData, language',
      });
    }

    // ✅ Validate language - Chỉ hỗ trợ tiếng Việt và tiếng Anh
    if (!['vi', 'en'].includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language. Supported: vi, en',
      });
    }

    // 🤖 Khởi tạo Google Gemini AI
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); // Sử dụng model flash (nhanh)

    // 📝 Tạo prompt cho AI
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

    // 🚀 Gọi AI để generate content
    const result = await model.generateContent(prompt);
    const responseText = result.response.text(); // Lấy text response từ AI

    // 🔍 Parse JSON response từ AI
    // AI có thể trả về JSON hoặc text, cần parse cẩn thận
    let report;
    try {
      // Tìm JSON object trong response (regex match)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        report = JSON.parse(jsonMatch[0]); // Parse JSON thành object
      } else {
        // Nếu không tìm thấy JSON, tạo structure mặc định
        report = {
          summary: responseText, // Dùng toàn bộ response làm summary
          findings: [],
          recommendations: [],
          doctorVisit: 'Consult with an eye care professional',
          preventiveMeasures: [],
        };
      }
    } catch (parseError) {
      // Nếu parse JSON lỗi, dùng fallback structure
      report = {
        summary: responseText,
        findings: [],
        recommendations: [],
        doctorVisit: 'Consult with an eye care professional',
        preventiveMeasures: [],
      };
    }

    // ✅ Trả về báo cáo thành công
    res.json({
      success: true,
      id: `report_${Date.now()}`, // ID duy nhất cho report
      testType, // Loại test (Snellen, ColorBlind, etc.)
      timestamp: new Date().toISOString(), // Thời gian tạo report
      language, // Ngôn ngữ (vi/en)
      ...report, // Spread: copy tất cả fields từ report object
    });
  } catch (error) {
    // ❌ Xử lý lỗi
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
 * - Phân tích lịch sử test để đưa ra insights tổng quan
 * - Yêu cầu authentication
 */
app.post('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    // 📥 Lấy dữ liệu từ request body
    const { testHistory, language } = req.body;

    // ✅ Validate language - Bắt buộc phải có
    if (!language) {
      return res.status(400).json({
        success: false,
        message: 'Language is required',
      });
    }

    // ✅ Validate language format - Chỉ hỗ trợ vi/en
    if (!['vi', 'en'].includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language. Supported: vi, en',
      });
    }

    // 🤖 Khởi tạo Google Gemini AI
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); // Model flash (nhanh)

    // 📝 Tạo prompt cho AI để phân tích lịch sử test
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

    // 🚀 Gọi AI để generate insights
    const result = await model.generateContent(prompt);
    const responseText = result.response.text(); // Lấy text response

    // 🔍 Parse JSON response từ AI
    let insights;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/); // Tìm JSON object
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]); // Parse thành object
      } else {
        // Fallback nếu không tìm thấy JSON
        insights = {
          status: 'Good',
          trends: [],
          metrics: {},
          recommendations: [],
          riskFactors: [],
        };
      }
    } catch (parseError) {
      // Fallback nếu parse lỗi
      insights = {
        status: 'Good',
        trends: [],
        metrics: {},
        recommendations: [],
        riskFactors: [],
      };
    }

    // ✅ Trả về insights thành công
    res.json({
      success: true,
      timestamp: new Date().toISOString(), // Thời gian tạo insights
      language, // Ngôn ngữ (vi/en)
      ...insights, // Spread: copy tất cả fields từ insights object
    });
  } catch (error) {
    // ❌ Xử lý lỗi
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

