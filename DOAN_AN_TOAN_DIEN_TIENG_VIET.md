# ĐỒ ÁN TOÀN DIỆN - SỨC KHỎE AI

## 🎯 GIỚI THIỆU DỰ ÁN

**Tên dự án:** Sức Khỏe AI - Nền tảng kiểm tra thị lực hỗ trợ bởi AI  
**Phiên bản:** 0.0.0  
**Mục đích:** Cung cấp ứng dụng web toàn diện để kiểm tra thị lực với phân tích AI, hỗ trợ giọng nói, và theo dõi tiến độ cá nhân hóa  
**Link demo:** https://testaivision.pages.dev/

---

## [object Object]ỔNG QUAN TÍNH NĂNG

### 1️⃣ **5 BÀI KIỂM TRA THỊ LỰC TIÊU CHUẨN**

#### 🔹 **Snellen Test** (Kiểm tra độ sắc nét thị lực)
- **Mục đích:** Đo độ sắc nét thị lực theo tiêu chuẩn 20/20
- **Cách hoạt động:** 
  - Hiển thị các chữ cái với kích thước giảm dần
  - Người dùng đọc từ xa (khoảng 60cm)
  - Hệ thống ghi nhận số chữ cái đúng
- **Kết quả:** Điểm từ 20/20 đến 20/200
- **File:** `components/SnellenTest.tsx`, `services/snellenService.ts`

#### [object Object] Blindness Test** (Kiểm tra mù màu)
- **Mục đích:** Phát hiện mù màu đỏ-xanh (Ishihara plates)
- **Cách hoạt động:**
  - Hiển thị các bảng Ishihara (chứa số/hình trong chấm màu)
  - Người dùng nhập số họ nhìn thấy
  - So sánh với đáp án chuẩn
- **Kết quả:** Bình thường / Mù màu đỏ-xanh / Mù màu toàn bộ
- **File:** `components/ColorBlindTest.tsx`, `services/colorBlindService.ts`

#### 🔹 **Astigmatism Test** (Kiểm tra loạn thị)
- **Mục đích:** Phát hiện loạn thị (sai khúc xạ)
- **Cách hoạt động:**
  - Hiển thị bánh xe Astigmatism (các đường thẳng ở góc khác nhau)
  - Người dùng chọn hướng nào mờ nhất
  - Hệ thống phân tích mức độ loạn thị
- **Kết quả:** Không loạn thị / Loạn thị nhẹ / Loạn thị vừa / Loạn thị nặng
- **File:** `components/AstigmatismTest.tsx`, `services/astigmatismService.ts`

#### 🔹 **Amsler Grid Test** (Kiểm tra thoái hóa điểm vàng)
- **Mục đích:** Phát hiện thoái hóa điểm vàng sớm
- **Cách hoạt động:**
  - Hiển thị lưới ô vuông đều đặn
  - Người dùng nhìn vào điểm giữa
  - Đánh dấu các ô bị cong/mờ
  - Tạo heatmap để theo dõi
- **Kết quả:** Bình thường / Có dấu hiệu thoái hóa
- **File:** `components/AmslerGridTest.tsx`, `services/amslerGridService.ts`

####[object Object]ochrome Test** (Kiểm tra cân bằng đỏ-xanh)
- **Mục đích:** Kiểm tra cân bằng tiêu cự giữa ánh sáng đỏ và xanh
- **Cách hoạt động:**
  - Hiển thị 2 nửa màn hình: đỏ và xanh
  - Người dùng chọn bên nào chữ rõ hơn
  - Hệ thống điều chỉnh độ rõ
- **Kết quả:** Cân bằng / Thiên về đỏ / Thiên về xanh
- **File:** `components/DuochromeTest.tsx`, `services/duochromeService.ts`

---

### 2️⃣ **AI & GIỌNG NÓI**

#### [object Object] - Trợ lý AI 2 chiều**
- **Tính năng:**
  - 💬 Chat văn bản: Nhập câu hỏi, nhận câu trả lời AI
  - 🎤 Nhận diện giọng nói: Nói câu hỏi, hệ thống chuyển thành văn bản
  - 🔊 Phát âm: AI đọc câu trả lời bằng giọng nói
  - [object Object]ỗ trợ 2 ngôn ngữ: Tiếng Việt + Tiếng Anh
