# Quick Start - Deploy AI to Cloudflare

## 3 Bước Duy Nhất

### 1️⃣ Lấy API Key (2 phút)
```
1. Vào: https://aistudio.google.com/app/apikeys
2. Click "Create API key"
3. Copy key
```

### 2️⃣ Thêm vào Cloudflare (2 phút)
```
1. Vào: https://dash.cloudflare.com
2. Pages → Your Project → Settings
3. Environment variables → Add
4. Name: GEMINI_API_KEY
5. Value: <paste key từ bước 1>
6. Save
```

### 3️⃣ Deploy (1 phút)
```bash
git add .
git commit -m "Setup AI proxy"
git push origin main
```

**Chờ 2-5 phút cho Cloudflare deploy xong.**

---

## ✅ Kiểm tra

1. Vào URL production của bạn
2. Mở DevTools (F12) → Console
3. Tìm: `🔐 Using Cloudflare Pages Functions proxy for AI`
4. Thử dùng AI features

---

## 🎯 Done!

AI sẽ hoạt động bình thường trên Cloudflare.

---

## 📚 Thêm chi tiết?

- `CLOUDFLARE_SETUP.md` - Hướng dẫn chi tiết
- `DEPLOY_CHECKLIST.md` - Checklist đầy đủ
- `AI_PROXY_SETUP_SUMMARY.md` - Giải thích kỹ thuật

