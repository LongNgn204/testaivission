# QUICK START TESTING GUIDE

## Vision Coach - How to Run & Test Everything

**Time Required:** 15 minutes  
**Difficulty:** Easy  
**Status:** ✅ READY TO TEST

---

## 🚀 QUICK START (5 MINUTES)

### Step 1: Start Backend (Cloudflare Worker)
```bash
cd D:\git\test\worker
npx wrangler dev --config worker/wrangler.toml --local
```

**Expected Output:**
```
⛅️ wrangler 4.51.0
👂 Listening on http://127.0.0.1:8787
```

✅ Backend is running at: `http://127.0.0.1:8787`

---

### Step 2: Start Frontend (React)
```bash
cd D:\git\test
npm run dev
```

**Expected Output:**
```
VITE v6.4.1 ready in 123 ms

➜  Local:   http://localhost:5173/
```

✅ Frontend is running at: `http://localhost:5173`

---

### Step 3: Open in Browser
```
http://localhost:5173
```

✅ You should see the Welcome Page

---

## 🧪 TESTING SCENARIOS (10 MINUTES)

### Test 1: Authentication Flow (2 minutes)

#### 1.1 Login
```
1. Click "Get Started" button
2. Select "Login" tab
3. Enter phone: 0912345678
4. Click "Login" button
5. ✅ Should redirect to /home
```

#### 1.2 Verify Token
```
1. Check browser console
2. Should see: "✅ Token verified successfully"
3. ✅ User data should be in localStorage
```

#### 1.3 Logout
```
1. Click user menu (top right)
2. Click "Logout"
3. ✅ Should redirect to /login
4. ✅ localStorage should be cleared
```

---

### Test 2: Vision Tests (3 minutes)

#### 2.1 Snellen Test
```
1. Click "Snellen Test" card
2. Read instructions
3. Click "Start Test"
4. Click letters you can see
5. Complete all lines
6. ✅ Should show score and result
7. ✅ Should save to backend
```

#### 2.2 Color Blind Test
```
1. Click "Color Blind Test" card
2. Read instructions
3. Click "Start Test"
4. Enter numbers you see
5. Complete all plates
6. ✅ Should show result
7. ✅ Should save to backend
```

#### 2.3 Other Tests
- ✅ Astigmatism Test
- ✅ Amsler Grid Test
- ✅ Duochrome Test

---

### Test 3: Test History (2 minutes)

#### 3.1 View History
```
1. Click "History" in menu
2. ✅ Should show list of tests
3. ✅ Should show test type, date, score
4. ✅ Should show pagination
```

#### 3.2 View Details
```
1. Click on a test
2. ✅ Should show full details
3. ✅ Should show report
4. ✅ Should show recommendations
```

---

### Test 4: AI Features (2 minutes)

#### 4.1 Dashboard Insights
```
1. Go to Home page
2. Scroll down to "Dashboard"
3. ✅ Should show insights
4. ✅ Should show trends
5. ✅ Should show recommendations
```

#### 4.2 Chat with Dr. Eva
```
1. Click chat icon (bottom right)
2. Type: "Tôi bị mờ mắt"
3. Press Enter
4. ✅ Should get AI response
5. ✅ Should show suggestions
```

#### 4.3 Routine
```
1. Go to "Reminders" page
2. Click "Generate Routine"
3. ✅ Should show weekly schedule
4. ✅ Should show daily activities
```

---

## 🔧 TESTING WITH CURL

### Test Backend Directly

#### 1. Login
```bash
curl -X POST http://127.0.0.1:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyen Van A",
    "age": "25",
    "phone": "0912345678"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_0912345678",
    "name": "Nguyen Van A",
    "age": 25,
    "phone": "0912345678",
    "token": "eyJhbGc..."
  }
}
```

#### 2. Verify Token
```bash
curl -X POST http://127.0.0.1:8787/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGc..."
  }'
```

#### 3. Save Test Result
```bash
curl -X POST http://127.0.0.1:8787/api/tests/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "testType": "snellen",
    "testData": {
      "lines": [
        {"size": 20, "correct": true}
      ]
    },
    "score": 85,
    "result": "20/20"
  }'
```

#### 4. Get Test History
```bash
curl -X GET "http://127.0.0.1:8787/api/tests/history?limit=10&offset=0" \
  -H "Authorization: Bearer eyJhbGc..."
```

#### 5. Generate Report
```bash
curl -X POST http://127.0.0.1:8787/api/report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "testType": "snellen",
    "testData": {"lines": [{"size": 20, "correct": true}]},
    "language": "vi"
  }'
```

---

## 🐛 DEBUGGING

### Check Browser Console
```
Press: F12 or Ctrl+Shift+I
Tab: Console
```

**Look for:**
- ✅ No red errors
- ✅ No warnings
- ✅ "✅ Token verified successfully"

### Check Network Tab
```
Press: F12
Tab: Network
```

**Look for:**
- ✅ All requests: 200 OK
- ✅ No 401 errors
- ✅ No 500 errors

### Check Application Tab
```
Press: F12
Tab: Application → Storage → Local Storage
```

**Look for:**
- ✅ `auth_token` - JWT token
- ✅ `user_data` - User info
- ✅ `test_history_*` - Test history

---

## 🔍 COMMON ISSUES & FIXES

### Issue: Backend not starting
```
Error: Port 8787 already in use
```

**Fix:**
```bash
# Kill process on port 8787
lsof -ti:8787 | xargs kill -9

# Or use different port
npx wrangler dev --port 8788
```

