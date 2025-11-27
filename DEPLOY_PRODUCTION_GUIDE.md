# HƯỚNG DẪN DEPLOY PRODUCTION - VISION COACH

## [object Object] LÊN PRODUCTION (100% HOÀN HẢO)

---

## BƯỚC 1: CHUẨN BỊ PRODUCTION

### 1.1 Kiểm tra Build

```bash
# Backend
cd D:\git\test\worker
npm run build
# Expected: 0 errors

# Frontend
cd D:\git\test
npm run build
# Expected: ✓ built successfully
```

### 1.2 Kiểm tra Tests

```bash
# Chạy tất cả tests
npm test
# Expected: All tests passing
```

---

## BƯỚC 2: SETUP PRODUCTION SECRETS

### 2.1 Tạo Production JWT Secret

```bash
cd D:\git\test\worker

# Tạo secret mạnh
wrangler secret put JWT_SECRET --env production
```

**Nhập secret mạnh (tối thiểu 32 ký tự):**
```
your-super-secret-production-key-12345678901234567890
```

### 2.2 Tạo Production Gemini API Key

```bash
wrangler secret put GEMINI_API_KEY --env production
```

**Nhập Gemini API key từ Google Cloud:**
```
AIzaSyD...your-gemini-api-key...
```

### 2.3 Kiểm tra Secrets

```bash
wrangler secret list --env production
```

**Expected:**
```
GEMINI_API_KEY
JWT_SECRET
```

---

## BƯỚC 3: DEPLOY BACKEND

### 3.1 Deploy Worker

```bash
cd D:\git\test\worker
wrangler deploy --env production
```

**Expected Output:**
```
✓ Uploaded vision-coach-worker
✓ Published to https://vision-coach-worker.xxx.workers.dev
```

### 3.2 Kiểm tra Deployment

```bash
# Kiểm tra health endpoint
curl https://vision-coach-worker.xxx.workers.dev/health

# Expected:
# {
#   "status": "ok",
#   "timestamp": "2025-11-27T...",
#   "version": "1.0.0"
# }
```

### 3.3 Kiểm tra Auth Endpoint

```bash
curl -X POST https://vision-coach-worker.xxx.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "age": "25",
    "phone": "0912345678"
  }'

# Expected: Login successful
```

---

## BƯỚC 4: DEPLOY FRONTEND

### 4.1 Build Production

```bash
cd D:\git\test

# Set production API URL
set VITE_API_URL=https://vision-coach-worker.xxx.workers.dev

# Build
npm run build

# Expected:
# ✓ built in 57.58s
```

### 4.2 Deploy ke Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd D:\git\test
vercel --prod

# Expected:
# ✓ Production: https://vision-coach.vercel.app
```

### 4.3 Deploy ke Netlify (Alternative)

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
cd D:\git\test
netlify deploy --prod --dir=dist

# Expected:
# ✓ Published to https://vision-coach.netlify.app
```

### 4.4 Deploy ke GitHub Pages (Alternative)

```bash
# Build
npm run build

# Deploy dist folder to GitHub Pages
# Using GitHub Actions or manual upload
```

---

## BƯỚC 5: CONFIGURE DOMAIN

### 5.1 Cloudflare Domain (Recommended)

1. Đăng nhập Cloudflare
2. Thêm domain
3. Cấu hình DNS:
   - Backend Worker: `api.yourdomain.com` → Worker
   - Frontend: `yourdomain.com` → Vercel/Netlify

### 5.2 Update wrangler.toml

```toml
[env.production]
vars = { ENVIRONMENT = "production" }
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

### 5.3 Deploy lại Worker

```bash
wrangler deploy --env production
```

---

## BƯỚC 6: SETUP SSL/HTTPS

### 6.1 Cloudflare SSL

- Tự động cấp SSL certificate
- Chọn "Full (strict)" mode
- Enable HSTS

### 6.2 Vercel/Netlify SSL

- Tự động cấp SSL certificate
- Không cần cấu hình thêm

---

## BƯỚC 7: ENVIRONMENT VARIABLES

### 7.1 Frontend Environment

**Vercel:**
```
VITE_API_URL=https://api.yourdomain.com
```

**Netlify:**
```
VITE_API_URL=https://api.yourdomain.com
```

### 7.2 Backend Environment

**Cloudflare Worker:**
```
JWT_SECRET=your-production-secret
GEMINI_API_KEY=your-gemini-key
ENVIRONMENT=production
```

---

## BƯỚC 8: DATABASE CONFIGURATION

### 8.1 Production D1 Database

```bash
# Tạo production database
wrangler d1 create vision-coach-prod

