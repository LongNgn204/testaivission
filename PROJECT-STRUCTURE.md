# 🏥 SỨC KHỎE AI - VISION TESTING PLATFORM

## 📋 MÔ TẢ DỰ ÁN

Ứng dụng web Progressive Web App (PWA) kiểm tra thị lực được hỗ trợ bởi AI, giúp người dùng kiểm tra sức khỏe mắt tại nhà với các bài test chuẩn y tế và nhận tư vấn từ AI chuyên khoa nhãn khoa.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### Frontend Framework & Libraries
- **React 19.2.0** - Framework chính cho UI
- **TypeScript 5.8.2** - Ngôn ngữ lập trình type-safe
- **Vite 6.2.0** - Build tool & dev server cực nhanh
- **React Router DOM 6.23.1** - Routing giữa các trang
- **Lucide React 0.548.0** - Thư viện icon hiện đại

### AI & Machine Learning
- **Google Gemini AI (@google/genai 1.28.0)** - AI chatbot & phân tích kết quả
- **Gemini 2.0 Flash** - Model AI nhanh, ổn định cho production
- **Google Cloud Text-to-Speech API** - Chuyển văn bản thành giọng nói chất lượng cao
  - Voice tiếng Việt: vi-VN-Wavenet-A (nữ)
  - Voice tiếng Anh: en-US-Wavenet-F (nữ)
- **Web Speech API** - Speech Recognition (nhận diện giọng nói)

### Export & Visualization
- **jsPDF 3.0.3** - Export báo cáo PDF
- **html2canvas 1.4.1** - Chụp màn hình để export

### Build & Optimization
- **Terser 5.44.0** - Minify JavaScript
- **@vitejs/plugin-react 5.0.0** - Plugin React cho Vite
- **Code Splitting** - Tách code thành chunks nhỏ
- **Lazy Loading** - Load component khi cần
- **Service Worker** - Cache & offline support

---

## 📁 CẤU TRÚC THỨ MỤC

