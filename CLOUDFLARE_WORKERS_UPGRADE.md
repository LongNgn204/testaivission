# Phương án B: Cloudflare Workers để Nâng Cấp Backend

## 📋 Tổng Quan

Cloudflare Workers là một giải pháp **serverless edge computing** cho phép chạy code JavaScript/TypeScript trên hơn 300 data centers toàn cầu của Cloudflare. Đây là phương án tối ưu để nâng cấp backend của ứng dụng Vision Coach.

### 🎯 Lợi Ích Chính

| Lợi Ích | Chi Tiết |
|---------|---------|
| **⚡ Tốc độ** | Chạy code gần người dùng (edge) → latency <50ms |
| **[object Object] 100,000 requests/ngày; Paid: $0.50/triệu requests |
| **🌍 Toàn cầu** | Tự động deploy trên 300+ data centers |
| **[object Object] | Ẩn API keys, không expose backend URL |
| **📊 Dễ mở rộng** | Tự động scale, không cần quản lý server |
| **🔌 Tích hợp** | Dễ kết nối Gemini API, databases, services khác |

---

## [object Object]ện Tại vs. Cloudflare Workers

### Hiện Tại (Frontend-only)
```
┌─────────────────────────────────────────┐
│     React App (Vite)                    │
│  - AI Service (Gemini API calls)        │
│  - Direct API key exposure ⚠️           │
│  - All logic on client                  │
└─────────────────────────────────────────┘
         │
         ├─→ Gemini API (Google)
         ├─→ Storage (Browser localStorage)
         └─→ No backend protection
```

### Với Cloudflare Workers
```
┌──────────────────────────────────────────────────────────────┐
│                    React App (Vite)                          │
│              - Lightweight client logic                       │
│              - No API keys exposed                           │
└──────────────────────────────────────────────────────────────┘
         │
         ├─→ Cloudflare Worker (Edge)
         │   ├─ API Gateway
         │   ├─ Request validation
         │   ├─ Rate limiting
         │   ├─ Caching
         │   └─ Gemini API proxy
         │
         ├─→ Gemini API (Google)
         ├─→ Cloudflare KV (Cache)
         ├─→ D1 Database (Optional)
         └─→ R2 Storage (Optional)
```

---

## 🚀 Bước 1: Cài Đặt Cloudflare Workers

### 1.1 Cài đặt Wrangler CLI

```bash
npm install -g wrangler
# Hoặc dùng npx
npx wrangler --version
```

### 1.2 Tạo Worker Project

```bash
# Tạo project mới
wrangler init vision-coach-worker

# Chọn các tùy chọn:
# - TypeScript: Yes
# - Cloudflare account: Login
# - Create git repo: Yes
```

### 1.3 Cấu Hình `wrangler.toml`

```toml
name = "vision-coach-worker"
type = "javascript"
account_id = "YOUR_ACCOUNT_ID"
workers_dev = true
route = "api.yourdomain.com/*"
zone_id = "YOUR_ZONE_ID"

# Environment variables
[env.production]
vars = { ENVIRONMENT = "production" }

[env.development]
vars = { ENVIRONMENT = "development" }

# KV Namespace (for caching)
[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_NAMESPACE_ID"
preview_id = "YOUR_PREVIEW_KV_NAMESPACE_ID"

# Secrets (API keys)
[secrets]
GEMINI_API_KEY = "your-api-key-here"
```

---

## 🔧 Bước 2: Tạo Worker Endpoints

### 2.1 Cấu Trúc Thư Mục

```
worker/
├── src/
│   ├── index.ts              # Entry point
│   ├── handlers/
│   │   ├── aiReport.ts       # Generate report
│   │   ├── dashboard.ts      # Dashboard insights
│   │   ├── chat.ts           # Chat endpoint
│   │   ├── routine.ts        # Personalized routine
│   │   └── proactiveTip.ts   # Proactive tips
│   ├── middleware/
│   │   ├── auth.ts           # Authentication
│   │   ├── rateLimit.ts      # Rate limiting
│   │   ├── cors.ts           # CORS handling
│   │   └── validation.ts     # Request validation
│   ├── services/
│   │   ├── gemini.ts         # Gemini API wrapper
│   │   ├── cache.ts          # KV caching
│   │   └── logger.ts         # Logging
│   └── types.ts              # TypeScript types
├── wrangler.toml
├── package.json
└── tsconfig.json
```