- **Công nghệ:**
  - Google Gemini 2.0 Flash (AI chat)
  - Web Speech API (nhận diện giọng nói)
  - Google Cloud Text-to-Speech (phát âm)
- **File:** `components/VisionCoach.tsx`, `services/aiService.ts`

#### 📊 **Smart Dashboard - Bảng điều khiển thông minh**
- **Tính năng:**
  - 📈 Biểu đồ xu hướng: Theo dõi điểm Snellen theo thời gian
  - 📊 Phân bố bài test: Xem bạn đã làm bài test nào nhiều nhất
  - 🔥 Heatmap Amsler: Hiển thị vị trí bị ảnh hưởng
  - [object Object]ời khuyên AI: Eva phân tích kết quả và đưa ra khuyến nghị
- **File:** `components/DashboardContent.tsx`, `hooks/useDashboardInsights.ts`

#### 📄 **Báo cáo tự động**
- **Tính năng:**
  - 🎯 Phân tích toàn diện: Tóm tắt tất cả kết quả test
  - ⭐ Xếp hạng điểm: Tốt / Bình thường / Cần chú ý
  - 💪 Điểm mạnh: Các lĩnh vực thị lực tốt
  - ⚠️ Cần theo dõi: Các lĩnh vực cần chú ý
  - 🎓 Lệnh chuyên nghiệp: Gợi ý từ AI
- **File:** `components/ReportDisplayContent.tsx`, `hooks/usePdfExport.ts`

#### 🎙️ **Hướng dẫn bài test bằng giọng nói**
- **Tính năng:**
  - 📢 Hướng dẫn từng bước bằng giọng nói
  - ⏸️ Tạm dừng/Tiếp tục
  - 🔄 Phát lại hướng dẫn
  - 🌐 Hỗ trợ Tiếng Việt + Tiếng Anh
- **File:** `components/TestInstructionsPlayer.tsx`

---

### 3️⃣ **THEO DÕI TIẾN ĐỘ**

#### 📈 **Biểu đồ trực quan**
- **Snellen Trend Chart:** Đường biểu đồ thể hiện xu hướng độ sắc nét theo thời gian
- **Test Distribution:** Biểu đồ cột hiển thị số lần làm mỗi bài test
- **Amsler Heatmap:** Bản đồ nhiệt hiển thị vị trí bị ảnh hưởng trên lưới Amsler
- **File:** `pages/ProgressPage.tsx`, `hooks/useDashboardInsights.ts`

#### 📋 **Lịch sử bài test**
- **Tính năng:**
  - 📝 Xem tất cả bài test đã làm (sắp xếp theo ngày)
  - 🔍 Chi tiết từng bài test
  - 📊 Thống kê tổng hợp
  - 🗑️ Xóa bài test (nếu cần)
- **File:** `pages/History.tsx`

#### 💾 **Xuất báo cáo PDF**
- **Tính năng:**
  - 📄 Xuất báo cáo chuyên nghiệp dạng PDF
  - 📊 Bao gồm biểu đồ, kết quả, và khuyến nghị
  - 🖼️ Chất lượng cao, sẵn sàng in
- **File:** `hooks/usePdfExport.ts`

---

### 4️⃣ **GAMIFICATION - TRÒ CHƠI HÓA**

#### [object Object] Huy hiệu thành tích**
1. **Người khởi đầu:** Hoàn thành bài test đầu tiên
2. **Nhà khoa học:** Hoàn thành 5 bài test
3. **Chuyên gia:** Hoàn thành 20 bài test
4. **Người kiên trì:** Duy trì streak 7 ngày
5. **Nhà vô địch:** Duy trì streak 30 ngày
6. **Người tập luyện:** Hoàn thành 10 bài tập mắt
7. **Người chăm sóc:** Hoàn thành tất cả các bài tập

#### [object Object] Tracking - Theo dõi chuỗi ngày**
- **Tính năng:**
  - 📅 Đếm số ngày liên tiếp làm bài test
  - 🎁 Thưởng điểm khi duy trì streak
  - [object Object] hiện tại và cao nhất
- **File:** `services/reminderService.ts`

#### ⭐ **Hệ thống điểm**
- **Cách kiếm điểm:**
  - ✅ Hoàn thành bài test: +10 điểm
  - 🏃 Hoàn thành bài tập mắt: +5 điểm
  - 🔥 Duy trì streak: +2 điểm/ngày
  - [object Object]ở huy hiệu: +50 điểm
