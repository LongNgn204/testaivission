# SỨC KHỎE AI – NỀN TẢNG KIỂM TRA THỊ LỰC VÀ TƯ VẤN AI

Báo cáo kỹ thuật & Ghi chú bảo vệ đồ án (phiên bản đầy đủ)

---

## 1. Tóm tắt (Abstract)
Sức Khỏe AI là ứng dụng web hỗ trợ kiểm tra thị lực tại nhà thông qua 5 bài test tiêu chuẩn (Snellen, Ishihara, Astigmatism, Amsler, Duochrome) và phân tích kết quả bằng AI (Google Gemini). Ứng dụng cung cấp báo cáo lâm sàng có cấu trúc (severity, trend, causes, recommendations), Dashboard theo dõi sức khỏe mắt, nhắc nhở thông minh, huy hiệu động lực, tìm bệnh viện gần nhất và trợ lý bác sĩ ảo (giọng nói + chat). Hệ thống tối ưu hiệu năng với lazy routes, dynamic import vendor nặng (pdf-vendor, ai-vendor), caching và hỗ trợ prefers-reduced-motion.

---

## 2. Bài toán & Mục tiêu
- Vấn đề: Kiểm tra mắt định kỳ khó tiếp cận; người dùng thiếu hướng dẫn/giải thích sau khi test; dữ liệu phân tán.
- Mục tiêu:
  - Cung cấp trải nghiệm kiểm tra mắt chuẩn y khoa tại nhà, dùng được trên thiết bị phổ thông.
  - Sinh báo cáo lâm sàng giàu thông tin, có cấu trúc, dễ hiểu; đưa ra lời khuyên hành động.
  - Tích hợp nhắc nhở, lịch sử, dashboard, và tìm bệnh viện để hoàn thiện hành trình người dùng.
  - Mở rộng dễ dàng: thêm bài test mới theo khuôn mẫu TestShell và schemas chung.

---

## 3. Kiến trúc & Công nghệ
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS (Dark mode, Responsive)
- State/Context: LanguageContext, ThemeContext, RoutineContext, VoiceControlContext
- Services:
  - aiService: tầng tích hợp Google Gemini (report, insights, chat, TTS)
  - <test>Service: logic từng bài test (thang điểm, điều kiện dừng)
  - storageService: lưu lịch sử per-user (theo số điện thoại) trong localStorage
  - reminderService: nhắc nhở, streak, badges, points
- UI Modules:
  - TestShell: vỏ UI/UX chuẩn cho mọi bài test (Title/Desc/Time/Safety/Instructions/Content/Exit)
  - DashboardContent: Vision Wellness Dashboard (score, rating, trend, insights)
  - VisionCoach: Coach giọng nói/chat (lazy-load)
- Tối ưu & tiện ích:
  - useDashboardInsights: cache 5’ theo fingerprint, fallback nếu AI bận
  - usePdfExport: dynamic import jspdf + html2canvas
  - performanceUtils: tối ưu runtime

---

## 4. Cây thư mục dự án (rút gọn có chọn lọc)
```
assets/
components/
  ui/
    GlassCard.tsx
    PageShell.tsx
  vision-coach/
    ChatInterface.tsx
    VoiceInterface.tsx
  AmslerGrid.tsx
  AmslerGridTest.tsx
  AstigmatismTest.tsx
  AstigmatismWheel.tsx
  ColorBlindTest.tsx
  DashboardContent.tsx
  DuochromeTest.tsx
  Header.tsx
  HospitalLocator.tsx
  InteractiveExerciseModal.tsx
  ProtectedRoute.tsx
  ReportDetailModal.tsx
  ReportDisplayContent.tsx
  SnellenTest.tsx
  TestInstructionsPlayer.tsx
  TestShell.tsx
  UserInfo.tsx
  VisionCoach.tsx
  VoiceControlButton.tsx
context/
  LanguageContext.tsx
  RoutineContext.tsx
  ThemeContext.tsx
  UserContext.tsx
  VoiceControlContext.tsx
hooks/
  useDashboardInsights.ts
  usePdfExport.ts
  useSpeechRecognition.ts
pages/
  AboutPage.tsx
  History.tsx
  Home.tsx
  LoginPage.tsx
  PersonalizedSetupPage.tsx
  ProgressPage.tsx
  RemindersPage.tsx
  WelcomePage.tsx
services/
  aiService.ts
  amslerGridService.ts
  astigmatismService.ts
  colorBlindService.ts
  duochromeService.ts
  reminderService.ts
  snellenService.ts
  storageService.ts
utils/
  audioUtils.ts
  performanceUtils.ts
App.tsx, index.tsx, i18n/, types.ts, tailwind config, vite config, sw.js…
```

---

## 5. Thiết kế bài test, thang điểm & dữ liệu (raw/metadata)
### 5.1 Snellen (Thị lực xa)
- Cấp độ: 20/100 → 20/60 → 20/40 → 20/30 → 20/20
- Trials/PassThreshold per-level; 20/20 yêu cầu 4/5 đúng.
- Điều kiện dừng: all_passed | max_extra_attempts
- Lưu:
  - rawAnswers: { level, size(px), rotation(0/90/180/270), correct }
  - stopCondition, levelAchieved, deviceInfo, duration, date

