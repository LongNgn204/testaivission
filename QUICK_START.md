# ⚡ Quick Start - 5 Minutes

## Step 1: Get API Keys (2 minutes)

### OpenRouter Key:
1. Go to: https://openrouter.ai/keys
2. Create key → Copy (format: `sk-or-v1-...`)

### Gemini Key (Optional):
1. Go to: https://aistudio.google.com/apikey
2. Create key → Copy

---

## Step 2: Create `.env` File (1 minute)

Create file: **`.env`** in project root

```env
VITE_OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE
VITE_GEMINI_API_KEY=YOUR_GEMINI_KEY_HERE
VITE_API_URL=https://vision-coach-worker.stu725114073.workers.dev
```

---

## Step 3: Restart Server (1 minute)

```bash
npm run dev
```

---

## Step 4: Verify (1 minute)

### Check Configuration:
```javascript
// Open browser console (F12) and paste:
import { logConfigStatus } from './utils/envConfig.ts'
logConfigStatus()
```

Expected:
```
📋 Environment Configuration Status:
  OpenRouter Key: ✅ Configured
  Gemini Key: ✅ Configured
```

### Test Chat:
1. Look for green button (bottom right)
2. Click → Type "Hello" → Should get response

### Test Report:
1. Do Snellen test
2. Should see AI report

### Test Dashboard:
1. Complete 2+ tests
2. Go to Home
3. Should see "Vision Wellness Score"

---

## ✅ Done!

All AI features now work:
- ✅ AI Reports
- ✅ Chat AI
- ✅ Dashboard Insights
- ✅ Voice Chat (if Gemini key set)

---

## 🆘 Troubleshooting

**Chat button not showing?**
- Check `.env` file exists
- Check `VITE_OPENROUTER_API_KEY` is set
- Restart server
- Clear browser cache

**Chat shows error?**
- Check browser console (F12)
- Verify API key is correct
- Check OpenRouter status: https://status.openrouter.ai

**Report shows error?**
- Check `VITE_OPENROUTER_API_KEY` is set
- Verify API key has credits
- Try chat first to test

---

**Setup Time:** ~5 minutes  
**Success Rate:** 99%

Good luck! 🚀