- **File:** `services/reminderService.ts`

#### 👀 **5 Bài tập mắt**
1. **20-20-20 Rule:** Mỗi 20 phút, nhìn vào vật cách 20 feet trong 20 giây
2. **Palming:** Che mắt bằng lòng bàn tay, thư giãn
3. **Figure 8:** Di chuyển mắt theo hình số 8
4. **Near-Far Focus:** Lần lượt nhìn gần rồi nhìn xa
5. **Blinking:** Nhắm mắt từ từ 10 lần
- **File:** `pages/RemindersPage.tsx`

---

### 5️⃣ **ĐỊNH VỊ BỆNH VIỆN**

#### 🏥 **Tìm kiếm bệnh viện gần nhất**
- **Tính năng:**
  - [object Object]ử dụng GPS để tìm vị trí hiện tại
  - 🗺️ Hiển thị bệnh viện mắt gần nhất trên bản đồ
  - [object Object]ọc theo chuyên khoa, dịch vụ khẩn cấp, xếp hạng
  - 📞 Xem thông tin liên hệ
  - 🚗 Chỉ đường bằng Google Maps
- **File:** `components/HospitalLocator.tsx`

---

### 6️⃣ **NHẮC NHỞ THÔNG MINH**

#### 🔔 **Thông báo tùy chỉnh**
- **Tính năng:**
  - ⏰ Đặt nhắc nhở làm bài test
  - 💪 Đặt nhắc nhở tập luyện mắt
  - 📅 Chọn tần suất: Hàng ngày / Hàng tuần / 2 tuần / Hàng tháng
  - 🔔 Nhận thông báo trên trình duyệt
  - ✏️ Chỉnh sửa/Xóa nhắc nhở
- **File:** `pages/RemindersPage.tsx`, `services/reminderService.ts`

---

### 7️⃣ **TRẢI NGHIỆM NGƯỜI DÙNG**

#### 🌓 **Chế độ tối**
- **Tính năng:**
  - 🌙 Tự động theo hệ thống / Sáng / Tối
  - 👁️ Giảm mệt mắt vào ban đêm
  - 💾 Lưu tùy chọn
- **File:** `context/ThemeContext.tsx`

#### 🌐 **Đa ngôn ngữ**
- **Hỗ trợ:** Tiếng Việt + Tiếng Anh
- **Tính năng:**
  - 🔄 Chuyển ngôn ngữ ngay lập tức
  - 💾 Lưu tùy chọn
  - 🎤 Giọng nói theo ngôn ngữ
- **File:** `context/LanguageContext.tsx`, `i18n/index.ts`

#### [object Object] Design**
- **Tính năng:**
  - 📱 Tối ưu cho điện thoại di động
  - 💻 Hoạt động tốt trên máy tính
  - 🖥️ Hỗ trợ màn hình lớn
- **Công nghệ:** Tailwind CSS

#### ✨ **Hoạt ảnh mượt mà**
- **Tính năng:**
  - 🎬 Chuyển đổi trang mượt mà
  - 🎨 Hiệu ứng hover đẹp
  - 📊 Biểu đồ có hoạt ảnh
- **Công nghệ:** Tailwind CSS + CSS animations

---

## 🏗️ CẤU TRÚC DỰ ÁN