### 2.2 Entry Point (`src/index.ts`)

```typescript
import { Router } from 'itty-router';
import { generateReport } from './handlers/aiReport';
import { generateDashboardInsights } from './handlers/dashboard';
import { chat } from './handlers/chat';
import { generateRoutine } from './handlers/routine';
import { generateProactiveTip } from './handlers/proactiveTip';
import { handleCors } from './middleware/cors';
import { rateLimit } from './middleware/rateLimit';
import { validateRequest } from './middleware/validation';

const router = Router();

// Middleware
router.all('*', handleCors);
router.all('*', rateLimit);

// Routes
router.post('/api/report', validateRequest, generateReport);
router.post('/api/dashboard', validateRequest, generateDashboardInsights);
router.post('/api/chat', validateRequest, chat);
router.post('/api/routine', validateRequest, generateRoutine);
router.post('/api/proactive-tip', validateRequest, generateProactiveTip);

// Health check
router.get('/health', () => new Response('OK', { status: 200 }));

// 404
router.all('*', () => new Response('Not Found', { status: 404 }));

export default router.handle;
```

### 2.3 Gemini API Wrapper (`src/services/gemini.ts`)

```typescript
import { GoogleGenAI, Type } from '@google/genai';

interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export class GeminiService {
  private client: any;
  private config: GeminiConfig;

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      model: 'gemini-2.5-flash',
      temperature: 0.3,
      maxTokens: 4000,
    };
    this.client = new GoogleGenAI({ apiKey });
  }

  async generateContent(
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      responseSchema?: any;
      responseMimeType?: string;
    }
  ): Promise<string> {
    try {
      const response = await this.client.models.generateContent({
        model: this.config.model,
        contents: prompt,
        config: {
          temperature: options?.temperature ?? this.config.temperature,
          maxOutputTokens: options?.maxTokens ?? this.config.maxTokens,
          responseMimeType: options?.responseMimeType,
          responseSchema: options?.responseSchema,
        },
      });

      return response.text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API failed: ${error.message}`);
    }
  }
}
```

### 2.4 KV Cache Service (`src/services/cache.ts`)

```typescript
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  metadata?: Record<string, any>;
}

