# 👁️ Vision Coach - Nền Tảng Chăm Sóc Sức Khỏe Mắt AI

<div align="center">

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![AI](https://img.shields.io/badge/AI-100%25%20Free-green.svg)

**Ứng dụng web toàn diện cho kiểm tra, giám sát và tư vấn sức khỏe mắt được hỗ trợ bởi AI**

🎯 **100% MIỄN PHÍ** - Không cần API key  
🚀 **Cloudflare Workers AI** - LLAMA 3.1

[Demo](https://slht4653.testaivision.pages.dev) • [Admin Dashboard](./admin-standalone.html) • [Báo lỗi](https://github.com/LongNgn204/testaivission/issues)

</div>

---

## ✨ Tính Năng Chính

### 👁️ 5 Bài Test Thị Lực

| Test | Mô tả | Phát hiện |
|------|-------|-----------|
| **Snellen** | Đo thị lực với chữ E xoay | Cận thị, viễn thị |
| **Ishihara** | 14 bảng màu Ishihara | Mù màu đỏ-xanh |
| **Amsler Grid** | Lưới kiểm tra hoàng điểm | Thoái hóa điểm vàng (AMD) |
| **Astigmatism** | Biểu đồ tia xoay | Loạn thị |
| **Duochrome** | Bảng hai màu đỏ-xanh | Cận thị / Viễn thị |

### 🤖 Trợ Lý AI - Bác Sĩ Eva (100% FREE)

| Tính năng | Công nghệ | Chi phí |
|-----------|-----------|---------|
| 💬 **Chat văn bản** | Cloudflare LLAMA 3.1 | **$0** |
| 🎤 **Chat giọng nói** | Web Speech API + LLAMA 3.1 | **$0** |
| 📊 **Báo cáo AI** | Cloudflare LLAMA 3.1 | **$0** |
| 📅 **Lịch tập hàng tuần** | Cloudflare LLAMA 3.1 | **$0** |
| 💡 **Mẹo chủ động** | Cloudflare LLAMA 3.1 | **$0** |
| 🔊 **Đọc hướng dẫn** | Browser SpeechSynthesis | **$0** |

### 📊 Dashboard & Báo Cáo

- Điểm số sức khỏe mắt tổng thể
- Xu hướng thị lực theo thời gian
- Lịch trình chăm sóc mắt cá nhân hóa
- Xuất PDF báo cáo

### 🏥 Admin Dashboard

- Quản lý hồ sơ bệnh nhân
- Xem lịch sử test từ D1 database
- Thống kê tổng hợp
- Xuất dữ liệu Excel

---

## 🚀 Cài Đặt Nhanh

### Yêu Cầu
- Node.js 18+
- Cloudflare account (miễn phí)

### Frontend

```bash
# Cài đặt dependencies
npm install

# Chạy development
npm run dev

# Build production
npm run build
```

### Backend (Cloudflare Worker)

```bash
cd worker

# Cài đặt dependencies
npm install

# Deploy
npx wrangler deploy
```

---

## 🛠️ Công Nghệ

### Frontend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| React | 19 | UI Framework |
| TypeScript | 5.0 | Type safety |
| Tailwind CSS | 3.4 | Styling |
| Vite | 5.4 | Build tool |
| React Router | 6 | Navigation |

### Backend
| Công nghệ | Mô tả |
|-----------|-------|
| Cloudflare Workers | Serverless edge functions |
| Workers AI | LLAMA 3.1 (miễn phí) |
| D1 Database | SQLite cloud database |
| itty-router | API routing |

### AI Features
| Model | Use Case | Free |
|-------|----------|------|
| LLAMA 3.1 8B | Chat, Reports, Tips | ✅ |
| Web Speech API | Voice recognition | ✅ |
| SpeechSynthesis | Text-to-speech | ✅ |

---

## 📁 Cấu Trúc Dự Án

```
testaivission/
├── 📁 components/           # React components
│   ├── vision-coach/       # Chat & Voice interface
│   │   ├── ChatInterface.tsx
│   │   └── VoiceInterface.tsx
│   └── *.tsx               # Test components
├── 📁 pages/                # Page components
│   ├── AuthPage.tsx        # Đăng nhập/Đăng ký
│   ├── Home.tsx            # Trang chủ
│   └── ProgressPage.tsx    # Tiến trình
├── 📁 services/             # API services
│   ├── aiService.ts        # AI wrapper
│   ├── chatbotService.ts   # Chat API calls
│   └── authService.ts      # Authentication
├── 📁 worker/               # Cloudflare Worker
│   ├── src/handlers/       # API handlers
│   │   ├── admin.ts        # Admin API
│   │   ├── chat.ts         # Chat endpoint
│   │   ├── aiReport.ts     # Report generation
│   │   └── auth.ts         # Authentication
│   ├── src/prompts/        # AI prompts
│   │   ├── chat.ts         # Chat prompts (enhanced)
│   │   └── report.ts       # Report prompts
│   └── wrangler.toml       # Worker config
├── 📄 admin-standalone.html # Admin dashboard
└── 📄 index.html            # Entry point
```

---

## 📚 API Endpoints

### Authentication
```http
POST /api/auth/login      # Đăng nhập (name, age, phone)
POST /api/auth/verify     # Xác thực token
POST /api/auth/logout     # Đăng xuất
```

### AI Services (FREE - LLAMA 3.1)
```http
POST /api/chat            # Chat với Dr. Eva
POST /api/report          # Tạo báo cáo AI
POST /api/dashboard       # Dashboard insights
POST /api/routine         # Lịch trình cá nhân
POST /api/proactive-tip   # Mẹo chủ động
```

### Admin (D1 Database)
```http
GET /api/admin/users      # Lấy danh sách users
GET /api/admin/records    # Lấy lịch sử test
GET /api/admin/stats      # Thống kê tổng hợp
```

### Sync
```http
POST /api/sync/pull       # Lấy dữ liệu từ backend
POST /api/sync/history    # Đồng bộ lịch sử test
POST /api/sync/settings   # Đồng bộ cài đặt
```

---

## 🌐 Ngôn Ngữ

- 🇻🇳 **Tiếng Việt** - Hoàn chỉnh 100%
- 🇺🇸 **English** - Hoàn chỉnh 100%

AI responses đảm bảo **nhất quán ngôn ngữ**:
- Tiếng Việt → 100% tiếng Việt (không trộn tiếng Anh)
- English → 100% English (no Vietnamese mixing)

---

## 🔒 Bảo Mật

- ✅ JWT Authentication (7 ngày)
- ✅ API keys an toàn trên backend
- ✅ Rate limiting (60 req/min)
- ✅ CORS protection
- ✅ No frontend API keys exposed

---

## 📈 Changelog v2.1.0

### 🆕 New Features
- 🎤 Voice Chat miễn phí (Web Speech API)
- 📊 Admin Dashboard với D1 database
- 🧠 Enhanced AI training với kiến thức nhãn khoa chuyên sâu

### 🔧 Improvements
- 💬 AI prompts cải thiện với mức độ khẩn cấp (🔴🟡🟢)
- 🌐 100% language consistency (no mixing)
- 🚀 Build size optimized (171KB gzip)

### 🐛 Bug Fixes
- Fixed "0% confidence" in AI reports
- Fixed "Không thể tạo báo cáo" error
- Fixed language mixing in AI responses

---

## 📝 License

MIT License - Xem file LICENSE

---

## 👨‍💻 Tác Giả

**Long Nguyễn**

Tạo với ❤️ cho sức khỏe đôi mắt

---

**Last Updated**: December 2024  
**Version**: 2.1.0
