# ⚡ Quick Start - Vision Coach

## 1️⃣ Frontend Setup (5 phút)

```bash
# Cài dependencies
npm install

# Tạo .env.local
echo "VITE_API_URL=http://localhost:8787" > .env.local

# Chạy dev server
npm run dev
```

Mở http://localhost:5173

## 2️⃣ Backend Setup (Cloudflare Worker) (10 phút)

```bash
cd worker

# Cài dependencies
npm install

# Tạo secrets (chọn 1 trong 2 cách)

# Cách 1: Dùng wrangler CLI
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GOOGLE_TTS_API_KEY
npx wrangler secret put JWT_SECRET

# Cách 2: Tạo .env.local (dev only)
echo "GEMINI_API_KEY=your_key" > .env.local
echo "GOOGLE_TTS_API_KEY=your_key" >> .env.local
echo "JWT_SECRET=your_secret" >> .env.local

# Chạy dev server
npm run dev
```

Backend sẽ chạy ở http://localhost:8787

## 3️⃣ Test API (2 phút)

```bash
# Test login
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "age": "30",
    "phone": "0912345678"
  }'

# Response sẽ có token JWT
# Lưu token này để test endpoints khác
```

## 4️⃣ Cấu Hình Database (5 phút)

```bash
cd worker

# Tạo D1 database
npx wrangler d1 create vision-coach-db

# Copy database_id từ output vào wrangler.toml

# Chạy migrations
npx wrangler d1 execute vision-coach-db --file ./scripts/schema.sql
```

## 5️⃣ Deploy (5 phút)

```bash
cd worker

# Deploy to production
npm run deploy:prod

# Verify deployment
curl https://vision-coach-worker.yourdomain.workers.dev/health
```

## 🔑 API Keys Cần Thiết

### Google Gemini API
1. Vào https://ai.google.dev
2. Click "Get API Key"
3. Tạo API key mới
4. Copy key

### Google Cloud Text-to-Speech
1. Vào https://console.cloud.google.com
2. Enable "Cloud Text-to-Speech API"
3. Tạo service account
4. Download JSON key
5. Extract API key từ JSON

### JWT Secret
```bash
# Tạo random secret (32+ chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📝 Environment Variables

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8787  # Dev
VITE_API_URL=https://your-worker.workers.dev  # Prod
```

### Backend (Cloudflare Secrets)
```
GEMINI_API_KEY=your_key
GOOGLE_TTS_API_KEY=your_key
JWT_SECRET=your_secret_32_chars_min
```

## 🧪 Test Endpoints

### 1. Login
```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "age": "30",
    "phone": "0912345678"
  }'
```

### 2. Generate Report
```bash
curl -X POST http://localhost:8787/api/report \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "testType": "snellen",
    "testData": {"score": "20/40", "accuracy": 85},
    "language": "vi"
  }'
```

### 3. Generate TTS
```bash
curl -X POST http://localhost:8787/api/tts/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Xin chào",
    "language": "vi"
  }'
```

## 🚀 Deployment Checklist

- [ ] Frontend: `npm run build` ✅
- [ ] Backend: `npm run deploy:prod` ✅
- [ ] Update VITE_API_URL ✅
- [ ] Test login flow ✅
- [ ] Test TTS generation ✅
- [ ] Test AI endpoints ✅
- [ ] Monitor logs ✅

## 🆘 Troubleshooting

### Port 8787 already in use
```bash
# Kill process
lsof -i :8787 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port
npx wrangler dev --port 8788
```

### Database connection failed
```bash
# Check database
npx wrangler d1 info vision-coach-db

# Re-run migrations
npx wrangler d1 execute vision-coach-db --file ./scripts/schema.sql
```

### Secret not found
```bash
# List secrets
npx wrangler secret list

# Re-add secret
npx wrangler secret put GEMINI_API_KEY
```

### CORS errors
- Check CORS middleware in `worker/src/middleware/cors.ts`
- Verify frontend URL is allowed
- Check browser console for details

## 📚 Next Steps

1. Read [CLOUDFLARE_WORKER_SETUP.md](CLOUDFLARE_WORKER_SETUP.md)
2. Read [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
3. Review [BACKEND_UPGRADE_SUMMARY.md](BACKEND_UPGRADE_SUMMARY.md)
4. Check worker logs: `npx wrangler tail`

## 💡 Tips

- Use Postman for testing APIs
- Check browser DevTools for network requests
- Monitor worker logs in real-time: `npx wrangler tail`
- Use `npm run type-check` to catch TypeScript errors
- Test locally before deploying to production

## ✅ You're Ready!

Giờ bạn có:
- ✅ Frontend chạy ở localhost:5173
- ✅ Backend chạy ở localhost:8787
- ✅ Database được cấu hình
- ✅ API keys được set up
- ✅ Sẵn sàng deploy

Enjoy! 🎉

