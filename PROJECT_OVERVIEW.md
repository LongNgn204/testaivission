# 📋 TỔNG QUAN DỰ ÁN VISION COACH - TÀI LIỆU CHO AI

> **Mục đích**: File này tổng hợp toàn bộ thông tin về dự án Vision Coach để AI có thể hiểu và hỗ trợ phát triển.

---

## 🎯 TỔNG QUAN DỰ ÁN

### Tên dự án
**Vision Coach** - Nền Tảng Chăm Sóc Sức Khỏe Mắt AI

### Phiên bản hiện tại
**v2.3.0** (December 2024)

### Mô tả
Ứng dụng web toàn diện (PWA) cho kiểm tra, giám sát và tư vấn sức khỏe mắt được hỗ trợ bởi AI. 100% miễn phí, không cần API key, sử dụng Cloudflare Workers AI với LLAMA 3.1 8B.

### Demo & Links
- 🌐 **Demo**: https://slht4653.testaivision.pages.dev
- 👨‍💼 **Admin Dashboard**: `./admin-standalone.html`
- 🐛 **Issues**: https://github.com/LongNgn204/testaivission/issues
- 📚 **Repository**: https://github.com/LongNgn204/testaivission

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### Stack Công Nghệ

#### Frontend
- **React 19** - UI Framework với Concurrent Mode
- **TypeScript 5.0** - Type safety toàn bộ codebase
- **Tailwind CSS 3.4** - Utility-first CSS với dark mode
- **Vite 6.4** - Build tool
- **React Router 6** - Client-side routing
- **Lucide Icons 0.548** - Icon library
- **Web Speech API** - Voice recognition & TTS
- **PWA** - Service Worker cho offline support

#### Backend
- **Cloudflare Workers** - Serverless edge functions (0ms cold start)
- **Workers AI** - LLAMA 3.1 8B (miễn phí không giới hạn)
- **D1 Database** - SQLite cloud database (5GB free)
- **itty-router** - Lightweight API routing
- **JWT (jose)** - Xác thực với 7 ngày expiry
- **KV Namespace** - Response caching

### Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Pages   │  │Components│  │ Services │  │ Context  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│              CLOUDFLARE EDGE (CDN/WAF)                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│            CLOUDFLARE WORKER (Backend API)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Handlers │  │Middleware│  │ Prompts  │  │ Services │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└──────┬──────────────────┬──────────────────┬────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────┐      ┌──────────┐      ┌──────────┐
│ D1 (SQL) │      │Workers AI │      │ KV Cache │
│ Database │      │(LLAMA 3.1)│      │          │
└──────────┘      └──────────┘      └──────────┘
```

---

## 📁 CẤU TRÚC THỨ MỤC CHI TIẾT

### Frontend Structure

```
testaivission/
├── 📄 index.html                 # Entry point HTML
├── 📄 index.tsx                  # React entry point
├── 📄 index.css                  # Global styles + Tailwind
├── 📄 App.tsx                    # Main React App component
├── 📄 types.ts                   # TypeScript type definitions
├── 📄 manifest.json              # PWA manifest
├── 📄 sw.js                      # Service Worker
├── 📄 admin-standalone.html      # Admin Dashboard (standalone)
│
├── 📁 components/                # React UI Components (24+ files)
│   ├── 📁 ui/                    # Shared UI components
│   │   ├── GlassCard.tsx         # Glassmorphism card
│   │   └── PageShell.tsx         # Page wrapper
│   │
│   ├── 📁 vision-coach/          # AI Chat components
│   │   ├── ChatInterface.tsx     # Text chat với Dr. Eva
│   │   └── VoiceInterface.tsx    # Voice chat interface
│   │
│   ├── 🧪 SnellenTest.tsx        # Snellen chart test
│   ├── 🧪 ColorBlindTest.tsx     # Ishihara plates test
│   ├── 🧪 AmslerGridTest.tsx     # AMD detection test
│   ├── 🧪 AstigmatismTest.tsx    # Astigmatism dial test
│   ├── 🧪 DuochromeTest.tsx      # Myopia/Hyperopia test
│   │
│   ├── 📊 DashboardContent.tsx   # Dashboard with insights
│   ├── 📊 HealthDashboard.tsx    # Health overview
│   ├── 📋 ReportDisplayContent.tsx # Report viewer
│   ├── 📋 AIReportVerifier.tsx   # Report verification
│   │
│   ├── 🎯 Header.tsx             # Navigation header
│   ├── 🎯 TestShell.tsx          # Test wrapper component
│   ├── 🎯 FeatureSlider.tsx      # Feature carousel
│   ├── 🗺️ HospitalLocator.tsx   # Find nearby hospitals
│   ├── 🎓 TourGuide.tsx          # Onboarding tour
│   ├── 👤 UserInfo.tsx           # User profile display
│   └── 🔒 ProtectedRoute.tsx     # Auth guard
│
├── 📁 pages/                     # Page Components (9 files)
│   ├── 🏠 Home.tsx               # Dashboard chính
│   ├── 👋 WelcomePage.tsx        # Trang chào mừng
│   ├── 🔐 AuthPage.tsx           # Đăng nhập/Đăng ký
│   ├── ⚙️ PersonalizedSetupPage.tsx # Thiết lập ban đầu
│   ├── 📊 ProgressPage.tsx       # Tiến trình & thống kê
│   ├── 📜 History.tsx            # Lịch sử test
│   ├── 🏥 HealthProfile.tsx      # Hồ sơ sức khỏe
│   ├── ⏰ RemindersPage.tsx      # Lịch nhắc nhở
│   └── ℹ️ AboutPage.tsx          # Giới thiệu
│
├── 📁 services/                  # Business Logic (14 files)
│   ├── 🤖 aiService.ts           # AI chat, report, routine, tip
│   ├── 💬 chatbotService.ts      # Chatbot API calls
│   ├── 💬 chatService.ts         # Chat service
│   ├── 🔐 authService.ts         # JWT auth & user management
│   ├── 💾 storageService.ts      # LocalStorage management
│   ├── 💾 dataStorageService.ts  # Data storage
│   ├── 🔄 syncService.ts         # Backend data sync
│   ├── ⏰ reminderService.ts     # Notification reminders
│   ├── 🧪 testService.ts         # Test service
│   │
│   ├── 👁️ snellenService.ts     # Snellen test logic
│   ├── 🎨 colorBlindService.ts   # Colorblind test logic
│   ├── 📐 amslerGridService.ts   # Amsler test logic
│   ├── 🔄 astigmatismService.ts  # Astigmatism test logic
│   └── 🔴🟢 duochromeService.ts  # Duochrome test logic
│
├── 📁 context/                   # React Context Providers (6 files)
│   ├── 🌐 LanguageContext.tsx    # i18n (vi/en)
│   ├── 🌙 ThemeContext.tsx       # Dark/Light mode
│   ├── 👤 UserContext.tsx        # User state management
│   ├── 📅 RoutineContext.tsx     # Weekly routine state
│   ├── 🎤 VoiceControlContext.tsx # Voice permissions
│   └── 🎓 TourGuideContext.tsx   # Onboarding state
│
├── 📁 hooks/                     # Custom React Hooks (3+ files)
│   ├── 📊 useDashboardInsights.ts # Dashboard AI insights
│   ├── 📄 usePdfExport.ts        # PDF report export
│   └── 🎤 useSpeechRecognition.ts # Voice input hook
│
├── 📁 utils/                     # Utility Functions (4+ files)
│   ├── 🔊 audioUtils.ts          # Audio playback helpers
│   ├── 📦 dataMigration.ts       # Data migration utilities
│   ├── ⚙️ envConfig.ts           # Environment config
│   └── 🚀 performanceUtils.ts    # Performance optimizations
│
└── 📁 i18n/                      # Internationalization
    └── index.ts                  # Translation strings (vi/en)