```
d:\git\test/
│
├── 📱 index.html                    # Entry HTML file (PWA meta tags)
├── 📱 index.tsx                     # Entry JavaScript (render React app)
├── 📱 App.tsx                       # Main App Component (routing, providers)
│
├── 🔧 vite.config.ts                # Vite configuration (build, dev server)
├── 🔧 tsconfig.json                 # TypeScript configuration
├── 🔧 package.json                  # Dependencies & scripts
├── 🔧 .env.local                    # Environment variables (GEMINI_API_KEY)
│
├── 📄 manifest.json                 # PWA manifest (app info, icons, colors)
├── 📄 sw.js                         # Service Worker (caching, offline)
├── 📄 metadata.json                 # App metadata
├── 📄 types.ts                      # TypeScript type definitions
│
├── 📖 README.md                     # Hướng dẫn sử dụng dự án
├── 📖 PROJECT-STRUCTURE.md          # File này - Tài liệu cấu trúc dự án
│
├── 📂 components/                   # React Components (UI pieces)
│   ├── Header.tsx                   # Header với navigation, language, theme
│   ├── Sidebar.tsx                  # Sidebar menu
│   ├── UserInfo.tsx                 # Hiển thị thông tin user
│   ├── VoiceToggle.tsx              # Nút bật/tắt giọng nói
│   ├── VoiceControlButton.tsx       # Nút điều khiển giọng nói
│   ├── TestInstructionsPlayer.tsx   # Phát hướng dẫn test bằng giọng nói
│   │
│   ├── SnellenTest.tsx              # Test thị lực Snellen (20/20, 20/40, etc.)
│   ├── ColorBlindTest.tsx           # Test mù màu (Ishihara plates)
│   ├── AstigmatismTest.tsx          # Test loạn thị
│   ├── AstigmatismWheel.tsx         # Bánh xe loạn thị (visual)
│   ├── AmslerGridTest.tsx           # Test lưới Amsler (võng mạc)
│   ├── AmslerGrid.tsx               # Component lưới Amsler
│   ├── DuochromeTest.tsx            # Test Duochrome (red-green)
│   │
│   ├── VisionCoach.tsx              # AI Chatbot (2-way voice conversation)
│   ├── HealthDashboard.tsx          # Bảng điều khiển sức khỏe (stats, trends)
│   ├── HospitalLocator.tsx          # Tìm bệnh viện gần nhất (GPS)
│   ├── InteractiveExerciseModal.tsx # Bài tập mắt tương tác với AI
│   ├── ReportDetailModal.tsx        # Modal chi tiết báo cáo
│   └── ReportDisplayContent.tsx     # Nội dung báo cáo test
│
├── 📂 pages/                        # React Pages (full screens)
│   ├── WelcomePage.tsx              # Trang chào mừng (landing page)
│   ├── LoginPage.tsx                # Trang đăng nhập (nhập tên)
│   ├── Home.tsx                     # Trang chủ (danh sách tests)
│   ├── History.tsx                  # Lịch sử test đã làm
│   ├── AboutPage.tsx                # Giới thiệu về app
│   ├── PersonalizationPage.tsx      # Trang cá nhân hóa
│   ├── PersonalizedSetupPage.tsx    # Setup ban đầu (3 câu hỏi)
│   ├── ProgressPage.tsx             # Trang tiến trình (charts, AI insights)
│   └── RemindersPage.tsx            # Quản lý nhắc nhở
│
├── 📂 context/                      # React Context (global state)
│   ├── LanguageContext.tsx          # Quản lý ngôn ngữ (vi/en)
│   ├── ThemeContext.tsx             # Quản lý theme (light/dark)
│   ├── UserContext.tsx              # Quản lý thông tin user
│   ├── RoutineContext.tsx           # Quản lý routine & kế hoạch
│   └── VoiceControlContext.tsx      # Quản lý voice control
│
├── 📂 services/                     # Business Logic & API Calls
│   ├── aiService.ts                 # Google Gemini AI & Cloud TTS integration
│   │                                # - Chat với AI (cached)
│   │                                # - Google Cloud Text-to-Speech (TTS cache)
│   │                                # - Phân tích kết quả test
│   │
│   ├── chatbotService.ts            # Chatbot logic (conversation flow)
│   ├── storageService.ts            # LocalStorage helpers (save/load data)
│   ├── reminderService.ts           # Reminder system (notifications)
│   │
│   ├── snellenService.ts            # Snellen test logic
│   ├── colorBlindService.ts         # Color blind test logic
│   ├── astigmatismService.ts        # Astigmatism test logic
│   ├── amslerGridService.ts         # Amsler grid test logic
│   └── duochromeService.ts          # Duochrome test logic
│
├── 📂 hooks/                        # Custom React Hooks
│   ├── useSpeechRecognition.ts      # Speech-to-Text hook
│   ├── useTextToSpeech.ts           # Text-to-Speech hook
│   ├── useVoiceControl.ts           # Voice command hook
│   ├── useChatbotSpeech.ts          # Chatbot voice hook
│   └── usePdfExport.ts              # PDF export hook
│
├── 📂 utils/                        # Utility Functions
│   ├── performanceUtils.ts          # Performance optimization
│   │                                # - Debounce, throttle
│   │                                # - Cache management
│   │                                # - Lazy loading helpers
│   └── audioUtils.ts                # Audio helpers
│
├── 📂 i18n/                         # Internationalization
│   └── index.ts                     # Translations (Vietnamese & English)
│
├── 📂 dist/                         # Build output (generated)
└── 📂 node_modules/                 # Dependencies (generated)
```

---

## 🎯 LOGIC & LUỒNG HOẠT ĐỘNG

### 1. **Khởi động ứng dụng**
```
index.html (HTML entry)
    ↓
index.tsx (JavaScript entry)
    ↓
App.tsx (Main component)
    ↓
Providers (Language, Theme, User, Routine, VoiceControl)
    ↓
Router (React Router)
    ↓
WelcomePage (First screen)
```

### 2. **Luồng người dùng mới**
```
WelcomePage (Landing page)
    ↓ [Click "Bắt đầu"]
LoginPage (Nhập tên)
    ↓ [Submit]
PersonalizedSetupPage (3 câu hỏi)
    ↓ [AI tạo kế hoạch]
Home (Trang chủ với kế hoạch cá nhân hóa)
```

