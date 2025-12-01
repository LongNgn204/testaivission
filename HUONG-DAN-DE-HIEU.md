
### 3. **Google Gemini AI** - Trợ lý AI thông minh
**Là gì?**  
Gemini AI giống như **bác sĩ ảo** được Google tạo ra. Nó:
- 🧠 Hiểu câu hỏi của bạn
- 💬 Trả lời bằng ngôn ngữ tự nhiên
- 📊 Phân tích kết quả test và đưa ra lời khuyên

**Model đang dùng:** `gemini-2.5-flash` và `gemini-2.5-pro`
- ⚡ Nhanh (trả lời < 1 giây)
- 🆓 Miễn phí (trong giới hạn)
- 🎯 Chính xác cao

**Ví dụ thực tế:**
```
Bạn hỏi: "Mắt tôi có bình thường không?"
AI phân tích: Kết quả test + Lịch sử → Đưa ra câu trả lời chi tiết
AI trả lời: "Dựa vào kết quả, thị lực của bạn ở mức tốt..."
```

---

### 4. **Web Speech API** - Giọng nói tự động
**Là gì?**  
Công nghệ có sẵn trong trình duyệt giúp:
- 🗣️ Đọc văn bản thành giọng nói (Text-to-Speech)
- 🎤 Nghe và hiểu giọng nói của bạn (Speech Recognition)

**Tính năng:**
- ✅ **Miễn phí** (không tốn tiền)
- ✅ Hỗ trợ tiếng Việt
- ✅ Hoạt động offline (không cần mạng)
- ✅ Giọng đọc tự nhiên

**Ví dụ thực tế:**
- Bạn nhấn "Bắt đầu test" → Giọng Eva đọc hướng dẫn
- Bạn nói "Mắt tôi thế nào?" → AI hiểu và trả lời

---

### 5. **Vite** - Máy xây dựng website siêu nhanh
**Là gì?**  
Vite giống như **máy ép bánh mì** cho code:
- Nhận vào: Code lộn xộn (hàng trăm files)
- Ép lại: Thành 1 file gọn gàng, tối ưu
- Kết quả: Website chạy cực nhanh

**Tại sao nhanh?**
- ⚡ Chỉ load những gì cần thiết
- 🔥 Hot reload (sửa code thấy ngay, không cần F5)
- 📦 Nén file nhỏ gọn

---

### 6. **PWA (Progressive Web App)** - Cài như app điện thoại
**Là gì?**  
PWA biến website thành **app giống native** (như app trong App Store).

**Lợi ích:**
- 📱 Cài về màn hình chính điện thoại
- 📶 Vẫn chạy khi mất mạng
- 🔔 Nhận thông báo nhắc nhở
- ⚡ Mở nhanh hơn

**Ví dụ:** Instagram Web cũng là PWA!

---

## 🧩 CẤU TRÚC DỰ ÁN (PROJECT STRUCTURE)

Website được chia thành các phần như **căn nhà**:

```
🏠 d:\git\test/  (Căn nhà chính)
│
├── 🚪 index.html              → Cửa chính (trang web đầu tiên)
├── 🔑 index.tsx               → Chìa khóa khởi động app
├── 🧠 App.tsx                 → Bộ não điều khiển toàn bộ
│
├── 📂 pages/                  → Các phòng (trang web)
│   ├── WelcomePage.tsx        → Phòng khách (trang chào mừng)
│   ├── Home.tsx               → Phòng chính (trang chủ)
│   ├── LoginPage.tsx          → Cửa vào (đăng nhập)
│   ├── History.tsx            → Phòng lưu trữ (lịch sử)
│   └── AboutPage.tsx          → Phòng giới thiệu
│
├── 📂 components/             → Đồ đạc trong nhà (các thành phần)
│   ├── Header.tsx             → Đầu trang (logo, menu)
│   ├── SnellenTest.tsx        → Bài test thị lực
│   ├── ColorBlindTest.tsx     → Bài test mù màu
│   ├── VisionCoach.tsx        → Trợ lý AI Eva
│   └── HospitalLocator.tsx    → Tìm bệnh viện
│
├── 📂 services/               → Nhà kho (xử lý logic)
│   ├── aiService.ts           → Kết nối với AI
│   ├── storageService.ts      → Lưu trữ dữ liệu
│   └── snellenService.ts      → Logic bài test Snellen
│
├── 📂 context/                → Hệ thống điện nước (quản lý toàn cục)
│   ├── LanguageContext.tsx    → Chuyển ngôn ngữ (Việt/Anh)
│   ├── ThemeContext.tsx       → Chế độ sáng/tối
│   └── UserContext.tsx        → Thông tin người dùng
│
├── 📂 i18n/                   → Từ điển đa ngôn ngữ
│   └── index.ts               → Tiếng Việt + English
│
├── 📂 hooks/                  → Công cụ đặc biệt
│   ├── useSpeechRecognition   → Nghe giọng nói
│   ├── useVoiceControl        → Điều khiển bằng giọng nói
│   └── usePdfExport           → Xuất PDF
│
├── 📂 utils/                  → Hộp dụng cụ
│   ├── performanceUtils.ts    → Tối ưu tốc độ
│   └── audioUtils.ts          → Xử lý âm thanh
│
├── 📄 manifest.json           → Thẻ căn cước (thông tin app)
├── 📄 sw.js                   → Bảo vệ (service worker)
└── 📄 types.ts                → Định nghĩa kiểu dữ liệu
```

---

## 🔄 LOGIC HOẠT ĐỘNG (CÁCH WEBSITE CHẠY)

### **Bước 1: Người dùng mở website**
```
Trình duyệt → index.html → index.tsx → App.tsx → Hiển thị WelcomePage
```

**Giải thích:**
1. Trình duyệt đọc file `index.html` (cửa chính)
2. Load `index.tsx` (khởi động React)
3. `App.tsx` quyết định hiển thị trang nào
4. Hiện trang chào mừng cho user

---

### **Bước 2: Người dùng đăng nhập**
```
WelcomePage → Click "Bắt đầu" → LoginPage → Nhập tên → Home
```

**Chuyện gì xảy ra bên trong?**
1. User nhấn nút "Bắt đầu"
2. Website chuyển sang trang đăng nhập
3. User gõ tên (ví dụ: "Minh")
4. Tên được lưu vào `LocalStorage` (như USB trong trình duyệt)
5. Chuyển sang trang chủ

---

### **Bước 3: Làm bài test**
```
Home → Chọn test Snellen → SnellenTest.tsx → Làm bài → aiService.ts → Gemini AI phân tích → Hiển thị kết quả
```

**Chi tiết từng bước:**

**3.1. User chọn test Snellen**
- Nhấn vào nút "Kiểm tra thị lực"
- Website load component `SnellenTest.tsx`

**3.2. Làm bài test**
- Website hiện chữ E theo thứ tự từ to → nhỏ
- User chọn hướng chữ E (trên, dưới, trái, phải)
- `snellenService.ts` ghi nhận câu trả lời đúng/sai

**3.3. AI phân tích**
```javascript
// Ví dụ đơn giản (không phải code thật)
User làm đúng 8/10 câu
→ snellenService tính điểm: 20/30
→ Gửi kết quả đến aiService
→ aiService gửi đến Gemini AI
→ AI trả về: "Thị lực của bạn ở mức tốt..."
→ Website hiển thị kết quả + lời khuyên
```

**3.4. Lưu kết quả**
- `storageService.ts` lưu vào LocalStorage
- Có thể xem lại trong mục "Lịch sử"

---

### **Bước 4: Chat với AI Eva**
```
Click biểu tượng mic → Nói câu hỏi → Web Speech API → aiService.ts → Gemini AI → Trả lời → Web Speech đọc lại
```

**Ví dụ thực tế:**

**User:** "Mắt tôi có cần đeo kính không?"