```
d-git-test/
├── components/              # Các component React
│   ├── vision-coach/        # Chatbot AI Eva
│   ├── ui/                  # Component UI tái sử dụng
│   ├── SnellenTest.tsx      # Bài test Snellen
│   ├── ColorBlindTest.tsx   # Bài test mù màu
│   ├── AstigmatismTest.tsx  # Bài test loạn thị
│   ├── AmslerGridTest.tsx   # Bài test Amsler
│   ├── DuochromeTest.tsx    # Bài test đỏ-xanh
│   ├── VisionCoach.tsx      # Chatbot AI chính
│   ├── HospitalLocator.tsx  # Tìm kiếm bệnh viện
│   ├── Header.tsx           # Thanh điều hướng
│   └── ...
│
├── pages/                   # Các trang chính
│   ├── Home.tsx             # Trang chủ / Dashboard
│   ├── History.tsx          # Lịch sử bài test
│   ├── ProgressPage.tsx     # Trang tiến độ (biểu đồ)
│   ├── RemindersPage.tsx    # Trang nhắc nhở + gamification
│   ├── AuthPage.tsx         # Trang xác thực
│   ├── WelcomePage.tsx      # Trang chào mừng
│   └── ...
│
├── services/                # Logic kinh doanh
│   ├── aiService.ts         # Tích hợp Google Gemini
│   ├── authService.ts       # Xác thực người dùng
│   ├── reminderService.ts   # Nhắc nhở + gamification
│   ├── snellenService.ts    # Logic bài test Snellen
│   └── ...
│
├── context/                 # State management
│   ├── ThemeContext.tsx     # Quản lý chế độ sáng/tối
│   ├── LanguageContext.tsx  # Quản lý ngôn ngữ
│   ├── UserContext.tsx      # Quản lý thông tin người dùng
│   └── ...
│
├── hooks/                   # Custom React hooks
│   ├── useDashboardInsights.ts
│   ├── usePdfExport.ts
│   └── ...
│
├── i18n/                    # Quốc tế hóa
│   └── index.ts             # Dịch và hàm dịch
│
├── utils/                   # Hàm tiện ích
│   ├── audioUtils.ts
│   └── performanceUtils.ts
│
├── assets/                  # Hình ảnh, logo
│   ├── logo.png
│   └── landing-bg.png
│
├── worker/                  # Cloudflare Workers (backend)
│   ├── src/
│   │   ├── handlers/        # Xử lý request
│   │   ├── middleware/      # Middleware
│   │   └── ...
│   └── wrangler.toml        # Cấu hình
│
├── App.tsx                  # Component chính
├── index.tsx                # Entry point
├── vite.config.ts           # Cấu hình Vite
├── tsconfig.json            # Cấu hình TypeScript
├── tailwind.config.js       # Cấu hình Tailwind
└── package.json             # Dependencies
```

---

## 🔐 LUỒNG XÁC THỰC

### Quy trình đăng nhập:

```
1. Người dùng truy cập ứng dụng
   ↓
2. Kiểm tra localStorage có user_data không?
   ├─ Có → Kiểm tra token
   │  ├─ Token hợp lệ → Đi tới Home
   │  └─ Token không hợp lệ → Xóa dữ liệu, quay về WelcomePage
   └─ Không → Hiển thị WelcomePage
   ↓
3. Người dùng nhấn "Bắt đầu" → Chuyển tới AuthPage
   ↓
4. Đăng nhập (email/password)
   ├─ Thành công → Lưu user_data + token
   │  ↓ Chuyển tới PersonalizedSetupPage
   └─ Thất bại → Hiển thị lỗi
   ↓
5. Cài đặt cá nhân (chọn lịch trình, trả lời câu hỏi)
   ↓
6. Chuyển tới Home (MainAppLayout)
   ↓
7. Người dùng có thể:
   - Làm bài test
   - Xem lịch sử
   - Xem tiến độ
   - Đặt nhắc nhở
   - Chat với Eva
   - Tìm bệnh viện
```

---

## 💾 LƯU TRỮ DỮ LIỆU

### LocalStorage (Dữ liệu cục bộ):

```javascript
// Thông tin người dùng
localStorage.user_data = {
  id: "user_123",
  email: "user@example.com",
  name: "Nguyễn Văn A",
  createdAt: "2024-01-01"
}

// Token xác thực
localStorage.auth_token = "eyJhbGc..."

// Lịch sử bài test
localStorage.test_history = [
  {
    id: "test_1",
    type: "snellen",
    score: "20/20",
    date: "2024-01-15",
    details: {...}
  }
]

// Cài đặt cá nhân
localStorage.routine_setup = {
  routine: "morning",
  answers: {...}
}

// Nhắc nhở
localStorage.reminders = [
  {
    id: "reminder_1",
    type: "test",
    frequency: "daily",
    time: "09:00",
    enabled: true
  }
]

// Điểm và huy hiệu
localStorage.gamification = {
  points: 150,
  streak: 7,
  badges: ["beginner", "scientist"],
  exercises_completed: 5
}

// Cài đặt người dùng
localStorage.user_settings = {
  theme: "dark",
  language: "vi",
  notifications_enabled: true
}
```

---

## 🚀 CÔNG NGHỆ SỬ DỤNG

### Frontend:
- **React 19.2** - Framework UI
- **TypeScript 5.8** - Ngôn ngữ lập trình
- **Vite 6.4** - Build tool
- **Tailwind CSS 3.x** - CSS framework
- **React Router 6.23** - Định tuyến
- **Lucide React** - Icon library

