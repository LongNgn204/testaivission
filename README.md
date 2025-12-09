# 👁️ Vision Coach - Nền Tảng Chăm Sóc Sức Khỏe Mắt AI

<div align="center">

![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020.svg)
![AI](https://img.shields.io/badge/AI-100%25%20Free-brightgreen.svg)

**Ứng dụng web toàn diện cho kiểm tra, giám sát và tư vấn sức khỏe mắt được hỗ trợ bởi AI**

🎯 **100% MIỄN PHÍ** - Không cần API key  
🚀 **Cloudflare Workers AI** - LLAMA 3.1 8B

[🌐 Demo](https://slht4653.testaivision.pages.dev) • [👨‍💼 Admin Dashboard](./admin-standalone.html) • [🐛 Báo lỗi](https://github.com/LongNgn204/testaivission/issues)

</div>

---

## 📑 Mục Lục

- [✨ Tính Năng](#-tính-năng-chính)
- [🚀 Cài Đặt](#-cài-đặt-nhanh)
- [🛠️ Công Nghệ](#️-công-nghệ)
- [📁 Cấu Trúc](#-cấu-trúc-dự-án)
- [📚 API](#-api-endpoints)
- [🔒 Bảo Mật](#-bảo-mật)
- [📈 Changelog](#-changelog)

---

## ✨ Tính Năng Chính

### 👁️ 5 Bài Test Thị Lực Chuyên Nghiệp

| Test | Mô tả | Phát hiện | Thời gian |
|------|-------|-----------|-----------|
| **Snellen Chart** | Đo thị lực với chữ E xoay ngẫu nhiên | Cận thị, viễn thị | ~3 phút |
| **Ishihara Plates** | 14 bảng màu Ishihara chuẩn | Mù màu đỏ-xanh (Deuteranopia/Protanopia) | ~5 phút |
| **Amsler Grid** | Lưới kiểm tra điểm vàng | Thoái hóa điểm vàng (AMD) | ~3 phút |
| **Astigmatism Dial** | Biểu đồ tia xoay cho từng mắt | Loạn thị (Astigmatism) | ~3 phút |
| **Duochrome Test** | Bảng hai màu đỏ-xanh | Cận thị (Myopia) / Viễn thị (Hyperopia) | ~3 phút |

### 🤖 Trợ Lý AI - Bác Sĩ Eva (100% MIỄN PHÍ)

| Tính năng | Mô tả | Công nghệ | Chi phí |
|-----------|-------|-----------|---------|
| 💬 **Chat văn bản** | Hỏi đáp về sức khỏe mắt | Cloudflare LLAMA 3.1 8B | **$0** |
| 🎤 **Chat giọng nói** | Điều khiển bằng giọng nói | Web Speech API + LLAMA 3.1 | **$0** |
| 📊 **Báo cáo AI** | Phân tích kết quả test chi tiết | Cloudflare LLAMA 3.1 8B | **$0** |
| 📅 **Lịch tập hàng tuần** | Routine chăm sóc mắt cá nhân hóa | Cloudflare LLAMA 3.1 8B | **$0** |
| 💡 **Mẹo chủ động** | Lời khuyên theo ngữ cảnh | Cloudflare LLAMA 3.1 8B | **$0** |
| 🔊 **Đọc hướng dẫn** | TTS cho hướng dẫn test | Browser SpeechSynthesis | **$0** |

### 📊 Dashboard & Báo Cáo

- 🎯 **Điểm số sức khỏe mắt tổng thể** với biểu đồ xu hướng
- 📈 **Lịch sử test** với so sánh tiến bộ theo thời gian
- 📋 **Lịch trình chăm sóc mắt** cá nhân hóa theo tuổi và tình trạng
- 📄 **Xuất PDF** báo cáo chi tiết để chia sẻ với bác sĩ

### 🏥 Admin Dashboard (`admin-standalone.html`)

- 👥 **Quản lý người dùng** - Xem, sửa, xóa hồ sơ
- 📋 **Hồ sơ khám** - Lịch sử test từ D1 database
- 📊 **Thống kê tổng hợp** - Biểu đồ phân bố test
- 📥 **Xuất Excel** - Export dữ liệu đầy đủ
- 🤖 **AI Assistant** - Chat với Dr. Vision AI

---

## 🚀 Cài Đặt Nhanh

### Yêu Cầu

- ✅ Node.js 18+
- ✅ npm hoặc yarn
- ✅ Cloudflare account (miễn phí)

### 1️⃣ Frontend

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

# Preview production build
npm run preview
```

### 2️⃣ Backend (Cloudflare Worker)

```bash
# Di chuyển vào thư mục worker
cd worker

# Cài đặt dependencies
npm install

# Tạo D1 database (chỉ lần đầu)
npx wrangler d1 create vision-coach-db

# Apply migrations
npx wrangler d1 execute vision-coach-db --file=./migrations/0001_init.sql

# Deploy to production
npx wrangler deploy

# Test locally
npx wrangler dev
```

### 3️⃣ Environment Variables

**Frontend (`.env`):**
```env
VITE_API_URL=https://vision-coach-worker.stu725114073.workers.dev
```

**Worker (`wrangler.toml`):**
```toml
[vars]
JWT_SECRET = "your-secure-jwt-secret"

[[d1_databases]]
binding = "DB"
database_name = "vision-coach-db"
database_id = "your-database-id"

[ai]
binding = "AI"
```

---

## 🛠️ Công Nghệ

### Frontend Stack

| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| React | 19 | UI Framework với Concurrent Mode |
| TypeScript | 5.0 | Type safety toàn bộ codebase |
| Tailwind CSS | 3.4 | Utility-first CSS với dark mode |
| Vite | 6.4 | Lightning-fast build tool |
| React Router | 6 | Client-side routing với lazy loading |
| Lucide Icons | 0.548 | Icon library |

### Backend Stack

| Công nghệ | Mô tả |
|-----------|-------|
| Cloudflare Workers | Serverless edge functions (0ms cold start) |
| Workers AI | LLAMA 3.1 8B (miễn phí không giới hạn) |
| D1 Database | SQLite cloud database (5GB free) |
| itty-router | Lightweight API routing |
| JWT | Xác thực với 7 ngày expiry |

### AI Features

| Model | Use Case | Latency | Cost |
|-------|----------|---------|------|
| LLAMA 3.1 8B | Chat, Reports, Routine, Tips | ~1-2s | **FREE** |
| Web Speech API | Voice recognition (STT) | Real-time | **FREE** |
| SpeechSynthesis | Text-to-speech (TTS) | Instant | **FREE** |

---

## 📁 Cấu Trúc Dự Án

```
testaivission/
├── 📁 components/               # React components
│   ├── 📁 vision-coach/         # AI Chat & Voice
│   │   ├── ChatInterface.tsx    # Text chat với Dr. Eva
│   │   └── VoiceInterface.tsx   # Voice chat interface
│   ├── SnellenTest.tsx          # Snellen chart test
│   ├── ColorBlindTest.tsx       # Ishihara plates test
│   ├── AmslerGridTest.tsx       # AMD detection test
│   ├── AstigmatismTest.tsx      # Astigmatism dial test
│   ├── DuochromeTest.tsx        # Myopia/Hyperopia test
│   ├── Header.tsx               # Navigation header
│   ├── TestShell.tsx            # Test wrapper component
│   └── ErrorBoundary.tsx        # Error handling
│
├── 📁 pages/                    # Page components
│   ├── AuthPage.tsx             # Đăng nhập (name/phone/age)
│   ├── Home.tsx                 # Dashboard chính
│   └── ProgressPage.tsx         # Lịch sử & tiến trình
│
├── 📁 services/                 # API services
│   ├── authService.ts           # JWT auth & user management
│   ├── chatbotService.ts        # AI chat API calls
│   ├── storageService.ts        # LocalStorage management
│   ├── syncService.ts           # Backend data sync
│   ├── snellenService.ts        # Snellen test logic
│   ├── colorBlindService.ts     # Colorblind test logic
│   ├── amslerGridService.ts     # Amsler test logic
│   ├── astigmatismService.ts    # Astigmatism test logic
│   └── duochromeService.ts      # Duochrome test logic
│
├── 📁 context/                  # React Context providers
│   ├── LanguageContext.tsx      # i18n (vi/en)
│   ├── ThemeContext.tsx         # Dark/Light mode
│   ├── UserContext.tsx          # User state
│   ├── RoutineContext.tsx       # Weekly routine
│   └── TourGuideContext.tsx     # Onboarding tour
│
├── 📁 worker/                   # Cloudflare Worker backend
│   ├── 📁 src/
│   │   ├── index.ts             # API router & CORS
│   │   ├── 📁 handlers/
│   │   │   ├── auth.ts          # Login/Verify/Logout
│   │   │   ├── chat.ts          # AI chat endpoint
│   │   │   ├── aiReport.ts      # Report generation
│   │   │   ├── admin.ts         # Admin API (protected)
│   │   │   └── sync.ts          # Data sync endpoints
│   │   └── 📁 services/
│   │       ├── database.ts      # D1 database wrapper
│   │       └── gemini.ts        # AI model wrapper
│   ├── 📁 migrations/           # D1 SQL migrations
│   └── wrangler.toml            # Worker config
│
├── 📁 assets/                   # Static assets
│   ├── logo.png                 # App logo
│   ├── dr_eva.png               # Dr. Eva avatar
│   └── vision_tests.png         # Screenshot
│
├── 📄 admin-standalone.html     # Admin dashboard (standalone)
├── 📄 index.html                # Entry point
├── 📄 manifest.json             # PWA manifest
├── 📄 App.tsx                   # Main React app
└── 📄 tailwind.config.js        # Tailwind config
```

---

## 📚 API Endpoints

### 🔐 Authentication

```http
POST /api/auth/login
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "phone": "0912345678",
  "age": "25"
}

Response: { "success": true, "user": { "id", "name", "token" } }
```

```http
POST /api/auth/verify
Authorization: Bearer <token>

Response: { "success": true, "user": { "userId", "name", "phone" } }
```

### 🤖 AI Services (FREE - LLAMA 3.1)

```http
POST /api/chat
{
  "message": "Mắt tôi hay bị mỏi khi làm việc máy tính",
  "language": "vi"
}

Response: { "message": "Chào bạn! Mỏi mắt khi làm việc...", "model": "llama-3.1-8b" }
```

```http
POST /api/report
{
  "testType": "snellen",
  "testData": { "score": "20/25", "accuracy": 0.85 },
  "language": "vi"
}

Response: { "summary": "...", "recommendations": [...], "severity": "LOW" }
```

### 👨‍💼 Admin API (Protected)

```http
GET /api/admin/users
Authorization: Bearer <admin-token>

Response: { "success": true, "users": [...], "total": 150 }
```

```http
GET /api/admin/records
Authorization: Bearer <admin-token>

Response: { "success": true, "records": [...], "total": 500 }
```

```http
GET /api/admin/stats
Authorization: Bearer <admin-token>

Response: { "success": true, "stats": { "totalUsers", "totalTests", "testsByType" } }
```

### 🔄 Data Sync

```http
POST /api/sync/pull
Authorization: Bearer <token>

Response: { "history": [...], "settings": {...}, "routine": {...} }
```

```http
POST /api/sync/history
Authorization: Bearer <token>
{
  "history": [{ "id", "testType", "date", "resultData" }]
}

Response: { "success": true, "synced": 5 }
```

---

## 🔒 Bảo Mật

### Implemented Security Features

| Feature | Mô tả | Status |
|---------|-------|--------|
| 🔐 **JWT Auth** | Token expiry 7 ngày | ✅ |
| 🛡️ **CSRF Protection** | Origin validation | ✅ |
| 🚫 **Rate Limiting** | 60 requests/minute | ✅ |
| 🌐 **CORS** | Whitelist domains | ✅ |
| 🔒 **XSS Prevention** | HTML escaping | ✅ |
| 📝 **Input Sanitization** | TTS text sanitization | ✅ |
| 🔑 **Secure Secrets** | Backend-only API keys | ✅ |
| ⏰ **Session Expiry** | Admin session 7 days | ✅ |
| 🚨 **Error Masking** | Production error hiding | ✅ |
| 📦 **Admin Auth** | Protected admin endpoints | ✅ |

### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*...)

---

## 🌐 Đa Ngôn Ngữ

| Ngôn ngữ | Hỗ trợ | AI Response |
|----------|--------|-------------|
| 🇻🇳 Tiếng Việt | 100% | 100% thuần Việt |
| 🇺🇸 English | 100% | 100% pure English |

**AI Language Consistency:**
- Khi user chọn tiếng Việt → AI trả lời 100% tiếng Việt
- When user selects English → AI responds 100% in English
- Không trộn lẫn ngôn ngữ trong câu trả lời

---

## 📈 Changelog

### v2.2.0 (December 2024)

#### 🔐 Security Fixes
- ✅ Fixed XSS vulnerability in Admin Dashboard
- ✅ Added admin authentication to all `/api/admin/*` endpoints
- ✅ Implemented CSRF protection with origin validation
- ✅ Added session expiry validation (7 days)
- ✅ Fixed error masking in production

#### 🐛 Bug Fixes
- ✅ **CRITICAL:** Fixed localStorage key mismatch in sync service
- ✅ Fixed fallback result not saved when AI error occurs
- ✅ Fixed password validation (now requires uppercase + special char)
- ✅ Fixed phone validation to support international format
- ✅ Fixed TTS text sanitization

#### ✨ Improvements
- ✅ Added Error Boundary with friendly UI
- ✅ Added ARIA labels for accessibility
- ✅ Added Open Graph & Twitter Card meta tags
- ✅ Added noscript fallback
- ✅ Added `formatDate()` utility for consistent date formatting
- ✅ Updated PWA icons to use existing assets

### v2.1.0 (December 2024)

#### 🆕 New Features
- 🎤 Voice Chat miễn phí (Web Speech API)
- 📊 Admin Dashboard với D1 database
- 🧠 Enhanced AI với kiến thức nhãn khoa chuyên sâu

#### 🔧 Improvements
- 💬 AI prompts cải thiện với mức độ khẩn cấp (🔴🟡🟢)
- 🌐 100% language consistency
- 🚀 Build size optimized (171KB gzip)

---

## 📝 License

MIT License - Xem file [LICENSE](./LICENSE)

---

## 👨‍💻 Tác Giả

**Long Nguyễn**

- GitHub: [@LongNgn204](https://github.com/LongNgn204)
- Project: [testaivission](https://github.com/LongNgn204/testaivission)

---

<div align="center">

Tạo với ❤️ cho sức khỏe đôi mắt của bạn

**Last Updated**: December 2024  
**Version**: 2.2.0

</div>
