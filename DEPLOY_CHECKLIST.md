# Deploy Checklist - AI Proxy Setup

## ✅ Trước khi deploy

### Code Changes
- [x] `functions/api/generateContent.ts` - Created
- [x] `functions/api/generateContentStream.ts` - Created
- [x] `services/aiService.ts` - Updated with proxy logic
- [x] `wrangler.toml` - Already configured
- [x] Documentation files created

### Local Testing (Optional)
- [ ] Run `npm run build` locally - check for errors
- [ ] Run `npm run dev` - test on localhost
- [ ] Verify no TypeScript errors: `npx tsc --noEmit`

### Git
- [ ] Stage all changes: `git add .`
- [ ] Commit: `git commit -m "Setup Cloudflare Pages Functions for AI proxy"`
- [ ] Push: `git push origin main`

---

## 🔐 Cloudflare Setup (IMPORTANT!)

### Get API Key
- [ ] Go to https://aistudio.google.com/app/apikeys
- [ ] Create new API key
- [ ] Copy the key (save it somewhere safe)

### Add to Cloudflare
- [ ] Log in to Cloudflare Dashboard
- [ ] Go to Pages → Your Project
- [ ] Click Settings
- [ ] Go to Environment variables
- [ ] Add new variable:
  - **Name**: `GEMINI_API_KEY`
  - **Value**: `<your_api_key>`
- [ ] Save

---

## 🚀 Deploy

- [ ] Push code to GitHub (if not done)
- [ ] Wait for Cloudflare to detect changes
- [ ] Cloudflare automatically builds and deploys (2-5 minutes)
- [ ] Check deployment status in Cloudflare Pages dashboard

---

## 🧪 Verify After Deploy

### Check Logs
- [ ] Go to your production URL (e.g., `https://your-project.pages.dev`)
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] Look for: `🔐 Using Cloudflare Pages Functions proxy for AI`
- [ ] No errors should appear

### Test AI Features
- [ ] Try Chat feature - should work
- [ ] Generate a test report - should work
- [ ] Check Network tab - requests go to `/api/generateContent`
- [ ] No 400 errors from Google API

### Check Network Requests
- [ ] Open DevTools → Network tab
- [ ] Perform an AI action
- [ ] Should see requests to `/api/generateContent` or `/api/generateContentStream`
- [ ] Status should be 200 (not 400)
- [ ] Response should contain AI-generated content

---

## ❌ Troubleshooting

### If you see "API key not configured on server"
- [ ] Double-check API key in Cloudflare Environment Variables
- [ ] Make sure it's exactly: `GEMINI_API_KEY`
- [ ] Redeploy after adding/fixing the key

### If you see CORS errors
- [ ] This shouldn't happen with the new setup
- [ ] Try hard refresh (Ctrl+Shift+R)
- [ ] Check if Functions are deployed correctly

### If requests fail with 400
- [ ] Check Cloudflare Pages Functions logs
- [ ] Verify API key is valid
- [ ] Check Google API quota

### If streaming doesn't work
- [ ] Check `/api/generateContentStream` endpoint
- [ ] Verify response format in Network tab
- [ ] Try non-streaming features first

---

## 📝 Notes

- **No need to remove VITE_GEMINI_API_KEY from .env.local** - it's only used in development
- **API key in Cloudflare is separate** - production uses Cloudflare's env var
- **Functions are auto-deployed** - no manual function deployment needed
- **CORS is handled** - proxy adds proper headers

---

## 🎉 Success Criteria

You'll know it's working when:
- ✅ No 400 errors from Google API
- ✅ Console shows proxy is being used
- ✅ AI features work on production URL
- ✅ Network requests go through `/api/` endpoints
- ✅ No CORS errors

---

## 📞 Need Help?

Check these files for more info:
- `CLOUDFLARE_SETUP.md` - Detailed setup guide
- `AI_PROXY_SETUP_SUMMARY.md` - Quick summary
- `services/aiService.ts` - Proxy implementation

Good luck! 🚀

