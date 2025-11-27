# ✅ DATABASE SETUP HOÀN TẤT!

## 🎉 Tóm tắt

Database **testmatai** đã được tạo và setup thành công!

### ✅ Đã Hoàn Thành:

1. **D1 Database**: `testmatai` (ID: 4f94c079-cbcf-4bed-85ea-de9e9b302e4e)
2. **Schema Applied**: 9 tables đã được tạo:
   - ✅ users
   - ✅ sessions
   - ✅ test_results
   - ✅ ai_reports
   - ✅ routines
   - ✅ reminders
   - ✅ chat_history
   - ✅ user_settings
   - ✅ analytics

3. **Config**: `wrangler.toml` đã được cấu hình đúng

---

## 🚀 Các Bước Tiếp Theo

### 1. Setup Gemini API Key

Lấy API key từ: https://aistudio.google.com/apikey

Tạo file `.env` trong thư mục `worker/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=dev-worker-secret-change-me-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ
```

### 2. Chạy Local Development Server

```bash
cd worker
npm run dev
```

Server sẽ chạy tại: http://127.0.0.1:8787

### 3. Test API Endpoints

#### Health Check
Mở browser: http://127.0.0.1:8787/health

Hoặc dùng PowerShell:
```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8787/health
```

#### Test Login
```powershell
$body = @{
    name = "Nguyen Van A"
    age = 25
    phone = "0912345678"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://127.0.0.1:8787/api/auth/login -Method POST -Body $body -ContentType "application/json"
```

Bạn sẽ nhận được token, lưu lại để dùng cho các request khác.

#### Test Save Result
```powershell
$token = "paste_your_token_here"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    testType = "snellen"
    testData = @{
        leftEye = "20/20"
        rightEye = "20/25"
    }
    score = 95
    duration = 120
} | ConvertTo-Json

Invoke-RestMethod -Uri http://127.0.0.1:8787/api/tests/save -Method POST -Body $body -Headers $headers
```

#### Test Get History
```powershell
$token = "paste_your_token_here"
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://127.0.0.1:8787/api/tests/history?limit=10" -Headers $headers
```

---

## 📊 Database Commands

### Query Database
```bash
npx wrangler d1 execute testmatai --remote --command="SELECT COUNT(*) FROM users"
```

### Xem tất cả users
```bash
npx wrangler d1 execute testmatai --remote --command="SELECT * FROM users LIMIT 10"
```

### Xem test results
```bash
npx wrangler d1 execute testmatai --remote --command="SELECT * FROM test_results ORDER BY created_at DESC LIMIT 5"
```

### Xem sessions
```bash
npx wrangler d1 execute testmatai --remote --command="SELECT * FROM sessions"
```

---

## 🌐 Deploy to Production

Khi đã test xong local, deploy lên Cloudflare:

### 1. Setup Production Secrets

```bash
# Set Gemini API Key
npx wrangler secret put GEMINI_API_KEY
# Paste your key when prompted

# Set JWT Secret
npx wrangler secret put JWT_SECRET
# Paste a strong secret (min 32 chars)
```

### 2. Deploy

```bash
npm run deploy
```

Sau khi deploy, bạn sẽ có URL production:
```
https://vision-coach-worker.YOUR_SUBDOMAIN.workers.dev
```

---

## 📝 Các Lệnh Hữu Ích

```bash
# Development
npm run dev              # Start local server
npm run build            # Build TypeScript

# Database
npm run db:query         # Query database
npm run db:info          # Database info

# Deployment
npm run deploy           # Deploy to production
npx wrangler tail        # View logs
npx wrangler secret list # List secrets
```

---

## 🐛 Troubleshooting

### Nếu gặp lỗi "Worker does not exist"
→ Chạy `npm run deploy` trước khi set secrets

### Nếu gặp lỗi "Invalid token"
→ Check file `.env` đã có `JWT_SECRET` chưa

### Nếu gặp lỗi CORS
→ Đảm bảo frontend đang gọi đúng URL của worker

### Nếu gặp lỗi database
→ Chạy lại: `npx wrangler d1 execute testmatai --remote --file=schema.sql`

---

## 📚 Next Steps

1. ✅ **Test Local**: Chạy `npm run dev` và test các endpoints
2. ✅ **Setup Gemini**: Thêm GEMINI_API_KEY vào `.env`
3. ✅ **Deploy**: Chạy `npm run deploy`
4. ✅ **Connect Frontend**: Update frontend để gọi worker API
5. 🚀 **Launch**: Ứng dụng sẵn sàng!

---

## 📖 Documentation

- `README.md` - Full API documentation (English)
- `HUONG_DAN_TIENG_VIET.md` - Hướng dẫn chi tiết (Tiếng Việt)
- `DEPLOYMENT_GUIDE.md` - Deployment guide

---

**🎉 Chúc mừng! Backend đã sẵn sàng! 🚀**