---

### Issue: Frontend can't connect to backend
```
Error: Network error. Please try again.
```

**Fix:**
```bash
# Check if backend is running
curl http://127.0.0.1:8787/health

# Check VITE_API_URL in frontend
# Should be: http://127.0.0.1:8787
```

---

### Issue: Token verification fails
```
Error: Invalid or expired token
```

**Fix:**
```bash
# Get new token
curl -X POST http://127.0.0.1:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "age": "25", "phone": "0912345678"}'

# Use new token
```

---

### Issue: Rate limit exceeded
```
Error: Rate limit exceeded (429)
```

**Fix:**
```bash
# Wait 1 hour for limit to reset
# Or restart backend to reset KV cache
```

---

## 📊 PERFORMANCE TESTING

### Measure Page Load Time
```javascript
// Open browser console and run:
console.time('pageLoad');
// ... do something ...
console.timeEnd('pageLoad');
```

**Expected:**
- ✅ Initial load: < 2 seconds
- ✅ Lazy load: < 1 second

---

### Measure API Response Time
```bash
# Using curl with timing
curl -w "Time: %{time_total}s\n" \
  http://127.0.0.1:8787/api/tests/history
```

**Expected:**
- ✅ Auth endpoints: < 100ms
- ✅ Test endpoints: < 500ms
- ✅ AI endpoints: < 2000ms

---

## 🎯 FULL TEST CHECKLIST

### Authentication ✅
- [ ] Login with phone
- [ ] Login with email
- [ ] Register account
- [ ] Verify token
- [ ] Logout
- [ ] Token expiration
- [ ] Multi-tab sync

### Tests ✅
- [ ] Snellen test
- [ ] Color blind test
- [ ] Astigmatism test
- [ ] Amsler grid test
- [ ] Duochrome test
- [ ] Save test result
- [ ] View test history

### AI Features ✅
- [ ] Generate report
- [ ] Dashboard insights
- [ ] Chat with Dr. Eva
- [ ] Generate routine
- [ ] Proactive tips

### UI/UX ✅
- [ ] Dark/Light theme toggle
- [ ] Language toggle (vi/en)
- [ ] Responsive design (mobile)
- [ ] Loading states
- [ ] Error messages
- [ ] Success messages

### Error Handling ✅
- [ ] Network error
- [ ] API error (400)
- [ ] API error (401)
- [ ] API error (500)
- [ ] Validation error
- [ ] Rate limit error

### Offline Support ✅
- [ ] Take test offline
- [ ] Queue test result
- [ ] Sync when online
- [ ] View cached history

---

## 🚀 DEPLOYMENT TESTING

### Build Frontend
```bash
cd D:\git\test
npm run build
```

**Expected:**
```
✓ 1981 modules transformed.
✓ built in 57.58s
```

### Build Backend
```bash
cd D:\git\test\worker
npm run build
```

**Expected:**
```
> tsc
(no errors)
```

---

## 📝 TEST REPORT TEMPLATE

```
Date: 2025-11-27
Tester: [Your Name]
Build: [Version]

AUTHENTICATION:
  - Login: ✅ PASS / ❌ FAIL
  - Register: ✅ PASS / ❌ FAIL
  - Logout: ✅ PASS / ❌ FAIL

TESTS:
  - Snellen: ✅ PASS / ❌ FAIL
  - Color Blind: ✅ PASS / ❌ FAIL
  - Astigmatism: ✅ PASS / ❌ FAIL
  - Amsler: ✅ PASS / ❌ FAIL
  - Duochrome: ✅ PASS / ❌ FAIL

AI FEATURES:
  - Report: ✅ PASS / ❌ FAIL
  - Dashboard: ✅ PASS / ❌ FAIL
  - Chat: ✅ PASS / ❌ FAIL
  - Routine: ✅ PASS / ❌ FAIL

OVERALL: ✅ PASS / ❌ FAIL
NOTES: [Any issues found]
```

---

## 🎓 LEARNING RESOURCES

### Backend (Cloudflare Workers)
- Wrangler CLI: https://developers.cloudflare.com/workers/cli-wrangler/
- D1 Database: https://developers.cloudflare.com/d1/
- KV Storage: https://developers.cloudflare.com/kv/

### Frontend (React)
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com

### AI (Google Gemini)
- Gemini API: https://ai.google.dev
- Documentation: https://ai.google.dev/docs

---

## 📞 SUPPORT

### Need Help?
1. Check browser console (F12)
2. Check network tab (F12 → Network)
3. Check backend logs (terminal)
4. Check error messages (UI)

### Common Commands
```bash
# Start backend
cd worker && npx wrangler dev

# Start frontend
npm run dev

# Build frontend
npm run build

# Build backend
cd worker && npm run build

# Check backend health
curl http://127.0.0.1:8787/health
```

---

## ✅ VERIFICATION CHECKLIST

Before considering testing complete:

- [ ] Backend builds without errors
- [ ] Frontend builds without errors
- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] Can login with phone number
- [ ] Can take a vision test
- [ ] Can view test history
- [ ] Can see AI report
- [ ] Can chat with Dr. Eva
- [ ] Dark mode works
- [ ] Language toggle works
- [ ] No console errors
- [ ] No console warnings
- [ ] All API endpoints respond
- [ ] Error handling works

**If all checked: ✅ READY FOR PRODUCTION**

---

**Last Updated:** 2025-11-27  
**Status:** ✅ READY TO TEST

