# 🚀 Hướng Dẫn Backend Serverless - Cloudflare Workers + D1

## 📖 Tổng Quan

Backend Vision Coach được xây dựng hoàn toàn trên hạ tầng Cloudflare:
- **Cloudflare Workers**: Chạy code JavaScript/TypeScript tại edge
- **D1 Database**: SQL database phân tán toàn cầu
- **KV Storage**: Key-value store cho caching
- **Edge Computing**: Code chạy gần người dùng nhất (300+ locations)

### 🎯 Ưu Điểm

✅ **Performance cực cao**: Latency <50ms globally  
✅ **Không cần quản lý server**: Serverless hoàn toàn  
✅ **Auto-scaling**: Tự động scale theo traffic  
✅ **Chi phí thấp**: Free tier rất generous  
✅ **Global**: Tự động replicate data  
✅ **DDoS protection**: Built-in từ Cloudflare  

## 🚀 Bắt Đầu Nhanh

### Bước 1: Cài Đặt

```bash
cd worker
npm install
```

### Bước 2: Chạy Setup Tự Động

```bash
node scripts/setup.js
```

Script này sẽ:
1. ✅ Đăng nhập Cloudflare
2. ✅ Tạo D1 database (production + preview)
3. ✅ Apply schema vào database
4. ✅ Tạo KV namespace cho caching
5. ✅ Setup secrets (API keys)
6. ✅ Test local server

### Bước 3: Chạy Thử Nghiệm

```bash
npm run dev
```

Truy cập: http://localhost:8787/health

### Bước 4: Deploy Lên Production

```bash
npm run deploy
```

Xong! Backend đã chạy trên Cloudflare edge network! 🎉

## 📝 Hướng Dẫn Chi Tiết

### 1. Đăng Nhập Cloudflare

```bash
npx wrangler login
```

Trình duyệt sẽ mở, đăng nhập với tài khoản Cloudflare.

### 2. Tạo D1 Database

D1 là SQL database của Cloudflare, tương tự SQLite nhưng chạy distributed.

```bash
# Tạo database production
npx wrangler d1 create vision-coach-db

# Tạo database preview (cho test)
npx wrangler d1 create vision-coach-db-preview
```

Bạn sẽ nhận được `database_id`. Copy và paste vào `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "vision-coach-db"
database_id = "paste-your-id-here"
preview_database_id = "paste-preview-id-here"
```

### 3. Tạo Schema Database

```bash
# Production
npm run db:schema

# Preview/Development
npm run db:schema:preview
```

Lệnh này sẽ tạo các tables:
- `users`: Thông tin người dùng
- `sessions`: JWT sessions
- `test_results`: Kết quả kiểm tra mắt
- `ai_reports`: Báo cáo từ AI
- `routines`: Lịch trình tuần
- `reminders`: Nhắc nhở
- `chat_history`: Lịch sử chat
- `user_settings`: Cài đặt người dùng
- `analytics`: Phân tích dữ liệu

### 4. Tạo KV Namespace (Caching)

KV dùng để cache response từ AI, giúp giảm chi phí và tăng tốc.

```bash
# Production
npx wrangler kv:namespace create "CACHE"

# Preview
npx wrangler kv:namespace create "CACHE" --preview
```

Copy IDs vào `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-id"
preview_id = "your-preview-id"
```

### 5. Setup Secrets

Secrets là biến môi trường bảo mật, không lưu trong code.

#### Gemini API Key

Lấy từ: https://aistudio.google.com/apikey

```bash
npx wrangler secret put GEMINI_API_KEY
```

Paste API key khi được hỏi.

#### JWT Secret

Dùng để sign JWT tokens.

```bash
npx wrangler secret put JWT_SECRET
```

Nhập một chuỗi ngẫu nhiên dài (ít nhất 32 ký tự).

**Tạo secret mạnh:**
```powershell
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 6. Test Local

```bash
npm run dev
```

Server chạy tại `http://localhost:8787`

#### Test các endpoints:

**Health check:**
```bash
curl http://localhost:8787/health
```

**Login:**
```bash
curl -X POST http://localhost:8787/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"name":"Nguyen Van A","age":25,"phone":"0912345678"}'
```

**Lưu kết quả test:**
```bash
$token = "your-token-from-login"
curl -X POST http://localhost:8787/api/tests/save `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{"testType":"snellen","testData":{"leftEye":"20/20"},"score":95}'
```

**Xem lịch sử:**
```bash
curl http://localhost:8787/api/tests/history `
  -H "Authorization: Bearer $token"
```

### 7. Deploy Production

```bash
# Deploy với cấu hình production
npm run deploy:prod

# Hoặc development
npm run deploy
```

Sau khi deploy, bạn sẽ có URL như:
```
https://vision-coach-worker.your-subdomain.workers.dev
```

## 🗄️ Làm Việc Với Database

### Query Database

```bash
# Query production
npm run db:query "SELECT COUNT(*) FROM users"

# Query local
node scripts/migrate.js query:local "SELECT * FROM users LIMIT 10"
```

### Xem Thông Tin Database

```bash
npm run db:info
```

### Tạo Migration Mới

Khi bạn muốn thay đổi schema:

```bash
# Tạo file migration
npm run db:create add-email-verification

# Edit file: migrations/2025-11-27-add-email-verification.sql
# Viết SQL của bạn

