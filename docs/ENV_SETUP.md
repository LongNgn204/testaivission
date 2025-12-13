# Environment Configuration Guide

## Overview
Vision Coach sử dụng environment variables để quản lý configuration cho dev/staging/prod.

## Setup Instructions

### 1. Development Environment

Tạo file `.env.local` (hoặc `.env.development.local`) ở root directory:

```env
VITE_ENV=development
VITE_API_URL=http://localhost:8787
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=false
VITE_ENABLE_PERFORMANCE_MONITORING=false
```

### 2. Staging Environment

```env
VITE_ENV=staging
VITE_API_URL=https://staging-api.example.com
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### 3. Production Environment

```env
VITE_ENV=production
VITE_API_URL=https://vision-coach-worker.stu725114073.workers.dev
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

## Available Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_ENV` | `development` | Environment: development, staging, production |
| `VITE_API_URL` | `http://localhost:8787` | API base URL |
| `VITE_ENABLE_ANALYTICS` | `false` | Enable Google Analytics |
| `VITE_ENABLE_ERROR_TRACKING` | `false` | Enable error tracking (Sentry) |
| `VITE_ENABLE_PERFORMANCE_MONITORING` | `false` | Enable performance monitoring |
| `VITE_MAX_CHAT_LENGTH` | `2000` | Max chat message length |
| `VITE_MAX_TEST_DURATION` | `600` | Max test duration (seconds) |
| `VITE_RATE_LIMIT_PER_MINUTE` | `60` | Rate limit per minute |
| `VITE_CACHE_ENABLED` | `true` | Enable caching |
| `VITE_CACHE_TTL` | `3600` | Cache TTL (seconds) |

## Security Notes

- ✅ Never commit `.env.local` or `.env.*.local` to git
- ✅ Use `.env.example` as template
- ✅ Keep secrets in environment variables, not in code
- ✅ Rotate secrets regularly in production

## Loading Configuration

Configuration is automatically loaded in `utils/config.ts`:

```typescript
import { config, isFeatureEnabled } from '@/utils/config';

// Access config
console.log(config.apiUrl);
console.log(config.env);

// Check feature flags
if (isFeatureEnabled('enableAnalytics')) {
  // Initialize analytics
}
```

## Build-time Configuration

For production builds, environment variables are baked into the bundle:

```bash
# Development
npm run dev

# Production build
npm run build
# This will use VITE_ENV=production variables
```