**Quy trình xử lý:**
1. **Nghe giọng:** Web Speech API chuyển giọng nói → văn bản
2. **Gửi AI:** `aiService.ts` gửi câu hỏi + lịch sử test đến Gemini
3. **AI suy nghĩ:** Gemini phân tích dữ liệu → Tạo câu trả lời
4. **Trả lời:** AI trả về văn bản tiếng Việt
5. **Đọc lại:** Web Speech API đọc câu trả lời

---

### **Bước 5: Tìm bệnh viện**
```
Click "Bệnh viện" → HospitalLocator.tsx → Xin phép GPS → Tính khoảng cách → Hiển thị danh sách
```

**Cách hoạt động:**
1. Website hỏi: "Cho phép xem vị trí của bạn?"
2. User đồng ý → Lấy tọa độ GPS (vĩ độ, kinh độ)
3. Tính khoảng cách từ vị trí bạn đến 5 bệnh viện
4. Sắp xếp từ gần → xa
5. Hiển thị: Tên, địa chỉ, số điện thoại, khoảng cách

---

## 📊 DỮ LIỆU LƯU Ở ĐÂU?

### **LocalStorage - Kho lưu trữ cá nhân**

**LocalStorage là gì?**
> Giống như **USB ảo** trong trình duyệt của bạn. Mỗi website có 1 USB riêng.

**Lưu những gì?**
1. **Thông tin user:** Tên, ngày sinh
2. **Lịch sử test:** 
   - Test nào đã làm
   - Ngày giờ làm
   - Kết quả (20/20, 20/40...)
   - Lời khuyên của AI
3. **Cài đặt:**
   - Ngôn ngữ (Việt/Anh)
   - Chế độ tối/sáng
   - Âm lượng
4. **Lịch sử chat:** Cuộc trò chuyện với Eva

**Dung lượng:** ~5-10 MB (rất nhỏ, không ảnh hưởng điện thoại)

**Bảo mật?**
- ✅ Chỉ bạn thấy được (không ai khác)
- ✅ Không gửi lên internet
- ⚠️ Mất nếu xóa cache trình duyệt

---

## 🎨 GIAO DIỆN (UI) HOẠT ĐỘNG THẾ NÀO?

### **1. Header (Đầu trang)**
```
Logo | Trang chủ | Lịch sử | Bệnh viện | Nhắc nhở | 🌙 | 🇻🇳 | 👤 Minh
```

**Chức năng:**
- **Logo:** Click → về trang chủ
- **Menu:** Click → chuyển trang
- **🌙:** Bật/tắt chế độ tối
- **🇻🇳:** Đổi ngôn ngữ Việt ⇄ Anh
- **👤 Minh:** Xem thông tin cá nhân

---

### **2. Sidebar (Menu bên)**
```
📊 Tiến trình
🏥 Bệnh viện  
🔔 Nhắc nhở
💬 Eva (AI)
```

**Chức năng:**
- Truy cập nhanh các tính năng
- Có số thông báo (badge)
- Thu/mở được

---

### **3. Trang chủ**
```
┌─────────────────────────────┐
│   Kế hoạch hôm nay          │
│   ✓ Test Snellen (2 phút)   │
│   ◯ Bài tập 20-20-20        │
└─────────────────────────────┘

┌─────────────────────────────┐
│   Tất cả bài test           │
│   📝 Test thị lực           │
│   🎨 Test mù màu            │
│   📐 Test loạn thị          │
│   🔲 Test lưới Amsler       │
│   🔴🟢 Test Duochrome       │
└─────────────────────────────┘
```

---

## 🔐 BẢO MẬT & RIÊNG TƯ

### **Dữ liệu của bạn:**
✅ **Không gửi lên server** - Tất cả lưu trong máy bạn  
✅ **Không cần đăng ký tài khoản** - Chỉ nhập tên  
✅ **Không thu thập thông tin cá nhân** - Không email, số điện thoại  
✅ **Không bán dữ liệu** - Không quảng cáo  

