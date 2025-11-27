# 🚀 HƯỚNG DẪN DEPLOY BACKEND LÊN CLOUDFLARE WORKERS

## ✅ ĐÃ HOÀN THÀNH

### 1. **Cài Đặt Wrangler CLI** ✓
- ✅ Đã cài đặt `wrangler` trong project
- ✅ Thêm scripts vào package.json

### 2. **Tạo Worker File** ✓
- ✅ `worker.js` - Cloudflare Workers compatible code
- ✅ Không dùng Express, dùng native fetch API
- ✅ JWT authentication tương thích với Web Crypto API
- ✅ Gemini AI integration

### 3. **Configuration** ✓
- ✅ `wrangler.toml` - Cloudflare Workers config
- ✅ Scripts trong package.json

---

## 🎯 CÁCH DEPLOY

### Bước 1: Login vào Cloudflare

```powershell
# Login (sẽ mở browser)
npx wrangler login

# Hoặc dùng API token
npx wrangler login --api-token YOUR_API_TOKEN
```

**⚠️ QUAN TRỌNG:** Bạn cần:
1. Tài khoản Cloudflare (miễn phí tại https://dash.cloudflare.com/sign-up)
2. Verify email
3. Đăng nhập trong browser khi wrangler yêu cầu

### Bước 2: Set Environment Variables (Secrets)

```powershell
# Set Gemini API Key
npx wrangler secret put GEMINI_API_KEY
# Paste: AIzaSyDse6RpvHiuSXqCBq5v2SGZ798Ff0Ykse0

# Set JWT Secret
npx wrangler secret put JWT_SECRET
# Paste: vision-coach-secret-key-change-in-production-2024
```

### Bước 3: Test Locally (Optional)

```powershell
# Run worker locally
npm run worker:dev

# Test trong browser: http://localhost:8787
```

### Bước 4: Deploy to Cloudflare

```powershell
# Deploy lần đầu (sẽ tạo worker mới)
npm run worker:deploy

# Hoặc
npx wrangler deploy
```

### Bước 5: Lấy Worker URL

Sau khi deploy, bạn sẽ nhận được URL như:
```
https://vision-coach-backend.YOUR_SUBDOMAIN.workers.dev
```

### Bước 6: Cập Nhật Frontend

Update file `.env.local`:
```env
VITE_API_URL=https://vision-coach-backend.YOUR_SUBDOMAIN.workers.dev
```

---

## 📋 COMMANDS REFERENCE

### Development
```powershell
# Chạy worker locally với hot reload
npm run worker:dev

# Xem logs real-time từ deployed worker
npm run worker:tail
```

### Deployment
```powershell
# Deploy to development (default)
npm run worker:deploy

# Deploy to production
npm run worker:publish
```

### Secrets Management
```powershell
# Thêm/update secret
npx wrangler secret put SECRET_NAME

# List all secrets
npx wrangler secret list

# Delete secret
npx wrangler secret delete SECRET_NAME
```

### Monitoring
```powershell
# View real-time logs
npx wrangler tail

# View worker info
npx wrangler deployments list
```

---

## 🔧 TROUBLESHOOTING

### Login Failed
```powershell
# Clear cache và login lại
npx wrangler logout
npx wrangler login
```

### Deploy Failed - Authentication Error
```powershell
# Check login status
npx wrangler whoami

# Re-login
npx wrangler login
```

### Worker Error After Deploy
```powershell
# Check logs
npx wrangler tail

# Check worker status
npx wrangler deployments list
```

### Secrets Not Working
```powershell
# List secrets to verify
npx wrangler secret list

# Re-add secrets
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put JWT_SECRET
```

### CORS Issues
Cập nhật `worker.js`, thay `'*'` bằng domain cụ thể:
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-frontend-domain.com',
  // ...
};
```

---

## 🌍 CLOUDFLARE WORKERS FEATURES

### ✅ Advantages
- **Global Edge Network** - Deploy to 300+ locations worldwide
- **0ms Cold Start** - Không có cold start như serverless functions
- **Free Tier** - 100,000 requests/day miễn phí
- **Built-in DDoS Protection** - Security mặc định
- **Auto-scaling** - Tự động scale theo traffic
- **HTTPS Default** - SSL/TLS miễn phí

### 📊 Limits (Free Tier)
- **CPU Time**: 10ms per request
- **Memory**: 128MB
- **Requests**: 100,000/day
- **Script Size**: 1MB compressed

### 💰 Pricing
- **Free**: 100,000 requests/day
- **Paid** ($5/month):
  - 10 million requests
  - $0.50 per additional million

---

## 🔐 SECURITY BEST PRACTICES

### 1. Environment Variables
```powershell
# NEVER commit secrets to git
# Always use wrangler secrets

npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put JWT_SECRET
```

### 2. CORS Configuration
Update `worker.js` with specific origins:
```javascript
const allowedOrigins = [
  'https://your-domain.com',
  'https://www.your-domain.com',
];

const origin = request.headers.get('Origin');
if (allowedOrigins.includes(origin)) {
  corsHeaders['Access-Control-Allow-Origin'] = origin;
}
```

### 3. Rate Limiting (Advanced)
Sử dụng Cloudflare KV hoặc Durable Objects:
```javascript
// Example with KV
const rateLimitKey = `rate_limit_${clientIP}`;
const count = await env.RATE_LIMIT_KV.get(rateLimitKey);

if (count >= 100) {
  return new Response('Too many requests', { status: 429 });
}
```

---

## 📈 MONITORING & ANALYTICS

### 1. Cloudflare Dashboard
- Truy cập: https://dash.cloudflare.com
- Workers & Pages → Your Worker
- Xem metrics: Requests, CPU time, Errors

### 2. Real-time Logs
```powershell
# Tail logs
npx wrangler tail

# With filters
npx wrangler tail --status error
```

### 3. Custom Analytics
Thêm vào worker:
```javascript
// Log custom metrics
console.log(JSON.stringify({
  event: 'login',
  userId: userData.id,
  timestamp: Date.now(),
}));
```

---

## 🔄 CI/CD DEPLOYMENT

### GitHub Actions Example
Tạo `.github/workflows/deploy-worker.yml`:
```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy
```

---

## 🆚 SO SÁNH: LOCAL vs CLOUDFLARE

| Feature | Local (Express) | Cloudflare Workers |
|---------|----------------|-------------------|
| Setup | ✅ Dễ, npm install | ⚠️ Cần Cloudflare account |
| Performance | ⚠️ Phụ thuộc server | ✅ Global edge, cực nhanh |
| Scaling | ❌ Manual | ✅ Auto-scale |
| Cost | 💰 Server cost | ✅ Free tier generous |
| Cold Start | ⚠️ Có thể có | ✅ Không có |
| Database | ✅ Full support | ⚠️ Cần KV/Durable Objects |
| Development | ✅ Hot reload | ✅ wrangler dev |
| Monitoring | ⚠️ Tự setup | ✅ Built-in dashboard |

---

## 📝 QUICK START CHECKLIST

- [ ] Có tài khoản Cloudflare (sign up miễn phí)
- [ ] Đã login: `npx wrangler login`
- [ ] Set secrets: `GEMINI_API_KEY`, `JWT_SECRET`
- [ ] Test local: `npm run worker:dev`
- [ ] Deploy: `npm run worker:deploy`
- [ ] Lấy worker URL từ output
- [ ] Update `.env.local` với worker URL
- [ ] Test từ frontend
- [ ] Monitor logs: `npx wrangler tail`

---

## 🎉 HOÀN THÀNH!

Sau khi hoàn tất các bước trên, backend của bạn sẽ:
- ✅ Deploy trên Cloudflare global network
- ✅ Tự động scale theo traffic
- ✅ Có SSL/TLS miễn phí
- ✅ Protected by Cloudflare DDoS protection
- ✅ 0ms cold start
- ✅ Free tier 100k requests/day

**Worker URL Example:**
```
https://vision-coach-backend.longvu123.workers.dev
```

**Test Commands:**
```powershell
# Test health
curl https://vision-coach-backend.YOUR_SUBDOMAIN.workers.dev/health

# Test login
curl -X POST https://vision-coach-backend.YOUR_SUBDOMAIN.workers.dev/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"name":"Test","age":"25","phone":"0912345678"}'
```

---

## 🆘 SUPPORT

- **Cloudflare Docs**: https://developers.cloudflare.com/workers/
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Community**: https://community.cloudflare.com/

---

## 🔥 NEXT STEPS

Sau khi deploy thành công:

1. **Persistent Storage**: Upgrade to Cloudflare KV hoặc Durable Objects
2. **Custom Domain**: Map worker to your domain
3. **CI/CD**: Setup GitHub Actions auto-deploy
4. **Monitoring**: Enable analytics & alerts
5. **Rate Limiting**: Implement advanced rate limiting with KV
6. **Caching**: Add caching layer với Cache API

Chúc bạn deploy thành công! 🚀