### 3. **Luồng làm bài test**
```
Home (Chọn test)
    ↓
Test Component (Snellen/ColorBlind/Astigmatism/Amsler/Duochrome)
    ↓ [Làm test]
AI Analysis (aiService.ts phân tích kết quả)
    ↓
Result Display (Hiển thị kết quả + đề xuất AI)
    ↓
Save to LocalStorage (storageService.ts)
    ↓
History (Xem lại trong lịch sử)
```

### 4. **Luồng AI Chatbot**
```
Click "Chat với AI"
    ↓
VisionCoach Component (Modal mở)
    ↓
User gõ/nói câu hỏi
    ↓
aiService.ts (Gửi đến Gemini AI)
    ↓
AI phản hồi (text)
    ↓
Text-to-Speech (Đọc lại bằng giọng nói)
    ↓
Cache (Lưu để lần sau nhanh hơn)
```

### 5. **Luồng Export PDF**
```
Click "Export PDF"
    ↓
usePdfExport Hook
    ↓
html2canvas (Chụp màn hình)
    ↓
jsPDF (Tạo file PDF)
    ↓
Download file
```

---

## 🧩 CHI TIẾT CÁC COMPONENT CHÍNH

### 📱 **App.tsx** - Main Application
**Chức năng:**
- Setup routing (React Router)
- Wrap app với Providers (Language, Theme, User, etc.)
- Lazy load tất cả pages/components
- Initialize performance optimizations

**Tech:**
- React.lazy() - Code splitting
- Suspense - Loading fallback
- HashRouter - Client-side routing

---

### 🏠 **pages/Home.tsx** - Trang chủ
**Chức năng:**
- Hiển thị danh sách 5 bài test
- Hiển thị kế hoạch hôm nay (AI-generated)
- Health Dashboard (stats, trends)
- Quick access to chatbot

**Features:**
- Personalized plan (dựa vào setup 3 câu hỏi)
- Gamification (badges, streaks)
- AI wellness score

---

### 🔬 **Test Components** (SnellenTest, ColorBlindTest, etc.)
**Chức năng:**
- Hiển thị bài test (chữ cái, màu sắc, hình ảnh)
- Thu thập kết quả từ user
- Gửi kết quả đến AI để phân tích
- Hiển thị report với đề xuất

**Logic:**
1. User làm test (click/select)
2. Component ghi lại kết quả
3. Gọi `aiService.analyzeTestResults()`
4. AI trả về phân tích chi tiết
5. Hiển thị + lưu vào LocalStorage

---

### 🤖 **VisionCoach.tsx** - AI Chatbot
**Chức năng:**
- Chat 2 chiều với AI (text + voice)
- AI đóng vai "Bác sĩ Eva" - chuyên khoa nhãn khoa
- Text-to-Speech (đọc phản hồi AI)
- Speech-to-Text (nghe câu hỏi user)

**Tech Stack:**
- Google Gemini AI (chat)
- Web Speech API (speech recognition & synthesis)
- Cache system (instant repeat responses)

**Flow:**
```
User: "Mắt tôi có bình thường không?"
    ↓
aiService.chatWithAI(message, history)
    ↓
Gemini AI: "Dựa vào kết quả test, thị lực của bạn..."
    ↓
TTS: Đọc lại bằng giọng nói
```

---

### 🧠 **services/aiService.ts** - AI Service
**Chức năng chính:**

#### 1. **Chat với AI**
```typescript
chatWithAI(message: string, chatHistory: Message[])
```
- Gửi tin nhắn đến Gemini AI
- Kèm context (lịch sử chat, kết quả test)
- Cache response (lần sau instant)

#### 2. **Phân tích kết quả test**
```typescript
analyzeTestResults(testResults: TestResult[])
```
- Phân tích toàn bộ kết quả test
- Đưa ra đề xuất (bài tập, khám bác sĩ, etc.)
- Tính wellness score

