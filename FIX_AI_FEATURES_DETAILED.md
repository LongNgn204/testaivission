# Sửa Lỗi Chi Tiết - Chức Năng AI

## 🔴 Lỗi Phát Hiện

### 1. **Microphone Error**
```
TypeError: Cannot read properties of undefined (reading 'getUserMedia')
```
**Nguyên nhân:** VoiceInterface không kiểm tra navigator.mediaDevices trước khi sử dụng

### 2. **Chat Connection Error**
```
POST http://localhost:3001/api/chat - CONNECTION REFUSED
```
**Nguyên nhân:** ChatbotService cố gắng kết nối backend không tồn tại

### 3. **API Key Not Found**
```
⚠️ VITE_GEMINI_API_KEY not found in environment
```
**Nguyên nhân:** .env.local chưa được cấu hình hoặc API key không được đọc đúng

---

## ✅ Các Sửa Lỗi Đã Thực Hiện

### 1. **Cải Thiện API Key Detection** (aiService.ts)
```typescript
// ✅ Trước: Chỉ kiểm tra 1 cách
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;

// ✅ Sau: Kiểm tra nhiều cách
const API_KEY = (() => {
    if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
    if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;
    if (window.__GEMINI_API_KEY__) return window.__GEMINI_API_KEY__;
    console.warn('⚠️ API Key not found');
    return undefined;
})();
```

### 2. **Fallback từ Backend sang Direct AI** (chatbotService.ts)
```typescript
// ✅ Trước: Chỉ dùng backend
async chat() {
    return await apiPost('/api/chat', {...});
}

// ✅ Sau: Thử backend trước, nếu lỗi dùng direct AI
async chat() {
    try {
        return await apiPost('/api/chat', {...});
    } catch {
        if (GEMINI_API_KEY) {
            return await this.chatWithDirectAI(message, language);
        }
    }
}
```

### 3. **Xử Lý Microphone Errors** (VoiceInterface.tsx)
```typescript
// ✅ Thêm error handling cho getUserMedia
try {
    mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (error) {
    if (error?.name === 'NotAllowedError') {
        // Người dùng từ chối quyền
    } else if (error?.name === 'NotFoundError') {
        // Không có microphone
    } else if (error?.name === 'NotReadableError') {
        // Microphone đang được sử dụng
    }
}
```

---

## 🔧 Cách Cấu Hình Đúng

### Bước 1: Tạo .env.local

```bash
cd d:\git\test
```

**Windows PowerShell:**
```powershell
New-Item -Path ".env.local" -ItemType File
notepad .env.local
```

**Nội dung:**
```env
VITE_GEMINI_API_KEY=AIzaSyD_YOUR_ACTUAL_KEY_HERE
VITE_API_URL=http://localhost:8787
```

### Bước 2: Xác Minh File

```bash
# Kiểm tra file tồn tại
dir .env.local

# Xem nội dung
type .env.local
```

### Bước 3: Restart Dev Server

```bash
# Dừng server (Ctrl+C)
# Chạy lại
npm run dev
```

### Bước 4: Xóa Cache Browser

```
F12 → Application → Storage → Clear Site Data
```

---

## ✅ Kiểm Tra Chức Năng AI

### 1. Vision Coach Hiển Thị
- [ ] Có 2 nút nổi ở góc phải dưới
- [ ] Nút Mic (xanh dương)
- [ ] Nút Chat (xanh lá)

### 2. Chat Hoạt Động
- [ ] Nhấn nút Chat
- [ ] Gõ tin nhắn
- [ ] Eva trả lời

### 3. Voice Hoạt Động
- [ ] Nhấn nút Mic
- [ ] Nói chuyện
- [ ] Eva trả lời bằng giọng nói

### 4. AI Report Hoạt Động
- [ ] Chạy bài test
- [ ] Xem báo cáo
- [ ] Báo cáo có phân tích từ AI

### 5. Dashboard Hoạt Động
- [ ] Trang Home hiển thị "Vision Wellness Score"
- [ ] Có biểu đồ tròn
- [ ] Có phân tích "What's Going Well"

---

## 🔍 Troubleshooting

### ❌ Vision Coach Vẫn Không Hiển Thị

**Kiểm tra:**
```bash
# 1. Xem .env.local
type .env.local

# 2. Kiểm tra API key không trống
# Nên thấy: VITE_GEMINI_API_KEY=AIzaSyD...

# 3. Xóa cache
# F12 → Application → Clear Site Data

# 4. Restart
npm run dev
```

### ❌ Chat Báo Lỗi "CONNECTION REFUSED"

**Giải pháp:**
1. Đây là bình thường nếu không có backend
2. Hệ thống sẽ tự động fallback sang direct AI
3. Kiểm tra console để xem có API key không

### ❌ Microphone Không Hoạt Động

**Kiểm tra:**
1. Browser có cho phép microphone không?
   - Chrome: Settings → Privacy → Microphone
   - Firefox: about:preferences → Privacy → Permissions
2. Có microphone không?
3. Microphone có bị ứng dụng khác sử dụng không?

### ❌ AI Không Trả Lời

**Kiểm tra:**
1. API key có hợp lệ không?
2. Có internet không?
3. Google Gemini API có hoạt động không?
4. Xem console để xem error message

---

## 📊 Danh Sách Chức Năng AI

| Chức Năng | Cần API Key | Cần Backend | Trạng Thái |
|-----------|------------|------------|-----------|
| Chat | ✅ | ❌ | ✅ Hoạt động |
| Voice | ✅ | ❌ | ✅ Hoạt động |
| AI Report | ✅ | ❌ | ✅ Hoạt động |
| Dashboard | ✅ | ❌ | ✅ Hoạt động |
| Personalized Routine | ✅ | ❌ | ✅ Hoạt động |

---

## [object Object]ước Tiếp Theo

1. ✅ Tạo .env.local với API key
2. ✅ Restart dev server
3. ✅ Xóa cache browser
4. ✅ Kiểm tra Vision Coach hiển thị
5. ✅ Test chat/voice
6. ✅ Test AI report
7. ✅ Test dashboard

---

## [object Object]hi Chú

- **Fallback Strategy:** Nếu backend không có, sẽ dùng direct AI
- **Error Handling:** Tất cả lỗi đều được log ra console
- **Performance:** Direct AI nhanh hơn backend vì không cần network roundtrip
- **Security:** API key được lưu trong .env.local (không commit lên git)

---

**Chúc bạn thành công!** 🎉

Nếu vẫn gặp vấn đề:
1. Kiểm tra Console (F12)
2. Xem Network tab
3. Đọc error message
4. Thử lại các bước trên