```

### Backend Structure (Cloudflare Worker)

```
worker/
├── 📄 wrangler.toml              # Worker config
├── 📄 schema.sql                 # Database schema
├── 📄 package.json               # Dependencies
│
└── 📁 src/
    ├── 📄 index.ts               # API router & CORS
    ├── 📄 types.ts               # Backend type definitions
    │
    ├── 📁 handlers/              # API Handlers (9+ files)
    │   ├── 🔐 auth.ts            # Login/Verify/Logout
    │   ├── 💬 chat.ts            # AI chat endpoint
    │   ├── 📊 aiReport.ts        # Report generation
    │   ├── 📅 routine.ts         # Weekly routine
    │   ├── 💡 proactiveTip.ts    # Health tips
    │   ├── 📈 dashboard.ts       # Dashboard insights
    │   ├── 🔄 sync.ts            # Data sync
    │   ├── 👨‍💼 admin.ts          # Admin API
    │   └── 🤖 adminAssistant.ts  # Admin AI helper
    │
    ├── 📁 prompts/               # AI Prompt Templates (5+ files)
    │   ├── 💬 chat.ts            # Dr. Eva chat prompts
    │   ├── 📊 report.ts         # Report analysis prompts
    │   ├── 📈 dashboard.ts       # Dashboard analysis prompts
    │   ├── 💡 proactiveTip.ts   # Health tip prompts
    │   └── 📅 routine.ts         # Routine generation prompts
    │
    ├── 📁 services/              # Backend Services (3+ files)
    │   ├── 🧠 gemini.ts          # AI model wrapper (LLAMA 3.1)
    │   ├── 💾 database.ts        # D1 database operations
    │   └── 📦 cache.ts           # Response caching
    │
    └── 📁 middleware/             # Middleware (3+ files)
        ├── 🔐 auth.ts            # JWT verification
        ├── 🚦 rateLimit.ts       # Rate limiting
        └── 📝 logger.ts          # Request logging
```

---

## ✨ TÍNH NĂNG CHÍNH

### 1. 5 Bài Test Thị Lực Chuyên Nghiệp

| Test | Mô tả | Phát hiện | Thời gian |
|------|-------|-----------|-----------|
| **Snellen Chart** | Đo thị lực với chữ E xoay ngẫu nhiên | Cận thị, viễn thị | ~3 phút |
| **Ishihara Plates** | 14 bảng màu Ishihara chuẩn | Mù màu đỏ-xanh | ~5 phút |
| **Amsler Grid** | Lưới kiểm tra điểm vàng | Thoái hóa điểm vàng (AMD) | ~3 phút |
| **Astigmatism Dial** | Biểu đồ tia xoay cho từng mắt | Loạn thị | ~3 phút |
| **Duochrome Test** | Bảng hai màu đỏ-xanh | Cận thị / Viễn thị | ~3 phút |

### 2. Trợ Lý AI - Tiến Sĩ Bác Sĩ Eva (100% MIỄN PHÍ)

| Tính năng | Mô tả | Chi phí |
|-----------|-------|---------|
| 💬 **Chat văn bản** | Hỏi đáp y khoa với 150-300 từ chi tiết | **$0** |
| 🎤 **Chat giọng nói** | Điều khiển bằng giọng nói | **$0** |
| 📊 **Báo cáo AI** | Phân tích 400-500 từ + 12-15 khuyến nghị | **$0** |
| 📅 **Lịch tập hàng tuần** | Routine chăm sóc mắt cá nhân hóa | **$0** |
| 💡 **Mẹo chủ động** | Lời khuyên 50-70 từ có cơ sở khoa học | **$0** |
| 🔊 **Đọc hướng dẫn** | TTS cho hướng dẫn test | **$0** |

### 3. Dashboard & Báo Cáo

- 🎯 **Điểm số sức khỏe mắt** với phân tích 80-120 từ
- 📈 **Lịch sử test** với so sánh tiến bộ
- 📋 **Lịch trình chăm sóc** cá nhân hóa
- 📄 **Xuất PDF** báo cáo chi tiết

---

## 🔄 LUỒNG HOẠT ĐỘNG

### Quy Trình Tổng Quan

```
👤 Người dùng
    ↓
🔐 Đăng nhập (name, phone, age)
    ↓
🏠 Trang chủ
    ↓
    ├─→ 👁️ Làm Test → 📝 Kết quả → 🤖 AI Phân tích → 📋 Báo cáo
    ├─→ 💬 Chat AI → 🧠 Dr. Eva trả lời
    ├─→ 📊 Xem Dashboard → 📈 Insights AI
    └─→ 📅 Xem Routine → 🗓️ Lịch cá nhân
