# 🚀 Cloudflare Workers - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
wrangler --version
```

### Step 2: Login to Cloudflare

```bash
wrangler login
# Opens browser to authenticate
```

### Step 3: Create Worker Project

```bash
cd worker
npm install
```

### Step 4: Set Up Environment

```bash
# Get your Account ID from Cloudflare Dashboard
# Update wrangler.toml with YOUR_ACCOUNT_ID

# Create KV Namespace
wrangler kv:namespace create "CACHE"
wrangler kv:namespace create "CACHE" --preview

# Update wrangler.toml with the returned namespace IDs
```

### Step 5: Set Secrets

```bash
# Add Gemini API key
wrangler secret put GEMINI_API_KEY
# Paste your API key when prompted
```

### Step 6: Test Locally

```bash
npm run dev
# Worker runs at http://localhost:8787
```

### Step 7: Deploy

```bash
npm run deploy
# Deployed to https://vision-coach-worker.YOUR_SUBDOMAIN.workers.dev
```

---

## 🧪 Testing Endpoints

### Test Report Generation

```bash
curl -X POST http://localhost:8787/api/report \
  -H "Content-Type: application/json" \
  -d '{
    "testType": "snellen",
    "testData": {
      "score": "20/40",
      "correctAnswers": 17,
      "totalQuestions": 20,
      "accuracy": 85
    },
    "history": [],
    "language": "vi"
  }'
```

### Test Chat

```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tôi bị mỏi mắt sau khi làm việc với máy tính. Tôi nên làm gì?",
    "lastTestResult": null,
    "userProfile": null,
    "language": "vi"
  }'
```

### Test Health Check

```bash
curl http://localhost:8787/health
```

---

## 📊 Monitoring

### View Logs

```bash
wrangler tail
# Real-time logs from your Worker
```

### View Metrics

1. Go to Cloudflare Dashboard
2. Workers → Your Worker → Metrics
3. See requests, errors, latency, CPU time

### View KV Storage

```bash
wrangler kv:key list --namespace-id=YOUR_NAMESPACE_ID
```

---

## 🔐 Security Checklist

- [ ] API key stored in Cloudflare Secrets (not in code)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Request validation in place
- [ ] Error messages don't expose sensitive info
- [ ] HTTPS enforced (automatic)

---

## 📈 Performance Tips

### 1. Optimize Cache TTL

```typescript
// In handlers
const CACHE_TTL = {
  report: 3600,        // 1 hour
  dashboard: 7200,     // 2 hours
  chat: 0,             // No cache
  routine: 86400,      // 24 hours
};
```

### 2. Monitor Costs

- Free tier: 100,000 requests/day
- Paid: $0.50 per million requests
- KV: First 1GB free, then $0.50/GB

### 3. Reduce API Calls

- Cache responses aggressively
- Batch requests when possible
- Reuse computed results

---

## 🐛 Troubleshooting

### Issue: "API key not found"

```bash
# Verify secret is set
wrangler secret list

# Re-add if missing
wrangler secret put GEMINI_API_KEY
```

### Issue: "KV namespace not found"

```bash
# Check wrangler.toml has correct namespace IDs
# Recreate if needed
wrangler kv:namespace create "CACHE"
```

### Issue: "Rate limit exceeded"

- Check your IP isn't being blocked
- Increase rate limits in `src/middleware/rateLimit.ts`
- Use Cloudflare Analytics to see request patterns

### Issue: "Timeout errors"

- Gemini API might be slow
- Increase timeout in handler
- Check Gemini API status

---

## 📚 Useful Commands

```bash
# Development
npm run dev              # Start local server
npm run build           # Build TypeScript

# Deployment
npm run deploy          # Deploy to production
npm run deploy:prod     # Deploy to production env

# Secrets
wrangler secret list    # List all secrets
wrangler secret put KEY # Add/update secret
wrangler secret delete KEY # Remove secret

# KV Storage
wrangler kv:key list --namespace-id=ID
wrangler kv:key get KEY --namespace-id=ID
wrangler kv:key delete KEY --namespace-id=ID

# Monitoring
wrangler tail           # View real-time logs
wrangler deployments list # View deployment history
```

---

## 🔗 Integration with Frontend

### Update Frontend Client

```typescript
// src/services/workerClient.ts
const WORKER_URL = 'https://vision-coach-worker.YOUR_SUBDOMAIN.workers.dev';

export class WorkerClient {
  async generateReport(testType, testData, history, language) {
    const response = await fetch(`${WORKER_URL}/api/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testType, testData, history, language }),
    });
    return response.json();
  }
}
```

### Environment Variables

```bash
# .env.local
REACT_APP_WORKER_URL=https://vision-coach-worker.YOUR_SUBDOMAIN.workers.dev
```

---

## 📞 Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Community Discord](https://discord.gg/cloudflaredev)

---

## ✅ Next Steps

1. [ ] Deploy Worker to production
2. [ ] Update frontend to use Worker URLs
3. [ ] Remove direct Gemini API calls from frontend
4. [ ] Monitor performance and costs
5. [ ] Set up alerts for errors
6. [ ] Optimize caching strategy
7. [ ] Add D1 database for user data (optional)
8. [ ] Add R2 storage for reports (optional)

---

## [object Object] Tip 1: Use Wrangler Tail for Debugging

```bash
wrangler tail --format pretty
```

### Tip 2: Test Rate Limiting Locally

```bash
# Make 31 requests quickly to trigger 429
for i in {1..31}; do
  curl http://localhost:8787/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"test","language":"vi"}'
done
```

### Tip 3: Monitor KV Cache Hits

Check logs for "Cache HIT" messages to see how effective caching is.

### Tip 4: Use Cloudflare Analytics

- Real-time request metrics
- Error tracking
- Performance insights
- Cost estimation

---

## 🎯 Success Metrics

Track these after deployment:

- **Latency**: Should be <150ms (vs 200-500ms before)
- **Cache Hit Rate**: Aim for >60% on reports
- **Error Rate**: Should be <1%
- **Cost**: Monitor requests/day
- **Uptime**: Should be 99.9%+

---

## 📝 Deployment Checklist

- [ ] Wrangler installed and configured
- [ ] Cloudflare account created
- [ ] Account ID and Zone ID added to wrangler.toml
- [ ] KV namespaces created and IDs added
- [ ] Gemini API key stored as secret
- [ ] All handlers implemented and tested
- [ ] Middleware configured (CORS, rate limiting, validation)
- [ ] Frontend client updated with Worker URL
- [ ] Environment variables set in frontend
- [ ] Direct Gemini API calls removed from frontend
- [ ] Tested all endpoints locally
- [ ] Deployed to production
- [ ] Verified endpoints are working
- [ ] Set up monitoring and alerts
- [ ] Documented API endpoints for team

---

Good luck! 🚀

