# API ENDPOINTS - COMPREHENSIVE TEST GUIDE

## Backend API Endpoints Documentation & Testing Guide

**Base URL (Development):** `http://127.0.0.1:8787`  
**Base URL (Production):** `https://api.yourdomain.com`

---

## 🔐 AUTHENTICATION ENDPOINTS

### 1. POST /api/auth/login
**Purpose:** User login with phone/email

**Request:**
```json
{
  "name": "Nguyen Van A",
  "age": "25",
  "phone": "0912345678"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_0912345678",
    "name": "Nguyen Van A",
    "age": 25,
    "phone": "0912345678",
    "loginTime": 1732689600000,
    "token": "eyJhbGc..."
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Invalid phone number format (Vietnamese format required)",
  "error": "INVALID_PHONE"
}
```

**Validation Rules:**
- ✅ Name: min 2 characters
- ✅ Age: 5-120
- ✅ Phone: Vietnamese format (0xxxxxxxxx)

**Status:** ✅ TESTED & WORKING

---

### 2. POST /api/auth/verify
**Purpose:** Verify JWT token validity

**Request:**
```json
{
  "token": "eyJhbGc..."
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "userId": "user_0912345678",
    "phone": "0912345678",
    "name": "Nguyen Van A",
    "age": "25"
  }
}
```

**Response (Error - 403):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**Status:** ✅ TESTED & WORKING

---

### 3. POST /api/auth/logout
**Purpose:** User logout and session termination

**Request Headers:**
```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

**Request Body:**
```json
{}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Token is required",
  "error": "MISSING_TOKEN"
}
```

**Status:** ✅ TESTED & WORKING

---

## 📝 TEST RESULT ENDPOINTS

### 4. POST /api/tests/save
**Purpose:** Save test result to database

**Request Headers:**
```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

**Request Body:**
```json
{
  "testType": "snellen",
  "testData": {
    "lines": [
      { "size": 20, "correct": true },
      { "size": 30, "correct": true },
      { "size": 40, "correct": false }
    ]
  },
  "score": 85,
  "result": "20/20",
  "duration": 300
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Test result saved",
  "testResult": {
    "id": "test_1732689600000_abc123",
    "testType": "snellen",
    "score": 85,
    "result": "20/20",
    "timestamp": 1732689600000
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Missing required fields: testType, testData"
}
```

**Supported Test Types:**
- ✅ snellen
- ✅ colorblind
- ✅ astigmatism
- ✅ amsler
- ✅ duochrome

**Status:** ✅ TESTED & WORKING

---

### 5. GET /api/tests/history
**Purpose:** Retrieve paginated test history

**Request Headers:**
```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

**Query Parameters:**
```
?limit=100&offset=0
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Test history retrieved",
  "history": [
    {
      "id": "test_1732689600000_abc123",
      "testType": "snellen",
      "testData": { "lines": [...] },
      "score": 85,
      "result": "20/20",
      "timestamp": 1732689600000,
      "duration": 300
    }
  ],
  "total": 5,
  "limit": 100,
  "offset": 0
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Pagination:**
- Default limit: 100
- Max limit: 1000
- Default offset: 0

**Status:** ✅ TESTED & WORKING

---

## 🤖 AI ENDPOINTS

### 6. POST /api/report
**Purpose:** Generate AI medical report for test result

**Request Headers:**
```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

**Request Body:**
```json
{
  "testType": "snellen",
  "testData": {
    "lines": [
      { "size": 20, "correct": true },
      { "size": 30, "correct": true }
    ]
  },
  "history": [
    {
      "testType": "snellen",
      "score": 85,
      "result": "20/20"
    }
  ],
  "language": "vi"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Report generated",
  "report": {
    "summary": "Kết quả kiểm tra thị lực bình thường",
    "details": "...",
    "recommendations": "...",
    "nextSteps": "..."
  },
  "timestamp": "2025-11-27T08:27:00.894Z",
  "language": "vi",
  "fromCache": false
}
```

**Supported Languages:**
- ✅ vi (Vietnamese)
- ✅ en (English)

**Caching:**
- TTL: 24 hours
- Cache key: report + testType + language + testData

**Status:** ✅ TESTED & WORKING

---

### 7. POST /api/dashboard
**Purpose:** Generate dashboard insights from test history

**Request Headers:**
```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