### 5.2 Ishihara / Color Blind (12 plate)
- Accuracy và severity:
  - >=90% NONE; 75–89% LOW; 50–74% MEDIUM; <50% HIGH
- Lưu:
  - rawAnswers: { plate, userAnswer, correct }
  - missedPlates: { plate, correctAnswer, userAnswer }
  - deviceInfo, duration, date

### 5.3 Astigmatism (Loạn thị)
- Theo từng mắt: none, vertical, horizontal, oblique
- Severity: oblique cả hai mắt → HIGH; một mắt oblique → MEDIUM; một mắt simple → LOW; không có → NONE
- Lưu: overallSeverity, per-eye type, deviceInfo, duration, date

### 5.4 Amsler Grid (Hoàng điểm/Võng mạc)
- distortedQuadrants (top/bottom-left/right), symptoms (wavy/blurry/missing/distorted)
- Severity: tổng trọng số vùng + triệu chứng; trung tâm ảnh hưởng → ưu tiên HIGH
- Lưu: distortedQuadrants, symptoms, deviceInfo, duration, date

### 5.5 Duochrome (Hiệu chỉnh kính)
- Per-eye: red→myopic, green→hyperopic, equal→normal
- Severity: mixed hai mắt → HIGH; cả hai giống nhau bất thường → MEDIUM; một mắt bất thường → LOW
- Lưu: rawSelections per-eye { eye, choice }, overallResult, deviceInfo, duration, date

---

## 6. AI Prompts & JSON Schemas
- Report JSON (song ngữ): confidence, summary, trend, causes, recommendations, severity, prediction (ràng buộc bắt buộc)
- Dashboard insights JSON: score, rating (EXCELLENT/GOOD/AVERAGE/NEEDS_ATTENTION), trend (IMPROVING/STABLE/DECLINING/INSUFFICIENT_DATA), positives, areasToMonitor, proTip
- Persona “Bác sĩ Eva”: y khoa, đồng cảm, tránh sáo rỗng, khuyến nghị có lý do (tại sao + cách làm)
- Fallback: khi thiếu API key/AI bận → sinh báo cáo an toàn dựa raw/metadata

---

## 7. Tối ưu hiệu năng & trải nghiệm
- Lazy routes (React Suspense)
- TestShell: tái sử dụng UI; giảm trùng lặp
- Dynamic import:
  - pdf-vendor (jspdf, html2canvas) chỉ tải khi export/share PDF
  - ai-vendor (Google Gemini) dynamic import ở hook dashboard & chat, Coach lazy-route
- Cache dashboard 5 phút theo fingerprint (history + language)
- prefers-reduced-motion: giảm animation ở Welcome/Login cho nhóm nhạy cảm chuyển động

---

## 8. Bảo mật & quyền riêng tư
- Lịch sử test lưu localStorage theo user (sđt) – không gửi server
- Quyền: Microphone (Coach), Notifications (Reminders), Geolocation (Hospitals)
- Fallback khi từ chối quyền; UX giải thích & hướng dẫn bật lại

---

## 9. Kiểm thử
- Chức năng:
  - Form login validation, guard login, ProtectedRoute
  - 5 bài test hoạt động (start/testing/finish), lưu raw+report đúng schema
  - Dashboard insights: cache & fallback
  - Export/Share PDF
  - Reminders/Badges/Streak/Exercises
  - Hospitals: geo-permission, filters, sort, empty state
  - Voice Coach: hiển thị khi có API key
- Build production: `vite build` OK

---

## 10. Triển khai
- Development: `npm run dev`
- Production: `npm run build` → `/dist` deploy lên Vercel/Netlify/Nginx
- ENV (bật AI): `.env`
```
VITE_GEMINI_API_KEY=your_api_key_here
```

---

## 11. Hướng dẫn vận hành & bảo trì
- Thêm bài test mới: tạo <NewTest>Service (thang điểm, dừng), <NewTest>.tsx (bọc TestShell), cập nhật routes & i18n; mở rộng types.ts nếu cần metadata
- Điều chỉnh thang điểm: cập nhật logic service tương ứng
- Tinh chỉnh AI output: cập nhật createPrompt() trong aiService cho test tương ứng
- Giảm bundle hơn nữa:
  - Bóc aiService thành nhiều service nhỏ (report/tts/chat/insights) và dynamic import theo nhu cầu

---

## 12. Giới hạn & hướng phát triển
- Giới hạn: Hoạt động offline hạn chế (AI cần mạng); độ chính xác phụ thuộc tuân thủ hướng dẫn khi test; AI chỉ mang tính tham khảo, không thay thế chẩn đoán lâm sàng
- Hướng phát triển:
  - PWA đầy đủ (offline caching kết quả, deferred reports)
  - Tài khoản cloud sync + backup
  - Test bổ sung (Contrast Sensitivity, Visual Field – bản đơn giản)

---

## 13. Phụ lục
### 13.1 ENV, quyền, i18n
- ENV: VITE_GEMINI_API_KEY
- Quyền: Microphone/Notification/Geolocation
- i18n: vi/en (translations trong i18n/)

### 13.2 Lệnh
```
npm install
npm run dev
npm run build
npm run preview
```

### 13.3 Team & vai trò (tham khảo)
- FE/Arch/AI Integration/QA/Docs: (điền tên)

---

© 2025 Sức Khỏe AI – Vision Health with AI
