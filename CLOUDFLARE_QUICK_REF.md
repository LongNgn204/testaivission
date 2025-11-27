# 🚀 CLOUDFLARE WORKERS - QUICK REFERENCE

## 📌 WORKER INFO

**URL**: `https://vision-coach-backend.stu725114073.workers.dev`  
**Name**: `vision-coach-backend`  
**Version**: `0fe08e5b-d8e8-44f3-b965-b2765f9bb64a`  
**Status**: ✅ DEPLOYED & RUNNING  

---

## ⚡ QUICK COMMANDS

```powershell
# View logs real-time
npx wrangler tail

# Deploy updates
npm run worker:deploy

# Test locally
npm run worker:dev

# Check status
npx wrangler deployments list

# View secrets
npx wrangler secret list
```

---

## 🧪 TEST COMMANDS

```powershell
# Health check
(Invoke-WebRequest -Uri "https://vision-coach-backend.stu725114073.workers.dev/health" -UseBasicParsing).Content

# Metrics
(Invoke-WebRequest -Uri "https://vision-coach-backend.stu725114073.workers.dev/metrics" -UseBasicParsing).Content

# Test login
$body = '{"name":"Test","age":"25","phone":"0912345678"}' | ConvertTo-Json
Invoke-WebRequest -Uri "https://vision-coach-backend.stu725114073.workers.dev/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

---

## 📍 ENDPOINTS

```
GET  /health
GET  /metrics
POST /api/auth/login
POST /api/auth/verify
POST /api/auth/logout
POST /api/report
POST /api/dashboard
POST /api/chat
POST /api/routine
POST /api/proactive-tip
```

---

## 🔐 SECRETS

```powershell
# Set new secret
npx wrangler secret put SECRET_NAME

# List all secrets
npx wrangler secret list

# Delete secret
npx wrangler secret delete SECRET_NAME
```

**Current Secrets**:
- ✅ GEMINI_API_KEY
- ✅ JWT_SECRET

---

## 📊 MONITORING

**Cloudflare Dashboard**: https://dash.cloudflare.com  
→ Workers & Pages → vision-coach-backend

**Real-time Logs**:
```powershell
npx wrangler tail
```

---

## 🔄 UPDATE WORKFLOW

1. Edit `worker.js`
2. Run `npm run worker:deploy`
3. Test endpoints
4. Monitor logs: `npx wrangler tail`

---

## 🌐 FRONTEND CONFIG

File: `.env.local`
```env
VITE_API_URL=https://vision-coach-backend.stu725114073.workers.dev
```

Restart frontend sau khi thay đổi:
```powershell
npm run dev
```

---

## 💡 TIPS

- ⚡ Workers có 0ms cold start
- 🌍 Auto-deploy to 300+ locations
- 🆓 100k requests/day free tier
- 🔒 Built-in DDoS protection
- 📈 Auto-scaling theo traffic

---

**Dashboard**: https://dash.cloudflare.com  
**Docs**: https://developers.cloudflare.com/workers/
