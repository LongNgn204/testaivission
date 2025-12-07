# 🚀 Deployment Checklist - Vision Coach

## Phase 1: Preparation

### Frontend Setup
- [ ] Update API URL in `.env.local`:
  ```
  VITE_API_URL=https://vision-coach-worker.yourdomain.workers.dev
  ```
- [ ] Remove VITE_GEMINI_API_KEY (no longer needed)
- [ ] Build frontend: `npm run build`
- [ ] Test build locally: `npm run preview`

### Backend Setup
- [ ] Navigate to worker: `cd worker`
- [ ] Install dependencies: `npm install`
- [ ] Create `.env.local` with secrets:
  ```
  GEMINI_API_KEY=your_key
  GOOGLE_TTS_API_KEY=your_key
  JWT_SECRET=your_strong_secret
  ```

## Phase 2: Cloudflare Setup

### Create Cloudflare Account
- [ ] Sign up at https://dash.cloudflare.com
- [ ] Create a new project
- [ ] Get account ID and API token

### Configure wrangler.toml
- [ ] Update `account_id` in wrangler.toml
- [ ] Update `database_name` for D1
- [ ] Set correct environment

### Create D1 Database
```bash
npx wrangler d1 create vision-coach-db
```
- [ ] Copy database ID to wrangler.toml
- [ ] Run migrations:
  ```bash
  npx wrangler d1 execute vision-coach-db --file ./scripts/schema.sql
  ```

### Set Secrets
```bash
npx wrangler secret put GEMINI_API_KEY --env production
npx wrangler secret put GOOGLE_TTS_API_KEY --env production
npx wrangler secret put JWT_SECRET --env production
```
- [ ] Verify secrets are set:
  ```bash
  npx wrangler secret list --env production
  ```

## Phase 3: Testing

### Local Testing
- [ ] Start dev server: `npm run dev`
- [ ] Test login endpoint:
  ```bash
  curl -X POST http://localhost:8787/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","age":"30","phone":"0912345678"}'
  ```
- [ ] Test TTS endpoint (requires token)
- [ ] Test AI endpoints
- [ ] Check rate limiting
- [ ] Verify security headers

### Integration Testing
- [ ] Update frontend API URL to local worker
- [ ] Test login flow
- [ ] Test TTS generation
- [ ] Test AI report generation
- [ ] Test dashboard insights
- [ ] Test chat functionality

## Phase 4: Deployment

### Deploy to Production
```bash
npm run deploy:prod
```
- [ ] Verify deployment succeeded
- [ ] Check worker URL: `https://vision-coach-worker.yourdomain.workers.dev`

### Post-Deployment Verification
```bash
# Test production endpoint
curl https://vision-coach-worker.yourdomain.workers.dev/health

# Check logs
npx wrangler tail --env production
```
- [ ] Health check returns 200
- [ ] No errors in logs
- [ ] Database connection works
- [ ] All endpoints responding

### Update Frontend
- [ ] Update VITE_API_URL to production URL
- [ ] Rebuild frontend: `npm run build`
- [ ] Deploy frontend to hosting (Vercel, Netlify, etc.)
- [ ] Test end-to-end flow

## Phase 5: Monitoring

### Setup Monitoring
- [ ] Enable Cloudflare Analytics
- [ ] Setup error tracking (Sentry, etc.)
- [ ] Configure alerts for high error rates
- [ ] Monitor database usage

### Performance Optimization
- [ ] Check response times
- [ ] Optimize database queries
- [ ] Enable caching where appropriate
- [ ] Monitor rate limiting effectiveness

### Security Audit
- [ ] Verify HTTPS enforcement
- [ ] Check security headers
- [ ] Review CORS configuration
- [ ] Audit API key usage
- [ ] Check rate limiting logs

## Phase 6: Maintenance

### Regular Tasks
- [ ] Monitor error logs daily
- [ ] Review security events weekly
- [ ] Update dependencies monthly
- [ ] Backup database regularly
- [ ] Review and optimize costs

### Backup Strategy
- [ ] Enable D1 backups
- [ ] Test restore procedures
- [ ] Document backup schedule
- [ ] Monitor backup status

### Scaling Considerations
- [ ] Monitor request volume
- [ ] Plan for scaling if needed
- [ ] Consider caching strategy
- [ ] Optimize database indexes

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong (32+ chars, random)
- [ ] API keys are never committed to git
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Rate limiting is active
- [ ] Input validation is working
- [ ] Security headers are set
- [ ] Logs are monitored
- [ ] Database is backed up
- [ ] Secrets are rotated regularly

## 📊 Performance Targets

- [ ] Login response time < 200ms
- [ ] AI report generation < 5s
- [ ] TTS generation < 3s
- [ ] Dashboard insights < 2s
- [ ] Chat response < 3s
- [ ] Database queries < 100ms
- [ ] Error rate < 0.1%
- [ ] Uptime > 99.9%

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check database status
npx wrangler d1 info vision-coach-db

# Verify binding in wrangler.toml
# Ensure database_id is correct
```

**Secret Not Found**
```bash
# List secrets
npx wrangler secret list --env production

# Re-add secret
npx wrangler secret put GEMINI_API_KEY --env production
```

**CORS Errors**
- Check CORS middleware configuration
- Verify frontend URL is in allowed origins
- Check browser console for specific errors

**Rate Limiting Issues**
- Review rate limit configuration
- Check if IP is blocked
- Verify rate limit headers in response

**Database Quota Exceeded**
- Check database size
- Optimize queries
- Archive old data
- Consider upgrading plan

## 📞 Support Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Gemini API Docs](https://ai.google.dev/)

## ✅ Final Sign-Off

- [ ] All tests passed
- [ ] Security audit completed
- [ ] Performance targets met
- [ ] Monitoring configured
- [ ] Team trained
- [ ] Documentation updated
- [ ] Backup verified
- [ ] Ready for production

**Deployment Date**: _______________
**Deployed By**: _______________
**Reviewed By**: _______________