### **AI sử dụng dữ liệu như thế nào?**
- ✅ Chỉ phân tích kết quả test để tư vấn
- ✅ Không lưu trữ ở server Google
- ✅ Mỗi lần hỏi AI là request độc lập

---

## 🚀 TẠI SAO WEBSITE NÀY NHANH?

### **1. Code Splitting (Tách code)**
**Giải thích:**
> Thay vì tải toàn bộ website cùng lúc (như tải cả quyển sách), chỉ tải trang bạn đang xem (như đọc từng trang).

**Ví dụ:**
- Bạn ở trang chủ → Chỉ load code trang chủ (200KB)
- Bạn vào test Snellen → Mới load code test Snellen (50KB)
- **Tiết kiệm:** 80% dung lượng!

---

### **2. Lazy Loading (Load lười)**
**Giải thích:**
> Chỉ load khi cần, không load trước.

**Ví dụ:**
```
Trang chủ có 5 ảnh minh họa
→ Chỉ load 2 ảnh đầu (trong màn hình)
→ Khi scroll xuống → Load 3 ảnh còn lại
→ Trang load nhanh hơn!
```

---

### **3. Caching (Lưu bộ nhớ đệm)**
**Giải thích:**
> Ghi nhớ những gì đã tải, lần sau không tải lại.

**Ví dụ thực tế:**
```
Lần 1: Hỏi AI "Mắt tôi thế nào?"
→ Gửi request → Gemini trả lời (1 giây)
→ Lưu vào cache

Lần 2: Hỏi lại câu hỏi giống hệt
→ Lấy từ cache → Trả lời ngay lập tức (0ms)
→ Nhanh hơn 1000 lần!
```

**Cache được lưu:**
- Câu trả lời AI (60 phút)
- Giọng đọc (60 phút)
- Hình ảnh, icon (1 tuần)

---

### **4. Service Worker (Người hầu)**
**Giải thích:**
> Là 1 chương trình chạy ngầm, giúp website hoạt động ngay cả khi mất mạng.

**Chức năng:**
- 📥 Tải trước các file quan trọng
- 💾 Lưu vào bộ nhớ điện thoại
- 📶 Khi mất mạng → Vẫn mở được website
- 🔔 Gửi thông báo nhắc nhở

---

## 🧪 CÁC BÀI TEST HOẠT ĐỘNG RA SAO?

### **1. Test Snellen (Thị lực)**

**Mục đích:** Đo xem bạn nhìn rõ từ bao xa

**Cách hoạt động:**
```
Bước 1: Website hiện chữ E to
        ← Bạn chọn hướng (trái/phải/trên/dưới)
        
Bước 2: Đúng → Chữ E nhỏ hơn
        Sai → Dừng lại
        
Bước 3: Làm đến khi không nhìn rõ
        → Tính điểm: 20/20, 20/30, 20/40...
```

**Ý nghĩa kết quả:**
- **20/20:** Thị lực hoàn hảo 🎉
- **20/30:** Giảm nhẹ (vẫn lái xe được)
- **20/40:** Cần kính khi lái xe
- **20/100:** Cần khám bác sĩ ngay

---

### **2. Test Mù màu (Ishihara)**

**Mục đích:** Kiểm tra phân biệt màu

**Cách hoạt động:**
```
Bước 1: Hiện 20 tấm hình có số trong đám chấm màu
Bước 2: Bạn nhìn và chọn số
Bước 3: So sánh với đáp án đúng
Bước 4: Tính tỷ lệ đúng/sai → Kết quả
```

**Kết quả:**
- Đúng >17/20: Bình thường ✅
- Đúng 10-17: Khuyết màu nhẹ ⚠️
- Đúng <10: Khuyết màu nặng ⛔

---

### **3. Test Loạn thị (Astigmatism)**

**Mục đích:** Kiểm tra độ loạn của giác mạc

**Cách hoạt động:**
```
Bước 1: Hiện hình "bánh xe" với các vạch tia
Bước 2: Bạn đánh giá xem vạch nào đậm/mờ
Bước 3: AI phân tích → Phát hiện loạn thị
```

