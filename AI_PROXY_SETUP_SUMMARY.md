# AI Proxy Setup - Tóm Tắt Nhanh

## ❌ Vấn đề cũ (Trên Cloudflare)
```
POST https://generativelanguage.googleapis.com/... 400 (Bad Request)
CORS Error - Cloudflare chặn request trực tiếp
API key bị expose trên client
```

## ✅ Giải pháp mới (Đã setup)

### Những gì đã làm:

1. **Tạo 2 Cloudflare Pages Functions:**
   - `functions/api/generateContent.ts` - Proxy cho API calls
   - `functions/api/generateContentStream.ts` - Proxy cho streaming

2. **Update `aiService.ts`:**
   - Thêm logic detect production (Cloudflare Pages)
   - Tạo method `callGeminiAPI()` và `callGeminiStreamAPI()`
   - Tất cả AI methods dùng proxy thay vì direct API

3. **Cách hoạt động:**
   ```
   Client (Browser)
       ↓
   /api/generateContent (Cloudflare Function)
       ↓
   Google Gemini API (với API key từ server)
       ↓
   Response trả về client
   ```

---

## [object Object]ước deploy (Chỉ 3 bước!)

### 1️⃣ Lấy API key
- Vào https://aistudio.google.com/app/apikeys
- Tạo key mới
- Copy key

### 2️⃣ Thêm vào Cloudflare
- Vào Cloudflare Dashboard
- Chọn Pages project của bạn
- Settings → Environment variables
- Thêm: `GEMINI_API_KEY = <key_vừa_copy>`

### 3️⃣ Deploy
```bash
git add .
git commit -m "Setup AI proxy for Cloudflare"
git push origin main
```

**Xong!** Cloudflare tự động deploy trong 2-5 phút.

---

## 🧪 Kiểm tra hoạt động

1. Truy cập URL production (ví dụ: `https://your-project.pages.dev`)
2. Mở DevTools (F12) → Console
3. Tìm log: `🔐 Using Cloudflare Pages Functions proxy for AI`
4. Thử dùng AI features

---

## 📁 Files thay đổi

```
✅ functions/api/generateContent.ts (NEW)
✅ functions/api/generateContentStream.ts (NEW)
✅ services/aiService.ts (UPDATED)
✅ CLOUDFLARE_SETUP.md (NEW - Guide chi tiết)
✅ AI_PROXY_SETUP_SUMMARY.md (NEW - File này)
```

---

## 🎯 Kết quả

| Trước | Sau |
|-------|-----|
| ❌ Lỗi 400 trên Cloudflare | ✅ Hoạt động bình thường |
| ❌ API key expose | ✅ API key an toàn (server-side) |
| ❌ CORS error | ✅ Không CORS error |
| ❌ Cần backend riêng | ✅ Không cần backend |

---

## 💡 Thêm info

- **Proxy hoạt động ở đâu?** Cloudflare Pages Functions (serverless)
- **API key ở đâu?** Environment Variables của Cloudflare (an toàn)
- **Có thêm chi phí không?** Không, Cloudflare Pages Functions miễn phí
- **Có cần thay đổi code client không?** Không, tự động detect

---

## ❓ FAQ

**Q: Tại sao IDE chạy bình thường nhưng Cloudflare lỗi?**
A: Vì localhost không bị CORS restrict, nhưng Cloudflare Pages có policy khác. Giờ dùng proxy nên không vấn đề.

**Q: Có cần thêm package nào không?**
A: Không, dùng những package đã có sẵn.

**Q: Nếu API key lỗi sao?**
A: Sẽ thấy lỗi "API key not configured on server" trong console.

---

## 🎉 Done!

Deploy lên Cloudflare và AI sẽ hoạt động bình thường!