### AI & Voice:
- **Google Gemini 2.0 Flash** - AI chat
- **Web Speech API** - Nhận diện giọng nói
- **Google Cloud Text-to-Speech** - Phát âm

### Storage & APIs:
- **LocalStorage** - Lưu dữ liệu cục bộ
- **Geolocation API** - GPS
- **Notification API** - Thông báo
- **Canvas API** - Vẽ bài test

### Export:
- **jsPDF** - Tạo file PDF
- **html2canvas** - Chụp ảnh HTML

### Backend:
- **Cloudflare Workers** - Serverless
- **TypeScript** - Ngôn ngữ backend
- **Wrangler** - CLI

---

## 📱 HƯỚNG DẪN SỬ DỤNG

### 1️⃣ **Làm bài test đầu tiên**

**Bước 1:** Truy cập trang chủ
- Nhấn "Bắt đầu kiểm tra"

**Bước 2:** Đăng nhập
- Nhập email và mật khẩu

**Bước 3:** Cài đặt cá nhân
- Chọn lịch trình (Sáng/Chiều/Tối)
- Trả lời các câu hỏi về sức khỏe mắt

**Bước 4:** Chọn bài test
- Nhấn "Bắt đầu kiểm tra"
- Chọn bài test (Snellen được khuyến nghị)

**Bước 5:** Làm bài test
- Đọc hướng dẫn (có thể nghe bằng giọng nói)
- Làm theo hướng dẫn
- Xem kết quả ngay lập tức

**Bước 6:** Xem phân tích AI
- Xem kết quả chi tiết
- Đọc khuyến nghị từ Eva

### 2️⃣ **Theo dõi tiến độ**

**Xem biểu đồ:**
- Vào trang "Tiến độ"
- Xem biểu đồ xu hướng Snellen
- Xem phân bố bài test
- Xem heatmap Amsler

**Xem lịch sử:**
- Vào trang "Lịch sử"
- Xem tất cả bài test đã làm
- Nhấn vào bài test để xem chi tiết

**Xuất báo cáo:**
- Vào trang "Tiến độ"
- Nhấn "Xuất PDF"
- Lưu báo cáo

### 3️⃣ **Đặt nhắc nhở**

**Thêm nhắc nhở:**
- Vào trang "Nhắc nhở"
- Nhấn "+ Thêm nhắc nhở"
- Chọn loại (Bài test / Tập luyện)
- Chọn tần suất
- Chọn giờ
- Nhấn "Lưu"

### 4️⃣ **Tìm bệnh viện**

**Tìm kiếm:**
- Vào trang "Bệnh viện"
- Cho phép truy cập vị trí
- Xem danh sách bệnh viện gần nhất

**Chỉ đường:**
- Nhấn vào bệnh viện
- Nhấn "Chỉ đường"
- Google Maps sẽ mở

### 5️⃣ **Chat với Eva**

**Bắt đầu chat:**
- Nhấn nút chat (góc phải dưới)
- Nhập câu hỏi hoặc nhấn nút mic

**Dùng giọng nói:**
- Nhấn nút mic
- Nói câu hỏi
- Eva sẽ trả lời bằng giọng nói

### 6️⃣ **Kiếm huy hiệu**

**Cách kiếm:**
- Hoàn thành bài test → Mở huy hiệu "Người khởi đầu"
- Hoàn thành 5 bài test → Mở huy hiệu "Nhà khoa học"
- Duy trì streak 7 ngày → Mở huy hiệu "Người kiên trì"

---

## ⚙️ CÀI ĐẶT & TRIỂN KHAI

### Yêu cầu:
- Node.js v18+
- npm hoặc yarn
- Google Gemini API Key (miễn phí)

### Cài đặt cục bộ:

```bash
# 1. Clone repository
git clone <repository-url>
cd d-git-test

# 2. Cài đặt dependencies
npm install

# 3. Tạo file .env.local
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# 4. Chạy dev server
npm run dev

# 5. Mở trình duyệt
# Truy cập http://localhost:5173
```

### Build cho production:

```bash
# Build
npm run build

# Preview
npm run preview

# Deploy dist/ folder tới:
# - Vercel (khuyến nghị)
# - Netlify
# - GitHub Pages
# - Firebase Hosting
```

