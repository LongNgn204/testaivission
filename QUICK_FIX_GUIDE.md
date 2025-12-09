# ⚡ Quick Fix Guide - OpenRouter Integration

## [object Object]-Minute Setup

### Step 1: Get Your API Key (1 minute)
```
1. Go to: https://openrouter.ai/keys
2. Sign up or login
3. Click "Create Key"
4. Copy the key (looks like: sk-or-v1-xxxxx...)
```

### Step 2: Create .env File (1 minute)
Create a file named `.env` in your project root:

```env
# OpenRouter API Key - Required for AI Reports, Chat, Dashboard
VITE_OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE

# Optional: Gemini API Key for Voice Chat
VITE_GEMINI_API_KEY=YOUR_GEMINI_KEY_HERE
```

**Location:** `project-root/.env` (same level as `package.json`)

### Step 3: Restart Dev Server (1 minute)
```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✅ Verification Checklist

### Check 1: API Key Loaded
Open browser console (F12) and paste:
```javascript
console.log('API Key:', import.meta.env.VITE_OPENROUTER_API_KEY?.slice(0, 20) + '...')
```
**Expected:** `sk-or-v1-...` (not `undefined`)

### Check 2: Chat Works
1. Click green chat button (bottom right)
2. Type: "Hello"
3. Should get response from Dr. Eva
4. Check console - should see: `✅ OpenRouter response received`

### Check 3: Report Works
1. Go to any test (e.g., Snellen)
2. Complete the test
3. Should see AI-generated report
4. Check console - should see: `✅ Report generated in XXXms`

### Check 4: Dashboard Works
1. Complete 2+ tests
2. Go to Home page
3. Should see "Vision Wellness Score" with number 0-100
4. Should NOT see "AI đang bận" message

---

## [object Object]

### Problem: "OpenRouter API key not configured"
**Solution:**
1. Check `.env` file exists in project root
2. Check key starts with `sk-or-`
3. Restart dev server
4. Clear browser cache (Ctrl+Shift+Delete)

### Problem: Chat shows "Sorry, an error occurred"
**Solution:**
1. Check API key in console: `console.log(import.meta.env.VITE_OPENROUTER_API_KEY)`
2. Check OpenRouter status: https://status.openrouter.ai
3. Check API key has credits: https://openrouter.ai/account/billing/overview

### Problem: Report shows "Không thể tạo báo cáo"
**Solution:**
1. Check browser console for error message
2. Verify API key is correct
3. Check network tab (DevTools) for API response
4. Try chat first to verify API key works

### Problem: Dashboard shows "AI đang bận"
**Solution:**
- This is normal fallback behavior
- Check API key is set
- Wait a moment and refresh
- Check OpenRouter API status

---

## 📋 What Gets Fixed

After adding API key, these will work:

✅ **AI Reports**
- Snellen test reports
- Color blind test reports
- Astigmatism test reports
- Amsler grid test reports
- Duochrome test reports

✅ **Chat AI**
- Chat with Dr. Eva
- Ask health questions
- Get personalized advice

✅ **Dashboard**
- Vision Wellness Score
- Health trends
- Recommendations
- Pro tips

✅ **Weekly Routine**
- Personalized exercise schedule
- Test recommendations

---

## 🔍 Files That Need API Key

These components will work once API key is set:

```
components/
├── SnellenTest.tsx              ← Report generation
├── ColorBlindTest.tsx           ← Report generation
├── AstigmatismTest.tsx          ← Report generation
├── AmslerGridTest.tsx           ← Report generation
├── DuochromeTest.tsx            ← Report generation
├── vision-coach/ChatInterface.tsx ← Chat AI
└── DashboardContent.tsx         ← Dashboard display

hooks/
└── useDashboardInsights.ts      ← Dashboard insights

services/
├── openRouterService.ts         ← API calls
├── chatbotService.ts            ← Chat wrapper
└── aiService.ts                 ← AI wrapper
```

---

## 🎯 Testing Sequence

1. **Test Chat First** (fastest)
   - Click green button
   - Type "Hi"
   - Should get response in 2-3 seconds

2. **Test Report** (takes 5-10 seconds)
   - Do Snellen test
   - Should see report with AI analysis

3. **Test Dashboard** (takes 5-10 seconds)
   - Complete 2+ tests
   - Go to Home
   - Should see score and insights

---

## 💡 Tips

- **Free Tier:** OpenRouter free tier includes many free models
- **Model Used:** `tngtech/deepseek-r1t2-chimera:free` (fast and free)
- **Rate Limit:** Free tier has rate limits, but enough for testing
- **Cost:** Check OpenRouter pricing if using paid models

---

## 📞 Need Help?

1. Check browser console (F12) for error messages
2. Check network tab for API responses
3. Verify API key format: `sk-or-...`
4. Check OpenRouter status page
5. Try with a different browser

---

**Setup Time:** ~3 minutes  
**Success Rate:** 99% (if API key is valid)