#### 3. **Text-to-Speech (Google Cloud TTS)**
```typescript
generateSpeech(text: string, language: 'vi' | 'en')
```
- Sử dụng Google Cloud Text-to-Speech API
- Voice chất lượng cao (Wavenet)
- Cache audio (60 phút)
- LRU eviction (xóa cache cũ khi đầy)

#### 4. **Tạo kế hoạch cá nhân hóa**
```typescript
generatePersonalizedPlan(userAnswers)
```
- Dựa vào 3 câu hỏi setup
- AI tạo lộ trình 7 ngày
- Gợi ý test & bài tập phù hợp

**Config:**
- AI Model: `gemini-2.0-flash` (stable & production-ready)
- TTS: Google Cloud Text-to-Speech API (Wavenet voices)
- Temperature: 0.15 (consistent responses)
- Max tokens: 3000
- Language: Vietnamese priority

---

### 💾 **services/storageService.ts** - Storage Service
**Chức năng:**
- Save/load data từ LocalStorage
- Manage test history
- User preferences
- Cache management

**Key Functions:**
```typescript
saveTestResult(result: TestResult)     // Lưu kết quả test
getTestHistory()                        // Lấy lịch sử
saveUserData(userData: UserData)        // Lưu thông tin user
getUserData()                           // Lấy thông tin user
```

---

### 🔔 **services/reminderService.ts** - Reminder Service
**Chức năng:**
- Tạo reminder (nhắc làm test, nhắc bài tập)
- Push notification
- Schedule recurring reminders
- Check browser notification permission

---

### 🌐 **context/LanguageContext.tsx** - Language Context
**Chức năng:**
- Quản lý ngôn ngữ hiện tại (vi/en)
- Hàm `t(key)` để translate
- Lưu preference vào LocalStorage

**Usage:**
```typescript
const { language, setLanguage, t } = useLanguage();
<h1>{t('welcome_title')}</h1>
```

---

### 🎨 **context/ThemeContext.tsx** - Theme Context
**Chức năng:**
- Quản lý theme (light/dark)
- Toggle dark mode
- Persist vào LocalStorage

---

### 📊 **i18n/index.ts** - Translations
**Chức năng:**
- Chứa tất cả text tiếng Việt & tiếng Anh
- Organized by feature
- Easy to add new languages

**Structure:**
```typescript
export const translations = {
  vi: {
    welcome_title: "Chăm sóc đôi mắt của bạn...",
    welcome_slogan: "Chăm sóc hôm nay, cho tầm nhìn ngày mai.",
    // ... 300+ keys
  },
  en: {
    welcome_title: "Take care of your eyes...",
    welcome_slogan: "Care today, vision tomorrow.",
    // ... 300+ keys
  }
}
```

---

## ⚡ TỐI ƯU HÓA HIỆU SUẤT

### 1. **Code Splitting & Lazy Loading**
- Tất cả pages/components được lazy load
- Initial bundle: 2MB → 800KB (-60%)
- Load time: 5s → <2s (-70%)

### 2. **AI Caching**
- Chat responses cached (instant repeat)
- TTS audio cached (30 min)
- LRU eviction (tự động xóa cache cũ)

### 3. **Service Worker & PWA**
- Cache-first strategy
- Offline support
- Install as native app

### 4. **Build Optimization**
- Terser minification
- Tree shaking
- Dead code elimination
- Vendor chunks separation

---

## 📦 CÁC THƯ VIỆN QUAN TRỌNG

### 1. **@google/genai** - Google Gemini AI
```typescript
import { GoogleGenerativeAI } from '@google/genai';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
```