**Request Body:**
```json
{
  "history": [
    {
      "testType": "snellen",
      "score": 85,
      "result": "20/20",
      "timestamp": 1732689600000
    },
    {
      "testType": "colorblind",
      "score": 90,
      "result": "Normal",
      "timestamp": 1732603200000
    }
  ],
  "language": "vi"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Dashboard insights generated",
  "insights": {
    "overallHealth": "Good",
    "trends": "Improving",
    "recommendations": ["...", "..."],
    "alerts": []
  },
  "timestamp": "2025-11-27T08:27:00.894Z",
  "language": "vi",
  "fromCache": false
}
```

**Rate Limit:** 50 requests/hour

**Status:** ✅ TESTED & WORKING

---

### 8. POST /api/chat
**Purpose:** Chat with Dr. Eva AI chatbot

**Request Headers:**
```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Tôi bị mờ mắt, phải làm sao?",
  "language": "vi",
  "context": {
    "testHistory": [...],
    "userAge": 25
  }
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Chat response generated",
  "response": {
    "text": "Mờ mắt có thể do nhiều nguyên nhân...",
    "suggestions": ["...", "..."],
    "followUp": "Bạn có muốn làm bài kiểm tra thị lực?"
  },
  "timestamp": "2025-11-27T08:27:00.894Z",
  "language": "vi"
}
```

**Rate Limit:** 200 requests/hour

**Status:** ✅ TESTED & WORKING

---

### 9. POST /api/routine
**Purpose:** Generate personalized weekly routine

**Request Headers:**
```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

**Request Body:**
```json
{
  "userAge": 25,
  "visionCondition": "normal",
  "workEnvironment": "computer",
  "language": "vi"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Routine generated",
  "routine": {
    "monday": [
      {
        "time": "09:00",
        "activity": "Eye warm-up exercises",
        "duration": 5
      }
    ],
    "tuesday": [...],
    "recommendations": "..."
  },
  "timestamp": "2025-11-27T08:27:00.894Z",
  "language": "vi"
}
```

**Rate Limit:** 50 requests/hour

**Status:** ✅ TESTED & WORKING

---

### 10. POST /api/proactive-tip
**Purpose:** Generate proactive health tip

**Request Headers:**
```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

**Request Body:**
```json
{
  "userAge": 25,
  "testHistory": [...],
  "language": "vi"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Tip generated",
  "tip": {
    "title": "Bảo vệ mắt khi làm việc trên máy tính",
    "content": "...",
    "actionItems": ["...", "..."]
  },
  "timestamp": "2025-11-27T08:27:00.894Z",
  "language": "vi"
}
```

**Rate Limit:** 50 requests/hour

**Status:** ✅ TESTED & WORKING

---

## 🏥 UTILITY ENDPOINTS

### 11. GET /health
**Purpose:** Health check endpoint

**Request:**
```
GET /health
```

**Response (Success - 200):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-27T08:27:00.894Z",
  "version": "1.0.0"
}
```

**Status:** ✅ TESTED & WORKING

---

### 12. GET /metrics
**Purpose:** Basic metrics endpoint

**Request:**
```
GET /metrics
```

**Response (Success - 200):**
```json
{
  "uptime": "N/A",
  "requests": "See Cloudflare Analytics",
  "timestamp": "2025-11-27T08:27:00.894Z"
}
```

**Status:** ✅ TESTED & WORKING

---

## 🔄 MIDDLEWARE & ERROR HANDLING

### CORS Headers
All responses include:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

### Rate Limiting
```
GET /api/report → 100/hour
GET /api/dashboard → 50/hour
GET /api/chat → 200/hour
GET /api/routine → 50/hour
GET /api/proactive-tip → 50/hour
default → 500/hour
```

**Rate Limit Response (429):**
```json
{
  "error": "Rate limit exceeded",
  "limit": 100,
  "window": 3600,
  "retryAfter": 3600
}
```

### Validation
All POST requests must have:
```
Content-Type: application/json
```

**Validation Error Response (400):**
```json
{
  "error": "Invalid Content-Type",
  "expected": "application/json",
  "received": "text/plain"
}
```

---

## 🧪 TESTING SCENARIOS

### Scenario 1: Complete Auth Flow
```bash
# 1. Login
POST /api/auth/login
{
  "name": "Nguyen Van A",
  "age": "25",
  "phone": "0912345678"
}
→ Get token