```

### Quy Trình Xác Thực

```
1. User nhập thông tin (tên, SĐT, tuổi)
2. Frontend → POST /api/auth/login
3. Worker → Kiểm tra/Tạo user trong D1
4. Worker → Trả JWT Token + User data
5. Frontend → Lưu token vào localStorage
6. Các request tiếp theo → Authorization: Bearer token
7. Worker → Verify JWT → Response data
```

### Quy Trình Làm Test

```
1. User bắt đầu test
2. Hiển thị hướng dẫn + TTS
3. Loop mỗi câu hỏi:
   - Hiển thị câu hỏi
   - User chọn đáp án (keyboard/voice)
   - Ghi nhận kết quả
4. Tính điểm cuối cùng
5. generateReport(testData) → POST /api/report
6. Worker → AI phân tích (LLAMA 3.1)
7. Trả báo cáo JSON
8. Lưu localStorage + hiển thị kết quả
```

### Quy Trình Chat AI

```
1. User nhập câu hỏi
2. chat(message, context) → POST /api/chat
3. Worker → Build prompt với context
4. Workers AI (LLAMA 3.1) → Generate response
5. Trả response (150-300 từ)
6. Hiển thị câu trả lời
```

---

## 📚 API ENDPOINTS

### Authentication

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập (name, phone, age) |
| POST | `/api/auth/verify` | Xác thực JWT token |
| POST | `/api/auth/logout` | Đăng xuất |

### AI Services (FREE - LLAMA 3.1)

| Method | Endpoint | Mô tả | Response |
|--------|----------|-------|----------|
| POST | `/api/chat` | Chat với Dr. Eva | 150-300 từ |
| POST | `/api/report` | Tạo báo cáo test | 400-500 từ + 12-15 khuyến nghị |
| POST | `/api/dashboard` | Dashboard insights | 80-120 từ |
| POST | `/api/routine` | Lịch tập cá nhân | 7-day routine |
| POST | `/api/proactive-tip` | Mẹo sức khỏe | 50-70 từ |

### Admin API (Protected)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/users` | Danh sách người dùng |
| GET | `/api/admin/records` | Lịch sử test |
| GET | `/api/admin/stats` | Thống kê tổng hợp |

### Data Sync

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/sync/pull` | Lấy dữ liệu từ server |
| POST | `/api/sync/history` | Đồng bộ lịch sử test |
| POST | `/api/sync/settings` | Đồng bộ cài đặt |

---

## 🗄️ DATABASE SCHEMA (D1)

### Tables

- **users**: User accounts (id, phone, password, full_name, yob, gender, created_at)
- **sessions**: JWT sessions
- **test_results**: Test results (id, user_id, type, score, details, severity, created_at)
- **ai_reports**: Cached AI reports (id, result_id, content, recommendations, created_at)
- **routines**: Weekly routines
- **reminders**: User reminders
- **chat_history**: Chat conversations
- **user_settings**: User preferences
- **analytics**: Event tracking

Xem chi tiết trong `worker/schema.sql`.

---

## 🔒 BẢO MẬT

| Feature | Mô tả | Status |
|---------|-------|--------|
| 🔐 **JWT Auth** | Token expiry 7 ngày | ✅ |
| 🛡️ **CSRF Protection** | Origin validation | ✅ |
| 🚫 **Rate Limiting** | 60 requests/minute | ✅ |
| 🌐 **CORS** | Whitelist domains | ✅ |
| 🔒 **XSS Prevention** | HTML escaping | ✅ |
| 📝 **Input Sanitization** | TTS text sanitization | ✅ |

---

## ⚙️ CẤU HÌNH MÔI TRƯỜNG

### Frontend (.env)

```env
VITE_API_URL=https://vision-coach-worker.stu725114073.workers.dev
```

### Worker (wrangler.toml)

```toml
name = "vision-coach-worker"
account_id = "2b532552ba77e0909d0a3b9bdf040984"

[[d1_databases]]
binding = "DB"
database_name = "testmatai"
database_id = "4f94c079-cbcf-4bed-85ea-de9e9b302e4e"

[[kv_namespaces]]
binding = "CACHE"
id = "942c339bec2e43969167aa507c723f97"

