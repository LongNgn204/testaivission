# 🚀 Vision Coach - Cloudflare Workers Backend

Backend serverless cho ứng dụng Vision Coach, chạy trên Cloudflare Workers với D1 Database.

## ✨ Features

- **🔐 Authentication**: JWT-based authentication với D1 database
- **🗄️ D1 Database**: SQL database cho users, tests, sessions, và analytics
- **🤖 AI Integration**: Gemini AI cho báo cáo y tế và chatbot
- **⚡ Edge Computing**: Chạy trên Cloudflare's global network
- **💾 KV Caching**: Response caching với Cloudflare KV
- **🛡️ Security**: Rate limiting, CORS, JWT validation
- **📊 Analytics**: Event tracking và user analytics

## 📁 Cấu Trúc Project

```
worker/
├── src/
│   ├── index.ts              # Main entry point & routing
│   ├── types.ts              # TypeScript type definitions
│   ├── handlers/             # API request handlers
│   │   ├── auth.ts           # Authentication (login, verify, logout)
│   │   ├── aiReport.ts       # AI report generation
│   │   ├── dashboard.ts      # Dashboard insights
│   │   ├── chat.ts           # Chatbot
│   │   ├── routine.ts        # Weekly routines
│   │   └── proactiveTip.ts   # Health tips
│   ├── services/
│   │   ├── database.ts       # D1 database service
│   │   ├── gemini.ts         # Gemini AI service
│   │   └── cache.ts          # KV caching service
│   ├── middleware/
│   │   ├── cors.ts           # CORS handling
│   │   ├── rateLimit.ts      # Rate limiting
│   │   └── validation.ts     # Request validation
│   └── prompts/              # AI prompts
├── scripts/
│   ├── setup.js              # Quick setup script
│   └── migrate.js            # Database migration helper
├── migrations/               # Database migrations
├── schema.sql               # D1 database schema
├── wrangler.toml            # Cloudflare configuration
├── package.json
├── tsconfig.json
└── DEPLOYMENT_GUIDE.md      # Deployment instructions

```

## 🚀 Quick Start

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Chạy setup script (Recommended)

```bash
node scripts/setup.js
```

Script sẽ hướng dẫn bạn:
- Đăng nhập Cloudflare
- Tạo D1 database
- Tạo KV namespace
- Cấu hình secrets
- Test local server

### 3. Hoặc setup thủ công

#### a. Đăng nhập Cloudflare

```bash
npx wrangler login
```

#### b. Tạo D1 Database

```bash
# Production database
npx wrangler d1 create vision-coach-db

# Preview database
npx wrangler d1 create vision-coach-db-preview
```

Cập nhật `wrangler.toml` với database IDs.

#### c. Apply Schema

```bash
npm run db:schema
npm run db:schema:preview
```

#### d. Setup Secrets

```bash
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put JWT_SECRET
```

### 4. Development

```bash
npm run dev
```

Server chạy tại: `http://localhost:8787`

### 5. Deploy

```bash
npm run deploy        # Development
npm run deploy:prod   # Production
```

## 📚 API Endpoints

### Authentication

#### POST `/api/auth/login`
Login hoặc tạo user mới

```json
{
  "name": "Nguyen Van A",
  "age": 25,
  "phone": "0912345678"
}
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "user_0912345678",
    "name": "Nguyen Van A",
    "age": 25,
    "phone": "0912345678",
    "token": "eyJhbGc..."
  }
}
```

#### POST `/api/auth/verify`
Verify JWT token

```json
{
  "token": "eyJhbGc..."
}
```

#### POST `/api/auth/logout`
Logout user

Headers: `Authorization: Bearer <token>`

### Test Results

#### POST `/api/tests/save`
Lưu kết quả test

Headers: `Authorization: Bearer <token>`

```json
{
  "testType": "snellen",
  "testData": {
    "leftEye": "20/20",
    "rightEye": "20/25"
  },
  "score": 95,
  "duration": 120
}
```

#### GET `/api/tests/history`
Lấy lịch sử test

Headers: `Authorization: Bearer <token>`

Query params:
- `limit`: Số lượng records (default: 100)
- `offset`: Offset cho pagination (default: 0)

### AI Services

#### POST `/api/report`
Tạo báo cáo AI cho test result

```json
{
  "testType": "snellen",
  "testData": {...},
  "history": [...],
  "language": "vi"
}
```

#### POST `/api/dashboard`
Tạo dashboard insights

```json
{
  "history": [...],
  "language": "vi"
}
```