---

### **4. Test Lưới Amsler**

**Mục đích:** Phát hiện vấn đề võng mạc

**Cách hoạt động:**
```
Bước 1: Hiện lưới ô vuông 20x20
Bước 2: Bạn nhắm 1 mắt, nhìn chấm giữa
Bước 3: Đánh dấu vùng lưới bị cong/mờ
Bước 4: AI phân tích mức độ nghiêm trọng
```

**Quan trọng:** Test này giúp phát hiện sớm thoái hóa điểm vàng!

---

### **5. Test Duochrome (Đỏ-Xanh)**

**Mục đích:** Kiểm tra khúc xạ (cận/viễn)

**Cách hoạt động:**
```
Bước 1: Hiện chữ E trên nền đỏ & xanh
Bước 2: Bạn chọn bên nào nhìn rõ hơn
Bước 3: AI phân tích → Phát hiện cận/viễn thị
```

---

## 🤖 AI EVA - TRỢ LÝ ẢO

### **Eva là ai?**
Eva (Eye Vision Assistant) là trợ lý ảo:
- 🧠 Thông minh: Được train bởi Google Gemini AI
- 💬 Thân thiện: Nói chuyện tự nhiên như người thật
- 🎓 Chuyên nghiệp: Kiến thức y khoa nhãn khoa sâu
- 🗣️ Đa năng: Nói chuyện bằng giọng nói hoặc chat

### **Eva làm được gì?**

**1. Tư vấn kết quả test:**
```
Bạn: "Kết quả test của tôi thế nào?"
Eva: "Dựa vào kết quả test Snellen 20/30, thị lực của bạn 
      giảm nhẹ. Tôi khuyên bạn nên..."
```

**2. Trả lời thắc mắc:**
```
Bạn: "Tại sao mắt tôi hay mỏi?"
Eva: "Mỏi mắt có thể do nhiều nguyên nhân: làm việc 
      với màn hình lâu, thiếu ánh sáng, hoặc cần 
      đeo kính. Tôi gợi ý bạn..."
```

**3. Đề xuất bài tập:**
```
Bạn: "Có bài tập nào giúp giảm mỏi mắt không?"
Eva: "Có! Bạn nên thử quy tắc 20-20-20: Cứ 20 phút 
      làm việc, nhìn vật cách 20 feet (6m) trong 20 giây..."
```

**4. Nhắc nhở khám bệnh:**
```
Bạn: "Khi nào tôi cần đến bác sĩ?"
Eva: "Dựa vào kết quả, bạn nên gặp bác sĩ trong 2-4 tuần 
      vì [lý do cụ thể]..."
```

### **Cách nói chuyện với Eva:**

**Bằng giọng nói:** 🎤
1. Click nút tròn màu **XANH DƯƠNG** (biểu tượng micro) ở góc dưới bên phải
2. Nói câu hỏi rõ ràng
3. Eva nghe → Suy nghĩ → Trả lời bằng giọng

**Bằng chat:** 💬
1. Click nút tròn màu **XANH LÁ** (biểu tượng chat) ở góc dưới bên phải
2. Gõ câu hỏi vào ô nhập liệu
3. Nhấn Enter hoặc nút gửi
4. Eva trả lời bằng văn bản ngay lập tức

---

## 🔔 HỆ THỐNG NHẮC NHỞ

### **Tự động lên lịch:**

**AI tạo kế hoạch cá nhân:**
```
Thứ 2: Test Snellen (5 phút)
Thứ 3: Bài tập 20-20-20 (2 phút)
Thứ 4: Test mù màu (3 phút)
Thứ 5: Bài tập thư giãn (2 phút)
Thứ 6: Test lưới Amsler (5 phút)
Thứ 7: Nghỉ
CN: Nghỉ
```

**Thông báo:**
- 🔔 Push notification (nếu cho phép)
- 📧 Không spam email
- ⏰ Tự chọn giờ nhắc

---

## 📱 CÀI ĐẶT VÀ SỬ DỤNG