[ai]
binding = "AI"
```

### Secrets (set via wrangler)

```bash
npx wrangler secret put JWT_SECRET
```

---

## 🚀 CÀI ĐẶT & CHẠY

### Frontend

```bash
# Clone repository
git clone https://github.com/LongNgn204/testaivission.git
cd testaivission

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

### Backend (Cloudflare Worker)

```bash
# Di chuyển vào thư mục worker
cd worker

# Cài đặt dependencies
npm install

# Đăng nhập Cloudflare
npx wrangler login

# Tạo D1 database (chỉ lần đầu)
npx wrangler d1 create testmatai

# Apply migrations
npm run db:schema

# Setup secrets
npx wrangler secret put JWT_SECRET

# Deploy to production
npx wrangler deploy

# Test locally
npx wrangler dev
```

---

## 📊 HIỆU NĂNG

### Metrics (Lighthouse)

| Chỉ số | Giá trị | Đánh giá |
|--------|---------|----------|
| Performance | 96/100 | Xuất sắc |
| Accessibility | 100/100 | Tuyệt đối |
| Best Practices | 95/100 | Tốt |
| SEO | 100/100 | Tuyệt đối |

### Backend Performance

- **Cold start**: ~10-20ms
- **Warm requests**: <5ms
- **D1 queries**: 10-50ms
- **KV reads**: <1ms
- **AI generation**: 1-5s (cached: <1ms)

---

## 🧪 TESTING

### Test Scenarios

1. **Authentication**: Login, verify token, logout
2. **Vision Tests**: Snellen, Ishihara, Amsler, Astigmatism, Duochrome
3. **AI Analysis**: Report generation, chat, dashboard insights
4. **Voice Control**: Speech recognition, TTS
5. **Offline**: Service Worker caching, offline queue

---

## 📈 CHANGELOG

### v2.3.0 (December 2024) ⭐ CURRENT

#### 🧠 AI Training Upgrade
- ✅ Dr. Eva nâng cấp lên **Tiến sĩ - Bác sĩ** với 20 năm kinh nghiệm
- ✅ Kiến thức y khoa chuẩn quốc tế: **WHO, AAO, AREDS2**
- ✅ Câu trả lời chi tiết hơn: **150-300 từ**
- ✅ Báo cáo chuyên sâu: **400-500 từ + 12-15 khuyến nghị**
- ✅ Ngôn ngữ thuần túy **100%** (không pha trộn)
- ✅ Cấu trúc chuẩn bác sĩ: Đánh giá → Phân tích → Khuyến nghị → Tiên lượng

### v2.2.0 (December 2024)

#### 🔐 Security Fixes
- ✅ Fixed XSS vulnerability in Admin Dashboard
- ✅ Added admin authentication
- ✅ Implemented CSRF protection

#### 🐛 Bug Fixes
- ✅ Fixed localStorage key mismatch
- ✅ Fixed password validation

### v2.1.0 (December 2024)

#### 🆕 New Features
- 🎤 Voice Chat miễn phí (Web Speech API)
- 📊 Admin Dashboard với D1 database
- 🧠 Enhanced AI với kiến thức nhãn khoa

---

## 🎯 NGUYÊN LÝ HOẠT ĐỘNG

### Snellen Test - Tính Toán Kích Thước

```typescript
// Tính toán kích thước ký tự dựa trên thị lực mục tiêu
const calculateOptotypeSize = (targetAcuity: number, distanceMm: number) => {
  // 1 phút cung (arcminute) tại khoảng cách d
  const gapSizeMm = distanceMm * Math.tan(Math.PI / (180 * 60));
  // Ký tự E chuẩn 20/20 gấp 5 lần kích thước gap
  const baseSizeMm = gapSizeMm * 5; 
  // Quy đổi tỉ lệ Snellen ngược (ví dụ 20/40 thì chữ to gấp đôi 20/20)
  return baseSizeMm * (20 / targetAcuity); 
};

// Chuyển đổi mm → px
const px = mm * PPI / 25.4;
```

### Calibration PPI

- Người dùng đặt thẻ ATM/CCCD lên màn hình
- Đo kích thước thực tế (mm) và pixel (px)
- Tính PPI = (px / mm) * 25.4
- Lưu PPI để tính toán kích thước chính xác