export class CacheService {
  constructor(private kv: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.kv.get(key, 'json');
      return value as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    options?: CacheOptions
  ): Promise<void> {
    try {
      await this.kv.put(key, JSON.stringify(value), {
        expirationTtl: options?.ttl ?? 3600, // Default 1 hour
        metadata: options?.metadata,
      });
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.kv.delete(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  generateKey(...parts: string[]): string {
    return parts.join(':');
  }
}
```

---

## 📡 Bước 3: Tạo API Handlers

### 3.1 AI Report Handler (`src/handlers/aiReport.ts`)

```typescript
import { IRequest } from 'itty-router';
import { GeminiService } from '../services/gemini';
import { CacheService } from '../services/cache';

export async function generateReport(
  request: IRequest,
  env: any
): Promise<Response> {
  try {
    const { testType, testData, history, language } = await request.json();

    // Validate input
    if (!testType || !testData || !language) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheService = new CacheService(env.CACHE);
    const cacheKey = cacheService.generateKey(
      'report',
      testType,
      JSON.stringify(testData)
    );

    // Check cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return new Response(JSON.stringify({ ...cached, fromCache: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate report
    const gemini = new GeminiService(env.GEMINI_API_KEY);
    const prompt = buildReportPrompt(testType, testData, history, language);

    const responseSchema = createResponseSchema(language);
    const response = await gemini.generateContent(prompt, {
      temperature: 0.3,
      maxTokens: 4000,
      responseSchema,
      responseMimeType: 'application/json',
    });

    const report = JSON.parse(response);

    // Cache result (1 hour)
    await cacheService.set(cacheKey, report, { ttl: 3600 });

    return new Response(JSON.stringify(report), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate report' }),
      { status: 500 }
    );
  }
}

function buildReportPrompt(
  testType: string,
  testData: any,
  history: any[],
  language: string
): string {
  // Implementation similar to aiService.ts
  return `Generate a medical report for ${testType} test...`;
}

function createResponseSchema(language: string): any {
  // Implementation similar to aiService.ts
  return {};
}
```

### 3.2 Dashboard Handler (`src/handlers/dashboard.ts`)

```typescript
import { IRequest } from 'itty-router';
import { GeminiService } from '../services/gemini';
import { CacheService } from '../services/cache';

export async function generateDashboardInsights(
  request: IRequest,
  env: any
): Promise<Response> {
  try {
    const { history, language } = await request.json();

    if (!history || !language) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Generate cache key based on history
    const cacheService = new CacheService(env.CACHE);
    const historyHash = JSON.stringify(history.slice(0, 5)); // Last 5 tests
    const cacheKey = cacheService.generateKey('dashboard', language, historyHash);

    // Check cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return new Response(JSON.stringify({ ...cached, fromCache: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate insights
    const gemini = new GeminiService(env.GEMINI_API_KEY);
    const prompt = buildDashboardPrompt(history, language);

    const responseSchema = createDashboardSchema(language);
    const response = await gemini.generateContent(prompt, {
      temperature: 0.2,
      maxTokens: 4000,
      responseSchema,
      responseMimeType: 'application/json',
    });

    const insights = JSON.parse(response);

    // Cache result (2 hours)
    await cacheService.set(cacheKey, insights, { ttl: 7200 });

    return new Response(JSON.stringify(insights), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Dashboard insights error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate insights' }),
      { status: 500 }
    );
  }
}

function buildDashboardPrompt(history: any[], language: string): string {
  return `Analyze the following test history and provide dashboard insights...`;
}

function createDashboardSchema(language: string): any {
  return {};
}
```

### 3.3 Chat Handler (`src/handlers/chat.ts`)

```typescript
import { IRequest } from 'itty-router';
import { GeminiService } from '../services/gemini';

export async function chat(
  request: IRequest,
  env: any
): Promise<Response> {
  try {
    const { message, lastTestResult, userProfile, language } =
      await request.json();

    if (!message || !language) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const gemini = new GeminiService(env.GEMINI_API_KEY);

    const systemInstruction = buildChatSystemPrompt(language);
    const contextInfo = buildChatContext(
      lastTestResult,
      userProfile,
      language
    );
    const fullPrompt = `${systemInstruction}${contextInfo}\n\nQUESTION: ${message}`;

    const response = await gemini.generateContent(fullPrompt, {
      temperature: 0.7,
      maxTokens: 500,
    });

    return new Response(
      JSON.stringify({
        message: response,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat' }),
      { status: 500 }
    );
  }
}

function buildChatSystemPrompt(language: string): string {
  return language === 'vi'
    ? `Bạn là Bác sĩ Eva - Trợ lý Bác sĩ Chuyên khoa Nhãn khoa...`
    : `You are Dr. Eva - AI Medical Assistant specializing in Ophthalmology...`;
}

function buildChatContext(
  lastTestResult: any,
  userProfile: any,
  language: string
): string {
  let context = '';
  if (lastTestResult) {
    context += `\n\nLATEST TEST: ${JSON.stringify(lastTestResult)}`;
  }
  if (userProfile) {
    context += `\n\nUSER PROFILE: ${JSON.stringify(userProfile)}`;
  }
  return context;
}
```

---

## 🔐 Bước 4: Middleware

### 4.1 CORS Middleware (`src/middleware/cors.ts`)

```typescript
export function handleCors(request: Request): Response | undefined {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
}

export function addCorsHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return newResponse;
}
```

### 4.2 Rate Limiting (`src/middleware/rateLimit.ts`)

```typescript
const RATE_LIMIT_WINDOW = 60; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute

export async function rateLimit(
  request: Request,
  env: any
): Promise<Response | undefined> {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const key = `ratelimit:${ip}`;

  const cache = new CacheService(env.CACHE);
  const current = (await cache.get<number>(key)) || 0;

  if (current >= RATE_LIMIT_MAX) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      { status: 429 }
    );
  }

  await cache.set(key, current + 1, { ttl: RATE_LIMIT_WINDOW });
}
```

### 4.3 Request Validation (`src/middleware/validation.ts`)

```typescript
export async function validateRequest(
  request: Request
): Promise<Response | undefined> {
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405 }
    );
  }

  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return new Response(
      JSON.stringify({ error: 'Content-Type must be application/json' }),
      { status: 400 }
    );
  }
}
```

---

## 🔌 Bước 5: Cập Nhật Frontend

### 5.1 Tạo API Client (`src/services/workerClient.ts`)

```typescript
/**
 * Cloudflare Worker API Client
 * Replaces direct Gemini API calls
 */