# Apply migration
node scripts/migrate.js up 2025-11-27-add-email-verification.sql
```

### Xem Danh Sách Migrations

```bash
npm run db:list
```

## 📊 Monitoring & Analytics

### Xem Logs Real-time

```bash
npx wrangler tail
```

### Cloudflare Dashboard

1. Truy cập: https://dash.cloudflare.com
2. Workers & Pages > vision-coach-worker
3. Xem:
   - Requests per second
   - Errors
   - CPU time
   - Bandwidth

### Database Analytics

```bash
# Số users
npm run db:query "SELECT COUNT(*) as total_users FROM users"

# Tests trong 7 ngày
npm run db:query "SELECT COUNT(*) as total_tests FROM test_results WHERE created_at > strftime('%s', 'now', '-7 days') * 1000"

# Top test types
npm run db:query "SELECT test_type, COUNT(*) as count FROM test_results GROUP BY test_type ORDER BY count DESC"
```

## 🔧 Commands Hữu Ích

### Development
```bash
npm run dev           # Chạy local server
npm run build         # Build TypeScript
npm run type-check    # Check types
```

### Database
```bash
npm run db:schema              # Apply schema production
npm run db:schema:preview      # Apply schema preview
npm run db:query "SQL"         # Query database
npm run db:info                # Database info
npm run db:create <name>       # Tạo migration
npm run db:list                # List migrations
```

### Deployment
```bash
npm run deploy                 # Deploy development
npm run deploy:prod            # Deploy production
```

### Monitoring
```bash
npx wrangler tail              # View logs
npx wrangler deployments list  # List deployments
npx wrangler secret list       # List secrets
```

## 🎯 API Endpoints

### Authentication

#### `POST /api/auth/login`
Đăng nhập hoặc tạo tài khoản mới.

**Request:**
```json
{
  "name": "Nguyen Van A",
  "age": 25,
  "phone": "0912345678"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_0912345678",
    "name": "Nguyen Van A",
    "token": "eyJhbGc..."
  }
}
```

#### `POST /api/auth/verify`
Xác thực token.

#### `POST /api/auth/logout`
Đăng xuất (xóa session).

### Test Results

#### `POST /api/tests/save`
Lưu kết quả kiểm tra mắt.

#### `GET /api/tests/history`
Xem lịch sử kiểm tra.

### AI Services

#### `POST /api/report`
Tạo báo cáo y tế từ AI.

#### `POST /api/dashboard`
Tạo tổng quan sức khỏe.

#### `POST /api/chat`
Chat với Dr. Eva.

#### `POST /api/routine`
Tạo lịch trình cá nhân hóa.

Xem chi tiết trong `README.md`.

## 💰 Chi Phí

### Free Tier (Miễn Phí)

Cloudflare Workers free tier rất generous:
- ✅ **100,000 requests/day**
- ✅ **10ms CPU time/request**
- ✅ **Unlimited bandwidth**

D1 Database:
- ✅ **5 GB storage**
- ✅ **5 million reads/month**
- ✅ **100,000 writes/month**

KV Storage:
- ✅ **1 GB storage**
- ✅ **100,000 reads/day**
- ✅ **1,000 writes/day**

### Paid Plans

Nếu vượt free tier:
- Workers: $5/month + $0.50/million requests
- D1: Pay as you go
- KV: $0.50/GB storage

→ Cho app nhỏ-trung, **free tier là đủ**!

## 🔒 Bảo Mật

Backend có các tính năng bảo mật:

✅ **JWT Authentication**: Token-based auth  
✅ **Rate Limiting**: 100 requests/minute/IP  
✅ **CORS Protection**: Chỉ cho phép origins hợp lệ  
✅ **SQL Injection Protection**: Parameterized queries  
✅ **Token Expiration**: JWT expires sau 7 ngày  
✅ **Session Management**: Tự động xóa sessions hết hạn  
✅ **Request Validation**: Validate tất cả inputs  

## 🌍 Global Performance

Cloudflare có 300+ data centers globally:

**Việt Nam**: 
- Hanoi
- Ho Chi Minh City

**Asia**:
- Singapore
- Tokyo
- Hong Kong
- Seoul

**Global**:
- 200+ cities worldwide

→ Users ở đâu cũng có latency <50ms!

## 🐛 Troubleshooting

### Lỗi: "Database not found"

```bash
# Kiểm tra databases
npx wrangler d1 list

# Tạo lại nếu cần
npx wrangler d1 create vision-coach-db
```

### Lỗi: "Invalid token"

```bash
# Kiểm tra secrets
npx wrangler secret list

# Set JWT_SECRET nếu thiếu
npx wrangler secret put JWT_SECRET
```

### Lỗi: "CORS error"

- Check `middleware/cors.ts`
- Thêm origin của bạn vào `allowedOrigins`

### Lỗi: "Rate limit exceeded"

- Tăng limit trong `middleware/rateLimit.ts`
- Hoặc implement IP whitelist

## 📚 Tài Liệu

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## 🎓 Next Steps

1. ✅ Deploy backend lên Cloudflare
2. ✅ Test tất cả endpoints
3. ✅ Connect frontend với backend
4. ✅ Monitor performance
5. 🚀 Launch!

---

**Chúc bạn thành công! 🚀**

Nếu cần hỗ trợ, xem `DEPLOYMENT_GUIDE.md` hoặc docs của Cloudflare.
