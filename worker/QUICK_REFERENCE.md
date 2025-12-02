# 📋 QUICK REFERENCE - Cloudflare Workers Commands

## 🚀 Development

```bash
# Start local server (port 8787)
npm run dev

# Build TypeScript
npm run build

# Type check
npm run type-check
```

## 🗄️ Database (D1)

```bash
# Query production database
npx wrangler d1 execute testmatai --remote --command="SELECT * FROM users"

# Query local database  
npx wrangler d1 execute testmatai --local --command="SELECT * FROM users"

# Apply schema
npm run db:schema

# Database info
npm run db:info

# Custom query
npm run db:query "YOUR SQL HERE"
```

## 🔐 Secrets Management

```bash
# List all secrets
npx wrangler secret list

# Set a secret
npx wrangler secret put SECRET_NAME

# Delete a secret
npx wrangler secret delete SECRET_NAME
```

## 🌐 Deployment

```bash
# Deploy to development
npm run deploy

# Deploy to production
npm run deploy:prod

# View deployments
npx wrangler deployments list

# View logs
npx wrangler tail
```

## 🧪 Testing (PowerShell)

```powershell
# Run full test suite
.\test-api.ps1

# Quick health check
Invoke-RestMethod http://127.0.0.1:8787/health

# Test login
$body = @{name="Test"; age=25; phone="0912345678"} | ConvertTo-Json
Invoke-RestMethod http://127.0.0.1:8787/api/auth/login -Method POST -Body $body -ContentType "application/json"
```

## 📊 Database Queries

```sql
-- Count users
SELECT COUNT(*) FROM users;

-- Recent tests
SELECT * FROM test_results ORDER BY created_at DESC LIMIT 10;

-- Active sessions
SELECT * FROM sessions WHERE expires_at > strftime('%s', 'now') * 1000;

-- User stats
SELECT 
  u.name, 
  COUNT(t.id) as total_tests,
  AVG(t.score) as avg_score
FROM users u
LEFT JOIN test_results t ON u.id = t.user_id
GROUP BY u.id;
```

## 🔍 Monitoring

```bash
# Real-time logs
npx wrangler tail

# Production logs
npx wrangler tail --env production

# View metrics in dashboard
# https://dash.cloudflare.com
```

## 🛠️ Database Migrations

```bash
# Create new migration
npm run db:create migration-name

# List migrations
npm run db:list

# Apply migration
node scripts/migrate.js up migration-file.sql

# Apply to preview
node scripts/migrate.js up:preview migration-file.sql
```

## 📝 Common Queries

```bash
# Total users
npx wrangler d1 execute testmatai --remote --command="SELECT COUNT(*) as total FROM users"

# Tests by type
npx wrangler d1 execute testmatai --remote --command="SELECT test_type, COUNT(*) as count FROM test_results GROUP BY test_type"

# Recent logins
npx wrangler d1 execute testmatai --remote --command="SELECT name, last_login FROM users ORDER BY last_login DESC LIMIT 10"

# Clear old sessions
npx wrangler d1 execute testmatai --remote --command="DELETE FROM sessions WHERE expires_at < strftime('%s', 'now') * 1000"
```

## 🎯 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/auth/login` | POST | Login/Register |
| `/api/auth/verify` | POST | Verify token |
| `/api/auth/logout` | POST | Logout |
| `/api/tests/save` | POST | Save test result |
| `/api/tests/history` | GET | Get test history |
| `/api/report` | POST | Generate AI report |
| `/api/dashboard` | POST | Dashboard insights |
| `/api/chat` | POST | Chat with AI |
| `/api/routine` | POST | Generate routine |

## 🔧 Environment Files

```bash
# Development (.env)
GEMINI_API_KEY=your_key_here
JWT_SECRET=dev_secret

# Production (Secrets)
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put JWT_SECRET
```

## 📦 NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Build TypeScript |
| `npm run deploy` | Deploy to production |
| `npm run db:schema` | Apply database schema |
| `npm run db:query` | Run SQL query |
| `npm run db:info` | Database information |
| `npm run db:create` | Create migration |

## 🌐 URLs

| Environment | URL |
|-------------|-----|
| Local | http://127.0.0.1:8787 |
| Production | https://vision-coach-worker.YOUR_SUBDOMAIN.workers.dev |
| Dashboard | https://dash.cloudflare.com |
| API Keys | https://aistudio.google.com/apikey |

---

**💡 Tip**: Bookmark this file for quick reference!