### AI Prompt Engineering

```typescript
// System Prompt cho Dr. Eva
const SYSTEM_PROMPT = `
Bạn là TIẾN SĨ - BÁC SĨ EVA, chuyên gia nhãn khoa với 20 năm kinh nghiệm.
Nhiệm vụ: Phân tích dữ liệu thị lực và đưa ra khuyến nghị.

QUY TẮC AN TOÀN:
1. Không bao giờ đưa ra chẩn đoán y khoa khẳng định
2. Nếu VA < 20/50, BẮT BUỘC khuyến nghị đi khám
3. Trả lời ngắn gọn, đồng cảm, tiếng Việt thuần túy
4. Cấu trúc: Đánh giá → Phân tích → Khuyến nghị → Tiên lượng
`;
```

---

## 🔧 CÔNG CỤ PHÁT TRIỂN

### IDE & Extensions

- **VS Code** với extensions:
  - ES7+ React Snippets
  - Tailwind CSS IntelliSense
  - TypeScript
  - Prettier
  - ESLint

### Scripts

#### Frontend
```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
```

#### Backend
```bash
npm run dev              # Local development
npm run deploy           # Deploy to production
npm run db:schema        # Apply database schema
npm run db:query         # Query database
npx wrangler tail        # View logs
```

---

## 📝 QUY TẮC CODE

### TypeScript

- **Strict mode**: Bật toàn bộ strict checks
- **No implicit any**: Phải khai báo type rõ ràng
- **Strict null checks**: Xử lý null/undefined
- **No unused locals/parameters**: Clean code

### Code Style

- **Identifiers**: English (camelCase cho JS/TS)
- **Comments**: Tiếng Việt (giải thích logic quan trọng)
- **Structure**: Tách UI/logic/data rõ ràng
- **Error handling**: Try-catch với logging

### Testing

- **Unit tests**: Cho logic nghiệp vụ quan trọng
- **Smoke tests**: Cho LLM/API endpoints
- **Integration tests**: Cho luồng end-to-end

---

## 🐛 TROUBLESHOOTING

### Common Issues

1. **Database not found**
   ```bash
   npx wrangler d1 list
   npx wrangler d1 create testmatai
   ```

2. **Token errors**
   ```bash
   npx wrangler secret list
   npx wrangler secret put JWT_SECRET
   ```

3. **CORS errors**
   - Check `worker/src/middleware/cors.ts`
   - Verify allowed origins

4. **Rate limit**
   - Adjust in `worker/src/middleware/rateLimit.ts`

---

## 🚧 HẠN CHẾ & RỦI RO

### Hạn chế hiện tại

1. **Phụ thuộc phần cứng**: Độ chính xác Ishihara phụ thuộc màn hình
2. **Chưa tự động đo khoảng cách**: User phải tự giữ khoảng cách
3. **Giới hạn AI**: Đôi khi lời khuyên chung chung nếu thiếu dữ liệu

### Kế hoạch phát triển

1. **Computer Vision**: MediaPipe để đo khoảng cách webcam
2. **Mobile App**: Native app với cảm biến chuyên sâu
3. **Telemedicine**: Kết nối HIS để đặt lịch khám

---

## 📚 TÀI LIỆU THAM KHẢO

### Báo cáo & Thuyết trình

- `baocao.md` - Báo cáo đồ án chi tiết
- `thuyet_trinh_vision_coach.md` - Tài liệu thuyết trình
- `README.md` - Tài liệu chính của dự án

### External Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [React 19 Docs](https://react.dev/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)

---

## 👨‍💻 TÁC GIẢ

**Long Nguyễn**
- GitHub: [@LongNgn204](https://github.com/LongNgn204)
- Project: [testaivission](https://github.com/LongNgn204/testaivission)

---

## 📄 LICENSE

MIT License

---

**Last Updated**: December 2024  
**Version**: 2.3.0

---

> **Lưu ý cho AI**: File này được tạo để cung cấp context đầy đủ về dự án Vision Coach. Khi được yêu cầu làm việc với dự án này, hãy tham khảo file này để hiểu rõ kiến trúc, luồng hoạt động, và các quy tắc phát triển.

