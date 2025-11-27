# 🚀 Hướng Dẫn Triển Khai Cloudflare Workers với D1 Database

## 📋 Mục Lục
1. [Cài Đặt Ban Đầu](#cài-đặt-ban-đầu)
2. [Tạo D1 Database](#tạo-d1-database)
3. [Cấu Hình Wrangler](#cấu-hình-wrangler)
4. [Thiết Lập Secrets](#thiết-lập-secrets)
5. [Development & Testing](#development--testing)
6. [Deployment](#deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🎯 Cài Đặt Ban Đầu

### 1. Cài đặt Dependencies

```bash
cd worker
npm install
```

### 2. Đăng nhập Cloudflare

```bash
npx wrangler login
```

Trình duyệt sẽ mở và yêu cầu bạn xác thực với Cloudflare.

---

## 🗄️ Tạo D1 Database

### 1. Tạo Database mới

```bash
# Tạo production database
npx wrangler d1 create vision-coach-db

# Tạo preview database (cho development)
npx wrangler d1 create vision-coach-db-preview
```

**Output sẽ trông như này:**
```
✅ Successfully created DB 'vision-coach-db' in region APAC
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. Cập nhật wrangler.toml

Sao chép `database_id` từ output và cập nhật `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "vision-coach-db"
database_id = "YOUR_PRODUCTION_DATABASE_ID_HERE"
preview_database_id = "YOUR_PREVIEW_DATABASE_ID_HERE"
```

### 3. Chạy Migration Schema

```bash
# Áp dụng schema vào production database
npx wrangler d1 execute vision-coach-db --file=schema.sql

# Áp dụng schema vào preview database
npx wrangler d1 execute vision-coach-db-preview --file=schema.sql
```

### 4. Verify Database

```bash
# Kiểm tra tables đã tạo
npx wrangler d1 execute vision-coach-db --command="SELECT name FROM sqlite_master WHERE type='table';"

# Kiểm tra dữ liệu users (nếu có)
npx wrangler d1 execute vision-coach-db --command="SELECT COUNT(*) as count FROM users;"
```

---

## ⚙️ Cấu Hình Wrangler

### 1. Account ID

Lấy Account ID từ Cloudflare Dashboard:
1. Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Chọn Workers & Pages
3. Copy Account ID từ URL hoặc sidebar

Cập nhật trong `wrangler.toml`:
```toml
account_id = "YOUR_ACCOUNT_ID_HERE"
```

### 2. KV Namespace (Caching)

Tạo KV namespace cho caching:

```bash
# Production KV
npx wrangler kv:namespace create "CACHE"

# Preview KV
npx wrangler kv:namespace create "CACHE" --preview
```

Cập nhật IDs trong `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_ID_HERE"
preview_id = "YOUR_PREVIEW_KV_ID_HERE"
```

---

## 🔐 Thiết Lập Secrets

### 1. GEMINI_API_KEY

Lấy API key từ [Google AI Studio](https://aistudio.google.com/apikey):

```bash
npx wrangler secret put GEMINI_API_KEY
```

Nhập API key khi được yêu cầu.

### 2. JWT_SECRET (Production)

```bash
npx wrangler secret put JWT_SECRET --env production
```

Nhập một chuỗi secret mạnh (ít nhất 32 ký tự).

**Ví dụ tạo secret mạnh:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3. Verify Secrets

```bash
npx wrangler secret list
```

---

## 🧪 Development & Testing

### 1. Local Development

```bash
npm run dev
```

Worker sẽ chạy tại: `http://localhost:8787`

### 2. Test Endpoints

#### Health Check
```bash
curl http://localhost:8787/health
```

#### Login
```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyen Van A",
    "age": 25,
    "phone": "0912345678"
  }'
```

#### Save Test Result
```bash
curl -X POST http://localhost:8787/api/tests/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "testType": "snellen",
    "testData": {"leftEye": "20/20", "rightEye": "20/25"},
    "score": 95,
    "duration": 120
  }'
```

#### Get Test History
```bash
curl http://localhost:8787/api/tests/history?limit=10&offset=0 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Database Queries (Local)

```bash
# Query local D1
npx wrangler d1 execute vision-coach-db --local --command="SELECT * FROM users LIMIT 10;"
```

---

## 🚀 Deployment

### 1. Deploy to Production

```bash
# Deploy với production environment
npm run deploy:prod

# Hoặc default environment
npm run deploy
```

### 2. Verify Deployment

```bash
# Kiểm tra worker status
npx wrangler deployments list

# Test production endpoint
curl https://vision-coach-worker.YOUR_SUBDOMAIN.workers.dev/health
```

### 3. Custom Domain (Optional)

Nếu bạn có custom domain:

1. Thêm route trong `wrangler.toml`:
```toml
[env.production]
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

2. Deploy lại:
```bash
npm run deploy:prod
```

---

## 📊 Monitoring & Maintenance

### 1. View Logs

```bash
# Xem logs real-time
npx wrangler tail

# Xem logs của production
npx wrangler tail --env production
```

### 2. Analytics

Truy cập Cloudflare Dashboard:
- Workers & Pages > Your Worker > Metrics
- Xem requests, errors, CPU time, etc.

### 3. Database Queries

```bash
# Xem số lượng users
npx wrangler d1 execute vision-coach-db --command="SELECT COUNT(*) FROM users;"

# Xem test results gần đây
npx wrangler d1 execute vision-coach-db --command="SELECT * FROM test_results ORDER BY created_at DESC LIMIT 10;"

# Xem sessions active
npx wrangler d1 execute vision-coach-db --command="SELECT COUNT(*) FROM sessions WHERE expires_at > $(date +%s)000;"
```

### 4. Cleanup Tasks

Tạo scheduled task để cleanup (optional):

```bash
# Thêm vào wrangler.toml
[triggers]
crons = ["0 2 * * *"]  # Chạy mỗi ngày lúc 2 AM
```

Thêm handler trong `index.ts`:
```typescript
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const db = new DatabaseService(env.DB);
    await db.cleanup();
  }
}
```

---

## 🔧 Database Migrations

### Tạo Migration Mới

1. Tạo file migration:
```bash
# Format: YYYY-MM-DD-description.sql
touch migrations/2025-11-27-add-user-preferences.sql
```

2. Viết SQL:
```sql
-- migrations/2025-11-27-add-user-preferences.sql
ALTER TABLE users ADD COLUMN preferences TEXT;
CREATE INDEX idx_users_preferences ON users(preferences);
```

3. Apply migration:
```bash
npx wrangler d1 execute vision-coach-db --file=migrations/2025-11-27-add-user-preferences.sql
```

---

## 📝 Environment Variables

### Development (.env)
```env
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=dev-secret-change-in-production
```

### Production (Wrangler Secrets)
```bash
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put JWT_SECRET --env production
```

---

## 🐛 Troubleshooting

### Issue: Database not found
```bash
# Verify database exists
npx wrangler d1 list

# Re-create if needed
npx wrangler d1 create vision-coach-db
```

### Issue: Token verification failed
```bash
# Check JWT_SECRET is set
npx wrangler secret list

# Set if missing
npx wrangler secret put JWT_SECRET
```

### Issue: CORS errors
- Kiểm tra `middleware/cors.ts` đã cấu hình đúng origins
- Verify headers trong response

### Issue: Rate limit errors
- Điều chỉnh `middleware/rateLimit.ts`
- Tăng limits nếu cần

---

## 📚 Tài Liệu Tham Khảo

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [KV Storage Docs](https://developers.cloudflare.com/kv/)

---

## 🎉 Hoàn Thành!

Backend của bạn đã sẵn sàng để chạy trên Cloudflare's Edge Network!

### Next Steps:
1. ✅ Tạo D1 database
2. ✅ Deploy worker
3. ✅ Setup secrets
4. ✅ Test endpoints
5. 🚀 Connect frontend

---

**Developed with ❤️ for Vision Coach**