const WORKER_URL = process.env.REACT_APP_WORKER_URL || 'http://localhost:8787';

export class WorkerClient {
  private baseUrl: string;

  constructor(baseUrl: string = WORKER_URL) {
    this.baseUrl = baseUrl;
  }

  async generateReport(
    testType: string,
    testData: any,
    history: any[],
    language: 'vi' | 'en'
  ): Promise<any> {
    return this.post('/api/report', {
      testType,
      testData,
      history,
      language,
    });
  }

  async generateDashboardInsights(
    history: any[],
    language: 'vi' | 'en'
  ): Promise<any> {
    return this.post('/api/dashboard', {
      history,
      language,
    });
  }

  async chat(
    message: string,
    lastTestResult: any,
    userProfile: any,
    language: 'vi' | 'en'
  ): Promise<string> {
    const response = await this.post('/api/chat', {
      message,
      lastTestResult,
      userProfile,
      language,
    });
    return response.message;
  }

  async generateRoutine(
    answers: any,
    language: 'vi' | 'en'
  ): Promise<any> {
    return this.post('/api/routine', {
      answers,
      language,
    });
  }

  async generateProactiveTip(
    lastTest: any,
    userProfile: any,
    language: 'vi' | 'en'
  ): Promise<string | null> {
    const response = await this.post('/api/proactive-tip', {
      lastTest,
      userProfile,
      language,
    });
    return response.tip;
  }