### **Yêu cầu:**
- ✅ Trình duyệt: Chrome, Edge, Safari (bản mới)
- ✅ Hệ điều hành: Windows, Mac, iOS, Android
- ✅ Kết nối mạng: Cần mạng (3G/4G/WiFi)
- ✅ Micro & loa: Nếu muốn dùng giọng nói

### **Cài đặt như app:**

**Trên điện thoại (Android/iOS):**
1. Mở website bằng Chrome/Safari
2. Click nút "Thêm vào màn hình chính"
3. Icon xuất hiện như app thật!

**Trên máy tính (Windows/Mac):**
1. Mở website bằng Chrome/Edge
2. Click icon ⊕ ở thanh địa chỉ
3. Chọn "Cài đặt"

---

## 🎯 TÍNH NĂNG NỔI BẬT

### **1. Offline Mode (Chế độ ngoại tuyến)**
- Vẫn xem lại lịch sử test khi mất mạng
- Cache các trang đã xem
- Service Worker tự động đồng bộ khi có mạng

### **2. Đa ngôn ngữ**
- 🇻🇳 Tiếng Việt
- 🇬🇧 English
- Dễ thêm ngôn ngữ mới

### **3. Dark Mode (Chế độ tối)**
- Bảo vệ mắt khi dùng ban đêm
- Tiết kiệm pin (màn OLED)
- Tự động theo giờ

### **4. Export PDF**
- Xuất báo cáo chi tiết
- Gửi cho bác sĩ
- Lưu trữ lâu dài

---

## ❓ CÂU HỎI THƯỜNG GẶP

### **1. Website này có chính xác không?**
✅ **Có**, nhưng:
- Chỉ là công cụ **sàng lọc ban đầu**
- Không thay thế khám bác sĩ
- Kết quả tham khảo, không phải chẩn đoán chính thức

### **2. AI có thay thế bác sĩ không?**
❌ **Không!** AI chỉ:
- Tư vấn sơ bộ
- Gợi ý khi nào cần gặp bác sĩ
- Không kê đơn thuốc

### **3. Dữ liệu có bị lộ không?**
✅ **Không:**
- Tất cả lưu trong máy bạn
- Không upload lên server
- Chỉ bạn truy cập được

### **4. Sử dụng có mất phí không?**
✅ **Miễn phí 100%:**
- Không quảng cáo
- Không yêu cầu thanh toán
- Không subscription

### **5. Cần máy tính khỏe không?**
✅ **Không cần:**
- Chạy mượt trên điện thoại cũ
- Dung lượng nhỏ (<5MB)
- Không chiếm RAM

---

## 🎓 HỌC THÊM

**Nếu bạn muốn hiểu sâu hơn về từng phần:**

📘 **PROJECT-STRUCTURE.md** - Cấu trúc dự án chi tiết (có code)  
💰 **INVESTMENT-PLAN.md** - Kế hoạch phát triển & chi phí  
🏗️ **TECHNICAL-ARCHITECTURE.md** - Kiến trúc kỹ thuật  
📖 **README.md** - Hướng dẫn dành cho lập trình viên  

---

## 💡 KẾT LUẬN

Website này là sự kết hợp của:
- 🧠 **AI thông minh** (Google Gemini)
- 🎨 **Giao diện đẹp** (React)
- ⚡ **Hiệu suất cao** (Vite, Code splitting)
- 🔐 **Bảo mật tốt** (LocalStorage)
- 🗣️ **Giọng nói tự nhiên** (Web Speech API)

**Mục tiêu:** Làm cho việc kiểm tra mắt:
- ✅ Dễ dàng (không cần đến bệnh viện)
- ✅ Nhanh chóng (2-5 phút/test)
- ✅ Miễn phí (0 đồng)
- ✅ Thông minh (AI tư vấn)

---

**🌟 Chúc bạn có trải nghiệm tuyệt vời với ứng dụng!**

**Câu hỏi?** Hỏi Eva - trợ lý AI luôn sẵn sàng giúp đỡ! 💬
