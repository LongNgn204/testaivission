@echo off
:: ============================================================
:: 🔐 Set Cloudflare Workers Secrets
:: ============================================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║    🔐 Setting Cloudflare Workers Secrets...              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 📌 Setting GEMINI_API_KEY...
echo AIzaSyDse6RpvHiuSXqCBq5v2SGZ798Ff0Ykse0 | npx wrangler secret put GEMINI_API_KEY

echo.
echo 📌 Setting JWT_SECRET...
echo vision-coach-secret-key-change-in-production-2024 | npx wrangler secret put JWT_SECRET

echo.
echo ✅ Secrets set successfully!
echo.
pause