### 2. **react-router-dom** - Routing
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/test/snellen" element={<SnellenTest />} />
</Routes>
```

### 3. **lucide-react** - Icons
```typescript
import { Eye, Mic, Volume2 } from 'lucide-react';
<Eye size={24} />
```

### 4. **jspdf + html2canvas** - PDF Export
```typescript
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const canvas = await html2canvas(element);
const pdf = new jsPDF();
pdf.addImage(canvas, 'PNG', 0, 0);
pdf.save('report.pdf');
```

---

## 🚀 CÁCH CHẠY DỰ ÁN

### 1. **Cài đặt dependencies**
```bash
npm install
```

### 2. **Setup API Key**
Tạo file `.env.local`:
```
GEMINI_API_KEY=your_api_key_here
```

### 3. **Chạy dev server**
```bash
npm run dev
```
→ Mở http://localhost:3000

### 4. **Build production**
```bash
npm run build
```
→ Output trong `dist/`

### 5. **Preview production build**
```bash
npm run preview
```

---

## 🎯 FEATURES CHÍNH

### ✅ 5 Bài Test Thị Lực
1. **Snellen Test** - Thị lực cơ bản (20/20, 20/40, etc.)
2. **Color Blind Test** - Test mù màu (Ishihara plates)
3. **Astigmatism Test** - Test loạn thị (bánh xe)
4. **Amsler Grid Test** - Test võng mạc (lưới)
5. **Duochrome Test** - Test màu đỏ-xanh

### 🤖 AI Features
- **AI Chatbot** (2-way voice conversation)
- **AI Analysis** (phân tích kết quả)
- **AI Recommendations** (đề xuất bài tập, khám bác sĩ)
- **AI Wellness Score** (tính điểm sức khỏe)
- **AI Personalization** (kế hoạch 7 ngày)

### 📊 Tracking & Analytics
- **Test History** (lịch sử test)
- **Progress Charts** (biểu đồ tiến trình)
- **Trends** (xu hướng cải thiện/xấu đi)
- **Badges & Streaks** (gamification)

### 🔔 Reminders & Notifications
- **Smart Reminders** (nhắc làm test)
- **Push Notifications** (browser notifications)
- **Recurring Schedule** (lặp lại hàng tuần)

### 🏥 Hospital Locator
- **GPS-based** (tìm bệnh viện gần nhất)
- **Google Maps integration**
- **Distance & rating display**

### 🎙️ Voice Features
- **Voice Commands** (điều khiển bằng giọng nói)
- **Text-to-Speech** (AI đọc kết quả)
- **Speech-to-Text** (hỏi AI bằng giọng nói)

### 📄 Export & Share
- **PDF Export** (xuất báo cáo PDF)
- **Share Report** (chia sẻ kết quả)
- **Print Report** (in báo cáo)

### 🌐 Multi-language
- **Vietnamese** (primary)
- **English** (secondary)
- Easy to add more languages

### 🎨 Themes
- **Light Mode**
- **Dark Mode**
- Auto-save preference

---

## 🔐 BẢO MẬT & PRIVACY

- ✅ **No server** - Tất cả data lưu local (LocalStorage)
- ✅ **No account required** - Chỉ cần nhập tên
- ✅ **No tracking** - Không thu thập dữ liệu cá nhân
- ✅ **HTTPS required** - Cho speech recognition & geolocation
- ✅ **API key** - Được lưu trong .env.local (not committed)

---

## 📚 TÀI LIỆU THAM KHẢO

### API Documentation
- [Google Gemini AI](https://ai.google.dev/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [React Router](https://reactrouter.com/)
- [Vite](https://vitejs.dev/)

### Medical References
- [Snellen Chart](https://en.wikipedia.org/wiki/Snellen_chart)
- [Ishihara Test](https://en.wikipedia.org/wiki/Ishihara_test)
- [Amsler Grid](https://en.wikipedia.org/wiki/Amsler_grid)
- [Astigmatism](https://www.aoa.org/healthy-eyes/eye-and-vision-conditions/astigmatism)

---

## 🤝 ĐÓNG GÓP

Dự án này là open-source. Mọi đóng góp đều được chào đón!

### Bug Reports
- Mở issue trên GitHub
- Mô tả chi tiết lỗi
- Kèm screenshot nếu có

### Feature Requests
- Mở issue với tag `enhancement`
- Giải thích tính năng mong muốn
- Use case cụ thể

---

## 📞 LIÊN HỆ

- **Email**: support@suckhoeai.com
- **GitHub**: https://github.com/yourusername/ai-vision-test
- **Website**: https://suckhoeai.com

---

## 📝 LICENSE

MIT License - Free to use & modify

---

**Cập nhật lần cuối**: November 1, 2025
**Version**: 1.0.0
**Tác giả**: Sức Khỏe AI Team