  private async post(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Worker API error on ${endpoint}:`, error);
      throw error;
    }
  }
}

export const workerClient = new WorkerClient();
```

### 5.2 Cập Nhật AIService (`src/services/aiService.ts`)

```typescript
import { workerClient } from './workerClient';

export class AIService {
  // ... existing code ...

  async generateReport(
    testType: TestType,
    testData: any,
    history: StoredTestResult[],
    language: 'vi' | 'en'
  ): Promise<AIReport> {
    // Use Worker instead of direct Gemini API
    try {
      const report = await workerClient.generateReport(
        testType,
        testData,
        history,
        language
      );
      return {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        testType,
        timestamp: new Date().toISOString(),
        ...report,
      };
    } catch (error) {
      console.error('Failed to generate report via Worker:', error);
      throw error;
    }
  }

  async generateDashboardInsights(
    history: StoredTestResult[],
    language: 'vi' | 'en'
  ): Promise<DashboardInsights> {
    try {
      return await workerClient.generateDashboardInsights(history, language);
    } catch (error) {
      console.error('Failed to generate dashboard insights via Worker:', error);
      throw error;
    }
  }

  async chat(
    userMessage: string,
    lastTestResult: StoredTestResult | null,
    userProfile: AnswerState | null,
    language: 'vi' | 'en'
  ): Promise<string> {
    try {
      return await workerClient.chat(
        userMessage,
        lastTestResult,
        userProfile,
        language
      );
    } catch (error) {
      console.error('Failed to chat via Worker:', error);
      throw error;
    }
  }

  // ... other methods ...
}
```

---

## 📦 Bước 6: Deployment

### 6.1 Cài Đặt Secrets

```bash
# Set Gemini API key
wrangler secret put GEMINI_API_KEY

# Verify
wrangler secret list
```

### 6.2 Deploy to Production

```bash
# Build
npm run build

# Deploy
wrangler deploy

# Deploy to specific environment
wrangler deploy --env production
```

### 6.3 Cấu Hình Domain

```bash
# Add custom domain (requires Cloudflare domain)
wrangler route create api.yourdomain.com/*
```

---

## 📊 Bước 7: Monitoring & Analytics

### 7.1 Cloudflare Analytics

```typescript
// src/services/analytics.ts
export class AnalyticsService {
  static logRequest(endpoint: string, duration: number, status: number) {
    // Cloudflare automatically logs all requests
    console.log(`[${endpoint}] ${status} ${duration}ms`);
  }

  static logError(endpoint: string, error: Error) {
    console.error(`[${endpoint}] Error: ${error.message}`);
  }
}
```

### 7.2 Monitoring Dashboard

- Cloudflare Dashboard → Workers → Metrics
- Real-time requests, errors, latency
- CPU time, memory usage

---

## 🎯 Bước 8: Optimization Tips

### 8.1 Caching Strategy

```typescript
// Cache responses based on test type
const CACHE_TTL = {
  report: 3600,        // 1 hour
  dashboard: 7200,     // 2 hours
  chat: 0,             // No cache
  routine: 86400,      // 24 hours
  proactiveTip: 1800,  // 30 minutes
};
```

### 8.2 Request Batching

```typescript
// Batch multiple requests to reduce latency
async function batchRequests(requests: any[]): Promise<any[]> {
  return Promise.all(requests.map(req => workerClient.post(req.endpoint, req.data)));
}
```

### 8.3 Response Compression

```typescript
// Cloudflare automatically compresses responses
// No additional configuration needed
```

---

## 🔒 Bước 9: Security Best Practices

### 9.1 API Key Management

```typescript
// ✅ GOOD: Use Cloudflare Secrets
const apiKey = env.GEMINI_API_KEY; // Never exposed

// ❌ BAD: Hardcode keys
const apiKey = 'sk-xxx'; // NEVER do this
```

### 9.2 Request Validation

```typescript
// Validate all inputs
function validateReportRequest(data: any): boolean {
  return (
    data.testType &&
    data.testData &&
    data.language &&
    ['vi', 'en'].includes(data.language)
  );
}
```

### 9.3 Rate Limiting

```typescript
// Prevent abuse
const RATE_LIMITS = {
  report: 100,           // 100 per hour
  dashboard: 50,         // 50 per hour
  chat: 200,             // 200 per hour
  proactiveTip: 50,      // 50 per hour
};
```

---

## 📈 Performance Comparison

| Metric | Frontend-only | Cloudflare Workers |
|--------|---------------|-------------------|
| **Latency** | 200-500ms | 50-150ms |
| **API Key Exposure** | ⚠️ Yes | ✅ No |
| **Cost** | Free | $0.50/M requests |
| **Scalability** | Limited | Unlimited |
| **Caching** | Browser only | Global edge cache |
| **Rate Limiting** | None | ✅ Built-in |

---

## 🚀 Roadmap

### Phase 1: Basic Setup (Week 1)
- [ ] Create Cloudflare Worker project
- [ ] Implement report generation endpoint
- [ ] Add KV caching
- [ ] Update frontend client

### Phase 2: Full Migration (Week 2)
- [ ] Implement all endpoints (dashboard, chat, routine, tips)
- [ ] Add rate limiting & validation
- [ ] Set up monitoring
- [ ] Deploy to production

### Phase 3: Optimization (Week 3)
- [ ] Implement advanced caching strategies
- [ ] Add request batching
- [ ] Optimize response times
- [ ] Monitor and tune

### Phase 4: Enhancement (Week 4+)
- [ ] Add D1 database for user data
- [ ] Implement R2 storage for reports
- [ ] Add analytics dashboard
- [ ] Implement A/B testing

---

## 📚 Tài Liệu Tham Khảo

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [KV Storage](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)

---

## 💡 Lưu Ý Quan Trọng

1. **API Key Security**: Luôn lưu API keys trong Cloudflare Secrets, không bao giờ commit vào git
2. **Rate Limiting**: Implement rate limiting để tránh abuse
3. **Caching**: Sử dụng KV cache để giảm latency
4. **Monitoring**: Theo dõi metrics để phát hiện vấn đề sớm
5. **Testing**: Test kỹ trước khi deploy lên production

---

## ✅ Checklist Deployment

- [ ] Cloudflare account created
- [ ] Wrangler CLI installed
- [ ] Worker project initialized
- [ ] All endpoints implemented
- [ ] Middleware configured
- [ ] Frontend client updated
- [ ] Secrets configured
- [ ] Rate limiting enabled
- [ ] Caching strategy set
- [ ] Monitoring enabled
- [ ] Tested locally
- [ ] Deployed to production
- [ ] Domain configured
- [ ] Analytics verified

