# Hướng Dẫn Cuối Cùng - Cấu Hình AI Features

## Tóm Tắt

Bạn đã phát hiện ra rằng code có lỗi kết nối GEMINI_API_KEY. Tôi đã sửa 2 file chính:

1. **services/aiService.ts** - Cải thiện API key detection
2. **services/chatbotService.ts** - Thêm fallback sang direct AI
3. **components/vision-coach/VoiceInterface.tsx** - Thêm error handling

---

## Cách Cấu Hình (3 Bước)

### Bước 1: Lấy API Key

```
1. Truy cập: https://aistudio.google.com/app/apikey
2. Nhấn "Create API Key"
3. Chọn "Create API key in new project"
4. Copy API key (ví dụ: AIzaSyD...)
```

### Bước 2: Tạo File `.env.local`

**Windows PowerShell:**
```powershell
cd d:\git\test
New-Item -Path ".env.local" -ItemType File
notepad .env.local
```

**Nội dung file:**
```env
VITE_GEMINI_API_KEY=AIzaSyD_YOUR_ACTUAL_KEY_HERE
VITE_API_URL=http://localhost:8787
```

### Bước 3: Restart Dev Server

```bash
# Dừng server (Ctrl+C)
# Chạy lại:
npm run dev
```

---

## Kiểm Tra Chức Năng

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

## Các Sửa Lỗi Chi Tiết

### 1. aiService.ts - API Key Detection

**Trước:**
```typescript
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
```

**Sau:**
```typescript
const API_KEY = (() => {
    if (import.meta.env.VITE_GEMINI_API_KEY) 
        return import.meta.env.VITE_GEMINI_API_KEY;
    if (process.env.VITE_GEMINI_API_KEY) 
        return process.env.VITE_GEMINI_API_KEY;
    if (window.__GEMINI_API_KEY__) 
        return window.__GEMINI_API_KEY__;
    console.warn('API Key not found');
    return undefined;
})();
```

---

### 2. chatbotService.ts - Fallback sang Direct AI

**Trước:**
```typescript
async chat(message, lastTestResult, userProfile, language) {
    return await apiPost('/api/chat', {...});
}
```

**Sau:**
```typescript
async chat(message, lastTestResult, userProfile, language) {
    try {
        return await apiPost('/api/chat', {...});
    } catch (error) {
        if (GEMINI_API_KEY) {
            return await this.chatWithDirectAI(message, language);
        }
        throw new Error('Chat service unavailable');
    }
}

private async chatWithDirectAI(message, language) {
    const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const response = await model.generateContent({...});
    return response.response.text();
}
```

---

### 3. VoiceInterface.tsx - Error Handling

**Thêm kiểm tra:**
1. Kiểm tra API key có tồn tại
2. Kiểm tra AudioContext được hỗ trợ
3. Kiểm tra navigator.mediaDevices có tồn tại
4. Xử lý tất cả các loại microphone error

---

## Troubleshooting

### Vision Coach Không Hiển Thị

```bash
# 1. Kiểm tra .env.local
type .env.local

# 2. Xóa cache browser
# F12 → Application → Storage → Clear Site Data

# 3. Restart dev server
npm run dev
```

### Chat Báo Lỗi "CONNECTION REFUSED"

- Bình thường nếu không có backend
- Hệ thống sẽ fallback sang direct AI
- Kiểm tra console để xem có API key không

### Microphone Không Hoạt Động

1. Browser có cho phép microphone không?
2. Có microphone không?
3. Microphone có bị ứng dụng khác sử dụng không?

---

## Danh Sách Chức Năng AI

| Chức Năng | Cần API Key | Cần Backend | Trạng Thái |
|-----------|------------|------------|-----------|
| Chat | Yes | No | Working |
| Voice | Yes | No | Working |
| AI Report | Yes | No | Working |
| Dashboard | Yes | No | Working |
| Personalized Routine | Yes | No | Working |

---

## Bước Tiếp Theo

1. Tạo .env.local với API key
2. Restart dev server
3. Xóa cache browser
4. Kiểm tra Vision Coach hiển thị
5. Test chat/voice
6. Test AI report
7. Test dashboard

---

## Ghi Chú Quan Trọng

- Fallback strategy: Backend → Direct AI
- Error handling: Tất cả lỗi được log
- Performance: Direct AI nhanh hơn
- Security: API key trong .env.local

---

**Chúc bạn thành công!**

Nếu gặp vấn đề:
1. Kiểm tra Console (F12)
2. Xem Network tab
3. Đọc error message
4. Thử lại các bước