# Migrate schema
wrangler d1 execute vision-coach-prod --file schema.sql --env production
```

### 8.2 Update wrangler.toml

```toml
[[d1_databases]]
binding = "DB"
database_name = "vision-coach-prod"
database_id = "your-production-db-id"
```

---

## BƯỚC 9: MONITORING & LOGGING

### 9.1 Cloudflare Analytics

- Enable Analytics Engine
- Monitor Worker performance
- Track error rates

### 9.2 Error Tracking (Sentry)

```bash
# Install Sentry
npm install @sentry/react

# Configure in frontend
```

### 9.3 Performance Monitoring

- Enable Cloudflare Analytics
- Monitor Core Web Vitals
- Track user experience

---

## BƯỚC 10: TESTING PRODUCTION

### 10.1 Health Check

```bash
curl https://yourdomain.com/health
```

### 10.2 Login Test

```bash
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "age": "25",
    "phone": "0912345678"
  }'
```

### 10.3 Browser Test

1. Open: `https://yourdomain.com`
2. Login with test account
3. Take a test
4. View history
5. Check all features

### 10.4 Performance Test

```bash
# Run Lighthouse
# Expected: 90+ score
```

---

## BƯỚC 11: BACKUP & ROLLBACK

### 11.1 Backup Database

```bash
# Export D1 database
wrangler d1 backup vision-coach-prod
```

### 11.2 Rollback Plan

```bash
# If issues, rollback to previous version
wrangler deploy --env production --version previous
```

---

## BƯỚC 12: MONITORING CHECKLIST

### 12.1 Daily Checks

- [ ] Health endpoint responding
- [ ] Error rate < 0.1%
- [ ] Response time < 500ms
- [ ] Database connected
- [ ] Cache working

### 12.2 Weekly Checks

- [ ] User feedback review
- [ ] Performance metrics
- [ ] Security logs
- [ ] Database size
- [ ] API usage

### 12.3 Monthly Checks

- [ ] Security audit
- [ ] Performance optimization
- [ ] Database maintenance
- [ ] Backup verification
- [ ] Cost analysis

---

## TROUBLESHOOTING

### Issue: CORS Error

**Solution:**
```bash
# Check CORS configuration in index.ts
# Ensure Authorization header is allowed
```

### Issue: Database Connection Error

**Solution:**
```bash
# Check D1 binding in wrangler.toml
# Verify database_id is correct
```

### Issue: API Timeout

**Solution:**
```bash
# Increase timeout in frontend
# Check Gemini API rate limits
```

### Issue: High Error Rate

**Solution:**
```bash
# Check logs in Cloudflare Dashboard
# Review error messages
# Rollback if necessary
```

---

## QUICK REFERENCE

### Production URLs

- Frontend: `https://yourdomain.com`
- Backend: `https://api.yourdomain.com`
- Health: `https://api.yourdomain.com/health`

### Production Secrets

```bash
# View secrets
wrangler secret list --env production

# Update secret
wrangler secret put SECRET_NAME --env production
```

### Production Deployment

```bash
# Backend
cd D:\git\test\worker
wrangler deploy --env production

# Frontend
cd D:\git\test
npm run build
vercel --prod
```

---

## FINAL CHECKLIST

### Before Going Live

- [ ] Build successful
- [ ] All tests passing
- [ ] Secrets configured
- [ ] Database configured
- [ ] Domain configured
- [ ] SSL configured
- [ ] Monitoring setup
- [ ] Logging setup
- [ ] Backup ready
- [ ] Rollback plan ready

### After Going Live

- [ ] Health check passing
- [ ] All endpoints responding
- [ ] Database connected
- [ ] Cache working
- [ ] Logging working
- [ ] Monitoring working
- [ ] No errors in logs
- [ ] Performance acceptable

---

## 🎉 DEPLOYMENT COMPLETE

**Your application is now live in production!**

```
Status: ✅ LIVE
URL: https://yourdomain.com
Backend: https://api.yourdomain.com
Database: Connected
Cache: Working
Monitoring: Active

READY FOR USERS ✅
```

---

**Last Updated:** 2025-11-27  
**Status:** ✅ PRODUCTION DEPLOYMENT GUIDE COMPLETE