#### POST `/api/chat`
Chat với Dr. Eva

```json
{
  "message": "Làm sao để cải thiện thị lực?",
  "language": "vi"
}
```

#### POST `/api/routine`
Tạo routine cá nhân hóa

```json
{
  "answers": {
    "worksWithComputer": "yes",
    "wearsGlasses": "no",
    "goal": "improve"
  },
  "language": "vi"
}
```

### Health Check

#### GET `/health`
Kiểm tra server status

```json
{
  "status": "ok",
  "timestamp": "2025-11-27T...",
  "version": "1.0.0"
}
```

## 🗄️ Database Schema

### Tables

- **users**: User accounts
- **sessions**: JWT sessions
- **test_results**: Test results
- **ai_reports**: Cached AI reports
- **routines**: Weekly routines
- **reminders**: User reminders
- **chat_history**: Chat conversations
- **user_settings**: User preferences
- **analytics**: Event tracking

Xem chi tiết trong `schema.sql`.

## 🛠️ Database Commands

```bash
# Apply schema
npm run db:schema
npm run db:schema:preview

# Create migration
npm run db:create add-new-field

# List migrations
npm run db:list

# Query database
npm run db:query "SELECT COUNT(*) FROM users"

# Database info
npm run db:info
```

## 🔧 Configuration

### Environment Variables (Development)

Copy `.env.example` to `.env`:

```env
GEMINI_API_KEY=your_api_key
JWT_SECRET=your_secret
```

### Secrets (Production)

```bash
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put JWT_SECRET
```

### wrangler.toml

Main configuration file. Update:
- `account_id`: Your Cloudflare account ID
- `database_id`: D1 database IDs
- `kv_namespaces`: KV namespace IDs

## 📊 Monitoring

### View Logs

```bash
npx wrangler tail
npx wrangler tail --env production
```

### Cloudflare Dashboard

- Workers & Pages > vision-coach-worker
- View metrics, errors, CPU usage
- D1 Database > vision-coach-db
- KV Namespace > CACHE

## 🧪 Testing

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Test endpoint
curl http://localhost:8787/health
```

## 📈 Performance

- **Cold start**: ~10-20ms
- **Warm requests**: <5ms
- **D1 queries**: 10-50ms
- **KV reads**: <1ms
- **AI generation**: 1-5s (cached: <1ms)

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Rate limiting (100 req/min per IP)
- ✅ CORS protection
- ✅ Request validation
- ✅ SQL injection protection (parameterized queries)
- ✅ Token expiration (7 days)
- ✅ Session management

## 🌍 Global Deployment

Cloudflare Workers chạy trên 300+ locations globally:
- Asia: Tokyo, Singapore, Hong Kong, Seoul, Mumbai
- Europe: London, Paris, Frankfurt, Amsterdam
- Americas: New York, San Francisco, São Paulo
- Oceania: Sydney, Melbourne

Requests tự động route đến edge location gần nhất.

## 📝 Migration Guide

### Từ KV sang D1

Nếu bạn đang dùng KV storage, migrate sang D1:

1. Export data từ KV
2. Transform sang SQL inserts
3. Import vào D1

```bash
# Export users from KV
node scripts/export-kv.js users

# Import to D1
npm run db:query "$(cat users-export.sql)"
```

## 🐛 Troubleshooting

### Database not found
```bash
npx wrangler d1 list
npx wrangler d1 create vision-coach-db
```

### Token errors
```bash
npx wrangler secret list
npx wrangler secret put JWT_SECRET
```

### CORS errors
- Check `middleware/cors.ts`
- Verify allowed origins

### Rate limit
- Adjust in `middleware/rateLimit.ts`
- Increase limits if needed

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Gemini API](https://ai.google.dev/docs)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test locally
5. Submit pull request

## 📄 License

MIT License - See LICENSE file

## 🎯 Roadmap

- [ ] WebSocket support cho real-time features
- [ ] Durable Objects cho stateful chat
- [ ] R2 storage cho ảnh/files
- [ ] GraphQL API
- [ ] Admin dashboard
- [ ] Advanced analytics
- [ ] Multi-language support expansion

## 💬 Support

- GitHub Issues: [Report bugs](https://github.com/yourusername/vision-coach/issues)
- Email: support@visioncoach.com
- Documentation: See `DEPLOYMENT_GUIDE.md`

---

**Built with ❤️ using Cloudflare Workers + D1**

**Ready to deploy? Run: `npm run deploy`** 🚀
