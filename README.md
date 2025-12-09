# 👁️ Vision Coach - Nền Tảng Chăm Sóc Sức Khỏe Mắt AI

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

**Ứng dụng web toàn diện cho kiểm tra, giám sát và tư vấn sức khỏe mắt được hỗ trợ bởi AI**

[Demo](https://testaivision.pages.dev) • [Báo lỗi](https://github.com/LongNgn204/testaivission/issues)

</div>

---

## ✨ Tính Năng Chính

### 👁️ Bài Test Thị Lực
| Test | Mô tả |
|------|-------|
| **Snellen** | Đo thị lực thông minh với chữ E xoay |
| **Ishihara** | Phát hiện mù màu |
| **Amsler Grid** | Sàng lọc thoái hóa điểm vàng |
| **Astigmatism** | Phát hiện loạn thị |
| **Duochrome** | Kiểm tra cận thị/viễn thị |

### 🤖 Trợ Lý AI - Bác Sĩ Eva
- **Chat thông minh**: Hỏi đáp về sức khỏe mắt
- **Phân tích kết quả**: Báo cáo chi tiết từ AI
- **Lời khuyên cá nhân hóa**: Mẹo chăm sóc mắt hàng ngày
- **Text-to-Speech**: Đọc hướng dẫn bằng giọng nói (Browser API)

### 📊 Dashboard & Báo Cáo
- Điểm số sức khỏe mắt tổng thể
- Xu hướng thị lực theo thời gian
- Lịch trình chăm sóc mắt hàng tuần
- Xuất PDF báo cáo

### 🛡️ Bảo Mật
- JWT Authentication
- API keys an toàn trên backend
- Mã hóa mật khẩu SHA-256
- Rate limiting & CORS

---

## 🚀 Cài Đặt Nhanh

### Yêu Cầu
- Node.js 18+
- Cloudflare account

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
npm run deploy
```

---

## 🛠️ Công Nghệ

### Frontend
- **React 19** + TypeScript
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Router** - Navigation

### Backend
- **Cloudflare Workers** - Serverless
- **Cloudflare Workers AI** - Llama 3.1 (miễn phí)
- **D1 Database** - SQLite cloud
- **itty-router** - API routing

### AI Models
- **Llama 3.1** (Cloudflare Workers AI) - Chat, phân tích
- **Browser SpeechSynthesis** - Text-to-Speech

---

## 📁 Cấu Trúc Dự Án

```
testaivission/
├── components/          # React components
│   ├── vision-coach/    # Chat & Voice interface
│   ├── ui/              # UI components
│   └── *.tsx            # Test components
├── pages/               # Page components
├── services/            # API services
├── context/             # React context
├── hooks/               # Custom hooks
├── i18n/                # Đa ngôn ngữ (VI/EN)
├── worker/              # Cloudflare Worker backend
│   ├── src/handlers/    # API handlers
│   ├── src/services/    # Business logic
│   └── wrangler.toml    # Worker config
└── index.html           # Entry point
```

---

## 📚 API Endpoints

### Authentication
```
POST /api/auth/register   - Đăng ký
POST /api/auth/login      - Đăng nhập
POST /api/auth/verify     - Xác thực token
```

### AI Services
```
POST /api/chat            - Chat với Eva (Llama 3.1)
POST /api/report          - Tạo báo cáo AI
POST /api/dashboard       - Dashboard insights
POST /api/routine         - Lịch trình cá nhân
```

### Sync & Data
```
POST /api/sync/pull       - Lấy dữ liệu từ backend
POST /api/sync/history    - Đồng bộ lịch sử test
POST /api/sync/settings   - Đồng bộ cài đặt
```

---

## 🌐 Ngôn Ngữ

- 🇻🇳 **Tiếng Việt** - Hoàn chỉnh
- 🇺🇸 **English** - Hoàn chỉnh

---

## 📈 Tính Năng Sắp Tới

- [ ] OAuth (Google, Facebook)
- [ ] Đặt lịch khám bác sĩ
- [ ] Mobile app (React Native)
- [ ] Tích hợp bệnh viện
- [ ] 2FA authentication

---

## 📝 License

MIT License - Xem file LICENSE

---

## 👨‍💻 Tác Giả

**Long Nguyễn**

Tạo với ❤️ cho sức khỏe đôi mắt

---

**Last Updated**: December 2024  
**Version**: 2.0.0
