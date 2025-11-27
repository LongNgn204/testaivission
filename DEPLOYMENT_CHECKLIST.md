# ✅ Cloudflare Workers Deployment Checklist

## Pre-Deployment (Day 1)

### Account Setup
- [ ] Create Cloudflare account at https://dash.cloudflare.com
- [ ] Get Account ID from Workers dashboard
- [ ] Add domain to Cloudflare (if using custom domain)
- [ ] Get Zone ID (if using custom domain)

### Local Setup
- [ ] Install Node.js (v18+)
- [ ] Install Wrangler CLI: `npm install -g wrangler`
- [ ] Verify installation: `wrangler --version`
- [ ] Login to Cloudflare: `wrangler login`

### Project Setup
- [ ] Copy `worker/` directory to project
- [ ] Run `cd worker && npm install`
- [ ] Verify dependencies installed

### Configuration
- [ ] Update `worker/wrangler.toml` with Account ID
- [ ] Create KV namespace: `wrangler kv:namespace create "CACHE"`
- [ ] Create preview KV namespace: `wrangler kv:namespace create "CACHE" --preview`
- [ ] Update `wrangler.toml` with KV namespace IDs
- [ ] Add Gemini API key: `wrangler secret put GEMINI_API_KEY`
- [ ] Verify secret: `wrangler secret list`

---

## Development (Days 2-3)

### Local Testing
- [ ] Start local server: `npm run dev`
- [ ] Test health endpoint: `curl http://localhost:8787/health`
- [ ] Test report endpoint with sample data
- [ ] Test dashboard endpoint
- [ ] Test chat endpoint
- [ ] Test routine endpoint
- [ ] Test proactive-tip endpoint

### Error Handling
- [ ] Test missing required fields
- [ ] Test invalid language
- [ ] Test malformed JSON
- [ ] Test rate limiting (31+ requests)
- [ ] Verify error responses

### Performance
- [ ] Measure latency (should be <200ms locally)
- [ ] Test cache hit (should be fast)
- [ ] Test cache miss (should call Gemini)
- [ ] Verify cache TTL works

### Code Quality
- [ ] Run TypeScript check: `npm run type-check`
- [ ] Review all handlers
- [ ] Review all middleware
- [ ] Check error handling
- [ ] Verify logging

---

## Pre-Production (Day 4)

### Frontend Integration
- [ ] Create `src/services/workerClient.ts`
- [ ] Update `src/services/aiService.ts` to use Worker
- [ ] Remove direct Gemini API calls
- [ ] Add environment variables to `.env.local`
- [ ] Test frontend locally with Worker

### Environment Setup
- [ ] Create `.env.production` with Worker URL
- [ ] Verify environment variables are set
- [ ] Check no API keys in environment files
- [ ] Verify no hardcoded URLs

### Security Review
- [ ] Verify API key is in Cloudflare Secrets (not code)
- [ ] Check CORS configuration
- [ ] Verify rate limiting is enabled
- [ ] Check request validation
- [ ] Review error messages (no sensitive data)

### Documentation
- [ ] Update README with new architecture
- [ ] Document Worker URL
- [ ] Document environment variables
- [ ] Create deployment guide for team

---

## Deployment (Day 5)

### Worker Deployment
- [ ] Build Worker: `npm run build`
- [ ] Deploy Worker: `npm run deploy`
- [ ] Note Worker URL from output
- [ ] Verify deployment succeeded
- [ ] Test health endpoint: `curl https://YOUR_WORKER_URL/health`

### Frontend Deployment
- [ ] Update `.env.production` with Worker URL
- [ ] Build frontend: `npm run build`
- [ ] Deploy frontend to hosting
- [ ] Verify frontend deployed

### Post-Deployment Testing
- [ ] Test all endpoints from production
- [ ] Verify latency (<150ms expected)
- [ ] Check cache is working
- [ ] Monitor error rates
- [ ] Verify no API key leaks

---

## Monitoring Setup (Day 6)

### Cloudflare Dashboard
- [ ] Go to Workers → Your Worker
- [ ] Enable Analytics
- [ ] Check Metrics tab
- [ ] Set up alerts for errors
- [ ] Monitor request counts

### Logging
- [ ] Run `wrangler tail` to view logs
- [ ] Check for errors
- [ ] Verify cache hits
- [ ] Monitor latency

### Metrics to Track
- [ ] Requests per minute
- [ ] Error rate (should be <1%)
- [ ] Latency (should be <150ms)
- [ ] Cache hit rate (should be >60%)
- [ ] Cost (should be <$5/month)

