# 👁️ Vision Coach - AI-Powered Eye Health Platform

A comprehensive web application for eye health testing, monitoring, and personalized recommendations powered by Google Gemini AI.

## ✨ Features

### 👁️ Vision Tests
- **Snellen Test**: Visual acuity measurement
- **Ishihara Test**: Color blindness detection
- **Amsler Grid**: Macular degeneration screening
- **Astigmatism Test**: Refractive error detection
- **Duochrome Test**: Prescription accuracy

### 🤖 AI-Powered Features
- **Dr. Eva AI Assistant**: 2-way conversation about eye health
- **AI Reports**: Detailed analysis of test results
- **Dashboard Insights**: Trend analysis and health summary
- **Personalized Routine**: Weekly eye care schedule
- **Proactive Tips**: Daily health recommendations
- **Text-to-Speech**: Natural voice synthesis (via backend)

### 🔐 Security & Backend
- **Cloudflare Workers**: Serverless backend
- **JWT Authentication**: Secure user sessions
- **D1 Database**: Persistent data storage
- **Hidden API Keys**: All API keys on backend only
- **Rate Limiting**: DDoS protection
- **Input Validation**: Security hardening

### 🌐 Localization
- **Vietnamese (Tiếng Việt)**: Full support
- **English**: Full support
- **Easy to extend**: Add more languages

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account (for backend)

### Frontend Setup

```bash
# Install dependencies
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:8787" > .env.local

# Development
npm run dev

# Build
npm run build
```

### Backend Setup (Cloudflare Worker)

```bash
cd worker

# Install dependencies
npm install

# Create secrets
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GOOGLE_TTS_API_KEY
npx wrangler secret put JWT_SECRET

# Development
npm run dev

# Deploy
npm run deploy:prod
```

## 📁 Project Structure

```
.
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── hooks/             # Custom hooks
│   ├── context/           # React context
│   ├── utils/             # Utilities
│   └── i18n/              # Localization
├── worker/                # Cloudflare Worker backend
│   ├── src/
│   │   ├── handlers/      # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Middleware
│   │   └── prompts/       # AI prompts
│   └── wrangler.toml      # Worker config
├── public/                # Static assets
└── package.json
```

## 🔧 Configuration

### Frontend Environment Variables

```bash
# .env.local
VITE_API_URL=https://your-worker-url.workers.dev
```

### Backend Environment Variables (Cloudflare Secrets)

```bash
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_TTS_API_KEY=your_google_tts_key
JWT_SECRET=your_strong_secret_min_32_chars
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - User logout

### AI Services
- `POST /api/report` - Generate AI report
- `POST /api/dashboard` - Generate dashboard insights
- `POST /api/chat` - Chat with Dr. Eva
- `POST /api/routine` - Generate weekly routine
- `POST /api/proactive-tip` - Get daily tip
- `POST /api/tts/generate` - Generate TTS audio

### Test Management
- `POST /api/tests/save` - Save test result
- `GET /api/tests/history` - Get test history

## 🔒 Security Features

- ✅ JWT authentication with 7-day expiration
- ✅ Rate limiting (100 req/min global, 5 req/min auth)
- ✅ IP-based blocking for suspicious activity
- ✅ Input sanitization and validation
- ✅ Security headers (HSTS, CSP, X-Frame-Options)
- ✅ Password hashing (SHA-256 with salt)
- ✅ HTTPS enforcement
- ✅ CORS protection
- ✅ Security event logging

## 🧪 Testing

```bash
# Frontend tests
npm run test

# Type checking
npm run type-check

# Build check
npm run build

# Backend tests
cd worker
npm run test
npm run type-check
```

## 📊 Database Schema

### Users
- id, name, age, phone, email
- password_hash, password_salt
- created_at, updated_at, last_login

### Sessions
- id, user_id, token, expires_at
- device_info, created_at

### Test Results
- id, user_id, test_type, test_data
- score, result, duration, created_at

### Analytics
- id, user_id, event_type, event_data
- created_at

## 🚀 Deployment

### Deploy Frontend
```bash
npm run build
# Deploy dist/ folder to Vercel, Netlify, or your hosting
```

### Deploy Backend
```bash
cd worker
npm run deploy:prod
```

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for detailed instructions.

## 📖 Documentation

- [Cloudflare Worker Setup](CLOUDFLARE_WORKER_SETUP.md)
- [Backend Upgrade Summary](BACKEND_UPGRADE_SUMMARY.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- Vite
- React Router

### Backend
- Cloudflare Workers
- TypeScript
- Cloudflare D1 (SQLite)
- Google Gemini AI
- Google Cloud Text-to-Speech

### APIs
- Google Gemini 2.5 Flash
- Google Cloud Text-to-Speech
- Web Speech API (fallback)

## 📈 Performance

- Frontend: Optimized with code splitting, lazy loading
- Backend: Serverless, auto-scaling
- Database: Optimized queries, caching
- TTS: Backend caching, base64 encoding
- AI: Streaming responses, token optimization

## 🔄 CI/CD

```bash
# Automated checks
npm run type-check
npm run build

# Manual deployment
npm run deploy:prod
```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review error logs
3. Test endpoints with curl/Postman
4. Check Cloudflare Workers status

## 🎯 Roadmap

- [ ] Add 2FA authentication
- [ ] Implement OAuth (Google, Facebook)
- [ ] Add prescription tracking
- [ ] Implement appointment scheduling
- [ ] Add doctor consultation feature
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with EHR systems

## 👨‍[object Object]

Created with ❤️ for better eye health

---

**Last Updated**: December 2024
**Version**: 1.0.0