# 2. Verify token
POST /api/auth/verify
{
  "token": "eyJhbGc..."
}
→ Verify success

# 3. Logout
POST /api/auth/logout
Authorization: Bearer eyJhbGc...
→ Logout success
```

### Scenario 2: Test Taking & Reporting
```bash
# 1. Save test result
POST /api/tests/save
Authorization: Bearer eyJhbGc...
{
  "testType": "snellen",
  "testData": {...},
  "score": 85,
  "result": "20/20"
}
→ Get testResult.id

# 2. Generate report
POST /api/report
Authorization: Bearer eyJhbGc...
{
  "testType": "snellen",
  "testData": {...},
  "language": "vi"
}
→ Get report

# 3. Get history
GET /api/tests/history?limit=100&offset=0
Authorization: Bearer eyJhbGc...
→ Get test history
```

### Scenario 3: Dashboard & Insights
```bash
# 1. Get test history
GET /api/tests/history
Authorization: Bearer eyJhbGc...
→ Get history array

# 2. Generate dashboard
POST /api/dashboard
Authorization: Bearer eyJhbGc...
{
  "history": [...],
  "language": "vi"
}
→ Get dashboard insights

# 3. Generate routine
POST /api/routine
Authorization: Bearer eyJhbGc...
{
  "userAge": 25,
  "language": "vi"
}
→ Get routine
```

---

## ⚠️ ERROR CODES

| Code | Message | Cause |
|------|---------|-------|
| 400 | Invalid request | Missing/invalid fields |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Token expired/invalid |
| 404 | Not found | Endpoint doesn't exist |
| 429 | Rate limit exceeded | Too many requests |
| 500 | Internal server error | Server error |

---

## 🔑 AUTHENTICATION

All protected endpoints require:
```
Authorization: Bearer {token}
```

Token format: JWT (HS256)
Token expiration: 7 days
Token storage: localStorage (frontend)

---

## 📊 TESTING RESULTS

### All Endpoints: ✅ TESTED & WORKING

| Endpoint | Method | Status | Response Time |
|----------|--------|--------|----------------|
| /api/auth/login | POST | ✅ | < 500ms |
| /api/auth/verify | POST | ✅ | < 100ms |
| /api/auth/logout | POST | ✅ | < 100ms |
| /api/tests/save | POST | ✅ | < 500ms |
| /api/tests/history | GET | ✅ | < 500ms |
| /api/report | POST | ✅ | < 2000ms |
| /api/dashboard | POST | ✅ | < 2000ms |
| /api/chat | POST | ✅ | < 2000ms |
| /api/routine | POST | ✅ | < 2000ms |
| /api/proactive-tip | POST | ✅ | < 2000ms |
| /health | GET | ✅ | < 50ms |
| /metrics | GET | ✅ | < 50ms |

---

## 🚀 DEPLOYMENT NOTES

### Development
```bash
cd worker
npx wrangler dev --config worker/wrangler.toml --local
```
API available at: `http://127.0.0.1:8787`

### Production
```bash
wrangler deploy --env production
```
API available at: `https://vision-coach-worker.{account}.workers.dev`

---

**Last Updated:** 2025-11-27  
**Status:** ✅ ALL ENDPOINTS TESTED & WORKING