---

## 🌐 HỖ TRỢ TRÌNH DUYỆT

| Tính năng | Chrome | Edge | Safari | Firefox |
|----------|--------|------|--------|---------|
| Bài test cơ bản | ✅ | ✅ | ✅ | ✅ |
| Chat giọng nói | ✅ | ✅ | ⚠️ | ❌ |
| Định vị GPS | ✅ | ✅ | ✅ | ✅ |
| Thông báo | ✅ | ✅ | ⚠️ | ✅ |
| Dark mode | ✅ | ✅ | ✅ | ✅ |

---

## 📊 THỐNG KÊ DỰ ÁN

### Kích thước:
- **Bundle size:** ~1.5MB (gzip: ~400KB)
- **Số file:** 50+ components, services, pages
- **Dòng code:** ~15,000+ dòng TypeScript/React

### Performance:
- **Load time:** < 3 giây (trên 4G)
- **Lighthouse score:** 85+ (Performance)
- **Core Web Vitals:** Tốt

### Tính năng:
- **5 bài test** thị lực
- **7 huy hiệu** gamification
- **5 bài tập** mắt
- **2 ngôn ngữ** hỗ trợ
- **2 chế độ** sáng/tối

---

## 🐛 KHẮC PHỤC SỰ CỐ

### Vấn đề: Ứng dụng không tải
**Giải pháp:**
- Xóa cache trình duyệt (Ctrl+Shift+Delete)
- Xóa localStorage: `localStorage.clear()`
- Tải lại trang (Ctrl+F5)

### Vấn đề: Giọng nói không hoạt động
**Giải pháp:**
- Kiểm tra quyền microphone
- Sử dụng Chrome hoặc Edge
- Kiểm tra kết nối internet

### Vấn đề: Thông báo không hiển thị
**Giải pháp:**
- Cho phép thông báo trong cài đặt trình duyệt
- Kiểm tra cài đặt hệ thống

### Vấn đề: Không thể tìm bệnh viện
**Giải pháp:**
- Cho phép truy cập vị trí
- Kiểm tra kết nối internet

---

## 📚 TÀI LIỆU THAM KHẢO

### Tài liệu chính thức:
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

### Tài liệu y tế:
- [Snellen Chart](https://en.wikipedia.org/wiki/Snellen_chart)
- [Ishihara Color Test](https://en.wikipedia.org/wiki/Ishihara_test)
- [Amsler Grid](https://en.wikipedia.org/wiki/Amsler_grid)

---

## 👥 ĐÓNG GÓP

Để đóng góp cho dự án:

1. Fork repository
2. Tạo branch tính năng (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi (`git commit -m 'Add amazing feature'`)
4. Push tới branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

---

## 📄 GIẤY PHÉP

Dự án này được cấp phép dưới MIT License.

---

## 💬 HỖ TRỢ & PHẢN HỒI

- **Báo cáo lỗi:** Mở issue trên GitHub
- **Yêu cầu tính năng:** Thảo luận trong GitHub Discussions
- **Chat với Eva:** Hỏi trực tiếp trong ứng dụng!

---

## 🎉 LỜI CẢM ƠN

- **Google Gemini AI** - Mô hình AI và API (gemini 2.5)
- **Tailwind CSS** - Framework CSS
- **React Community** - Framework cơ bản
- **Cộng đồng sức khỏe mắt Việt Nam** - Dữ liệu bệnh viện và phản hồi

---

## ⚠️ GHI CHÚ CUỐI CÙNG

**Tuyên bố miễn trừ:** Ứng dụng này được thiết kế cho mục đích giáo dục và tham khảo. Không thể thay thế tư vấn y tế chuyên nghiệp. Nếu bạn có vấn đề về mắt, vui lòng tham khảo bác sĩ mắt.

**Bảo mật:** API key Gemini được lưu trữ trong trình duyệt (phù hợp cho demo). Đối với sản xuất, hãy sử dụng backend proxy.

**Hiệu suất:** Ứng dụng được tối ưu hóa cho hiệu suất:
- Lazy loading components
- Code splitting
- AI caching
- Service Worker
- PWA ready

---

**Tạo với ❤️ cho sức khỏe mắt tốt hơn**

Phiên bản: 1.0.2 final  
Cập nhật lần cuối: 2024-11-27  
Tác giả: AI Vision Team - Claude Opus - Long Nguyễn

