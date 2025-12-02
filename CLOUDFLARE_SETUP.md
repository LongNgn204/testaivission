# Cloudflare Pages Deployment Guide

## ✅ Cách setup đơn giản nhất (Không cần backend, không cần config phức tạp)

### 📋 Bước 1: Chuẩn bị trên Cloudflare Dashboard

1. Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Chọn **Pages** → **Create a project**
3. Kết nối GitHub repo của bạn
4. Chọn branch (thường là `main`)
5. Cấu hình build:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

### 🔐 Bước 2: Thêm Environment Variables

**Quan trọng**: Đây là bước giải quyết lỗi AI của bạn!

1. Trong Cloudflare Pages project, vào **Settings** → **Environment variables**
2. Thêm biến:

```
GEMINI_API_KEY = your_actual_api_key_here
```

**Lấy API key:**
- Truy cập [Google AI Studio](https://aistudio.google.com/app/apikeys)
- Tạo API key mới
- Copy key đó vào Cloudflare

### 📁 Bước 3: Cấu trúc thư mục (đã setup sẵn)

```
your-project/
├── functions/
│   └── api/
│       ├── generateContent.ts      ✅ (tạo sẵn)
│       └── generateContentStream.ts ✅ (tạo sẵn)
├── services/
│   └── aiService.ts               ✅ (đã update)
├── wrangler.toml                  ✅ (đã có)
└── package.json
```

### 🚀 Bước 4: Deploy

```bash
# 1. Commit changes
git add .
git commit -m "Setup Cloudflare Pages Functions for AI proxy"

# 2. Push to GitHub
git push origin main

# 3. Cloudflare tự động deploy
# Chờ khoảng 2-5 phút
```

### ✨ Bước 5: Kiểm tra hoạt động

Sau khi deploy xong:

1. Truy cập URL của bạn (ví dụ: `https://your-project.pages.dev`)
2. Mở DevTools (F12) → Console
3. Bạn sẽ thấy log: `🔐 Using Cloudflare Pages Functions proxy for AI`
4. Thử dùng AI features (Chat, Generate Report, etc.)

---

## 🔍 Cách hoạt động

### Trước (Lỗi):
```
Browser → Google Gemini API (trực tiếp)
❌ Cloudflare chặn request
❌ CORS error
❌ API key expose
```

### Sau (Hoạt động):
```
Browser → Cloudflare Pages Function → Google Gemini API
✅ Không bị chặn (same origin)
✅ API key an toàn (ở server)
✅ Tự động proxy
```

---

## [object Object]eshooting

### Lỗi: "API key not configured on server"
- Kiểm tra Environment Variables trong Cloudflare Settings
- Đảm bảo key được set đúng

### Lỗi: "Failed to load resource"
- Chờ 2-3 phút sau khi deploy
- Refresh page (Ctrl+Shift+R)

### Lỗi: "CORS error"
- Không nên xảy ra (đã fix)
- Nếu vẫn lỗi, check console log

### Lỗi: "Streaming not working"
- Thử reload page
- Check network tab xem request đến `/api/generateContentStream`

---

## 📝 Cấu hình tùy chọn

### Dùng proxy cả khi develop (tùy chọn):
Thêm vào `.env.local`:
```
VITE_USE_PROXY=true
```

### Chỉ dùng proxy trên production:
Không cần thêm gì, code tự detect

---

## ✅ Checklist trước deploy

- [ ] Tạo API key từ Google AI Studio
- [ ] Thêm `GEMINI_API_KEY` vào Cloudflare Environment Variables
- [ ] Commit và push code
- [ ] Chờ Cloudflare deploy xong
- [ ] Test AI features trên production URL

---

## 🎉 Done!

Bây giờ bạn có thể:
- ✅ Dùng AI mà không lo API key bị expose
- ✅ Không cần backend riêng
- ✅ Deploy cùng web lên Cloudflare
- ✅ Tất cả hoạt động tự động

Chúc bạn thành công! 🚀

