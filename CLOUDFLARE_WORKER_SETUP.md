# 🚀 Cloudflare Worker Backend - Setup Guide

## Tổng Quan

Dự án này sử dụng **Cloudflare Workers** làm backend chính để:
- ✅ Ẩn hoàn toàn API keys khỏi frontend
- ✅ Xử lý tất cả AI requests (Gemini, TTS)
- ✅ Quản lý authentication (JWT, sessions)
- ✅ Lưu trữ dữ liệu (Cloudflare D1 Database)
- ✅ Bảo mật cao (rate limiting, input validation, security headers)

## 📁 Cấu Trúc Thư Mục

```
worker/
├── src/
│   ├── index.ts                 # Entry point, routing
│   ├── types.ts                 # TypeScript types
│   ├── handlers/                # Request handlers
│   │   ├── auth.ts              # Login, register, logout
│   │   ├── aiReport.ts          # AI report generation
│   │   ├── dashboard.ts         # Dashboard insights
│   │   ├── chat.ts              # Chat with Dr. Eva
│   │   ├── routine.ts           # Routine generation
│   │   └── proactiveTip.ts      # Proactive tips
│   ├── services/
│   │   ├── database.ts          # D1 Database operations
│   │   ├── gemini.ts            # Gemini API wrapper
│   │   └── cache.ts             # Caching logic
│   ├── middleware/
│   │   ├── cors.ts              # CORS handling
│   │   ├── rateLimit.ts         # Rate limiting
│   │   └── validation.ts        # Input validation
│   └── prompts/                 # AI prompts
│       ├── chat.ts
│       ├── report.ts
│       ├── dashboard.ts
│       ├── routine.ts
│       └── proactiveTip.ts
├── wrangler.toml                # Cloudflare Worker config
├── package.json
└── tsconfig.json
```

## 🔧 Cấu Hình

### 1. Cài Đặt Dependencies

```bash
cd worker
npm install
```

### 2. Cấu Hình wrangler.toml

```toml
name = "vision-coach-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# Database (D1)
[[d1_databases]]
binding = "DB"
database_name = "vision-coach-db"
database_id = "your-db-id"

# Environment variables
[env.production]
vars = { ENVIRONMENT = "production" }

[env.development]
vars = { ENVIRONMENT = "development" }
```

### 3. Cấu Hình Environment Variables

```bash
# Set secrets
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GOOGLE_TTS_API_KEY
npx wrangler secret put JWT_SECRET
```

## 🚀 Chạy Local

```bash
# Development
npm run dev

# Build
npm run build

# Type check
npm run type-check
```

## 📤 Deploy

```bash
# Deploy to production
npm run deploy:prod

# Deploy to staging
npm run deploy
```

## 🔐 API Endpoints

### Authentication

#### POST /api/auth/login
```json
{
  "name": "Nguyễn Văn A",
  "age": "30",
  "phone": "0912345678"
}
```

#### POST /api/auth/register
```json
{
  "name": "Nguyễn Văn B",
  "age": "25",
  "phone": "0987654321",
  "email": "user@example.com",
  "password": "optional_password"
}
```

#### POST /api/auth/verify
```json
{
  "token": "jwt_token_here"
}
```

#### POST /api/auth/logout
Header: `Authorization: Bearer jwt_token`

### AI Services

#### POST /api/report
```json
{
  "testType": "snellen",
  "testData": { /* test data */ },
  "language": "vi"
}
```

#### POST /api/dashboard
```json
{
  "testHistory": [ /* test results */ ],
  "language": "vi"
}
```

#### POST /api/chat
```json
{
  "message": "Tôi bị mờ mắt",
  "language": "vi"
}
```

#### POST /api/tts/generate
```json
{
  "text": "Xin chào",
  "language": "vi"
}
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  password_hash TEXT,
  password_salt TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  last_login INTEGER
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER,
  device_info TEXT,
  created_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Test Results Table
```sql
CREATE TABLE test_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  test_type TEXT NOT NULL,
  test_data TEXT,
  score REAL,
  result TEXT,
  duration INTEGER,
  created_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Analytics Table
```sql
CREATE TABLE analytics (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  event_type TEXT NOT NULL,
  event_data TEXT,
  created_at INTEGER
);
```

## 🔒 Security Features

1. **JWT Authentication**
   - Token expiration: 7 days
   - Secure signing with JWT_SECRET

2. **Rate Limiting**
   - Global: 100 requests/minute
   - Auth: 5 attempts/minute
   - IP-based blocking for suspicious activity

3. **Input Validation**
   - Sanitization
   - Type checking
   - Length limits

4. **Security Headers**
   - HSTS
   - CSP
   - X-Frame-Options
   - X-XSS-Protection

5. **Password Security**
   - SHA-256 hashing with salt
   - Can upgrade to bcrypt

## 📝 Environment Variables

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_strong_secret_min_32_chars

# Optional
GOOGLE_TTS_API_KEY=your_tts_key  # Falls back to GEMINI_API_KEY
ENVIRONMENT=production
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Type check
npm run type-check

# Lint
npm run lint
```

## 📚 Documentation

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [Gemini API](https://ai.google.dev/)

## [object Object]

### Database Connection Issues
```bash
# Check database status
npx wrangler d1 info vision-coach-db

# List databases
npx wrangler d1 list
```

### Secret Management
```bash
# List secrets
npx wrangler secret list

# Delete secret
npx wrangler secret delete GEMINI_API_KEY
```

### Deployment Issues
```bash
# Check logs
npx wrangler tail

# Redeploy
npm run deploy:prod
```

## ✅ Checklist

- [ ] Install dependencies: `npm install`
- [ ] Configure wrangler.toml
- [ ] Set environment secrets
- [ ] Create D1 database
- [ ] Run migrations
- [ ] Test locally: `npm run dev`
- [ ] Deploy: `npm run deploy:prod`
- [ ] Verify endpoints
- [ ] Monitor logs

## 🎯 Next Steps

1. Create D1 database
2. Run database migrations
3. Set environment variables
4. Deploy to production
5. Update frontend API URL
6. Monitor and optimize

## 📞 Support

For issues or questions:
1. Check Cloudflare Workers documentation
2. Review error logs: `npx wrangler tail`
3. Test endpoints with curl/Postman