---

## Post-Deployment (Day 7+)

### Verification
- [ ] All endpoints responding
- [ ] Performance improved
- [ ] No API key leaks
- [ ] Errors handled gracefully
- [ ] Monitoring working

### Optimization
- [ ] Review cache hit rates
- [ ] Adjust cache TTL if needed
- [ ] Optimize prompts if needed
- [ ] Monitor costs

### Team Communication
- [ ] Brief team on new architecture
- [ ] Share documentation
- [ ] Provide access to monitoring
- [ ] Document troubleshooting steps

### Backup & Rollback
- [ ] Document rollback procedure
- [ ] Keep old code available
- [ ] Test rollback procedure
- [ ] Document issues and solutions

---

## Ongoing Maintenance

### Weekly
- [ ] Check error rates
- [ ] Review latency metrics
- [ ] Monitor costs
- [ ] Check cache effectiveness

### Monthly
- [ ] Review analytics dashboard
- [ ] Optimize based on usage patterns
- [ ] Update documentation
- [ ] Plan improvements

### Quarterly
- [ ] Review architecture
- [ ] Plan enhancements
- [ ] Update dependencies
- [ ] Security audit

---

## Troubleshooting Checklist

### If Worker Won't Deploy
- [ ] Check Account ID in wrangler.toml
- [ ] Verify Wrangler is logged in: `wrangler whoami`
- [ ] Check for TypeScript errors: `npm run type-check`
- [ ] Check wrangler.toml syntax
- [ ] Try: `wrangler deploy --verbose`

### If Endpoints Not Responding
- [ ] Check Worker is deployed: `wrangler deployments list`
- [ ] Test health endpoint
- [ ] Check Cloudflare status page
- [ ] Review Wrangler logs: `wrangler tail`
- [ ] Check rate limiting isn't blocking

### If API Key Not Found
- [ ] Verify secret is set: `wrangler secret list`
- [ ] Re-add if missing: `wrangler secret put GEMINI_API_KEY`
- [ ] Check secret name matches code
- [ ] Try redeploying: `npm run deploy`

### If Slow Responses
- [ ] Check cache hit rate
- [ ] Monitor Gemini API status
- [ ] Check network latency
- [ ] Review error logs
- [ ] Check rate limiting

### If Rate Limit Exceeded
- [ ] Check your IP isn't blocked
- [ ] Increase rate limits if needed
- [ ] Check for bot traffic
- [ ] Review analytics

---

## Quick Commands Reference

```bash
# Development
npm run dev                    # Start local server
npm run build                  # Build TypeScript
npm run type-check            # Check types

# Deployment
npm run deploy                # Deploy to production
npm run deploy:prod           # Deploy to production env

# Secrets
wrangler secret list          # List all secrets
wrangler secret put KEY       # Add/update secret
wrangler secret delete KEY    # Remove secret

# KV Storage
wrangler kv:namespace list    # List namespaces
wrangler kv:key list --namespace-id=ID
wrangler kv:key get KEY --namespace-id=ID

# Monitoring
wrangler tail                 # View real-time logs
wrangler tail --format pretty # Pretty format
wrangler deployments list     # View deployments
wrangler logs                 # View logs

# Testing
curl http://localhost:8787/health
curl -X POST http://localhost:8787/api/report \
  -H "Content-Type: application/json" \
  -d '{"testType":"snellen","testData":{...},"language":"vi"}'
```

---

## Success Metrics

Track these after deployment:

| Metric | Target | Status |
|--------|--------|--------|
| Latency | <150ms | ☐ |
| Cache Hit Rate | >60% | ☐ |
| Error Rate | <1% | ☐ |
| Uptime | >99.9% | ☐ |
| Cost | <$5/month | ☐ |
| API Key Exposure | 0 | ☐ |

---

## Sign-Off

- [ ] All checklist items completed
- [ ] Team trained on new system
- [ ] Documentation updated
- [ ] Monitoring enabled
- [ ] Rollback plan documented
- [ ] Ready for production

**Deployment Date**: _______________
**Deployed By**: _______________
**Approved By**: _______________

---

## Notes

```
[Space for additional notes]
```

---

## Contact & Support

- **Cloudflare Support**: https://support.cloudflare.com
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Community**: https://community.cloudflare.com/
- **Status Page**: https://www.cloudflarestatus.com/

---

**Good luck with your deployment! 🚀**

