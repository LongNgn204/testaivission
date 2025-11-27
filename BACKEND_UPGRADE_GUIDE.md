# 🚀 HƯỚNG DẪN NÂNG CẤP BACKEND VÀ ĐĂNG NHẬP

## ✅ ĐÃ HOÀN THÀNH

### 1. **Backend Server Nâng Cấp** ✓
- ✅ Thêm in-memory database simulation (MongoDB-like)
- ✅ Rate limiting để bảo vệ API (100 requests/phút)
- ✅ Session management với auto-cleanup (mỗi 5 phút)
- ✅ Enhanced JWT authentication với validation đầy đủ
- ✅ Request logging với màu sắc dễ đọc
- ✅ Metrics endpoint để monitor server
- ✅ Xác thực số điện thoại Việt Nam (0xxxxxxxxx)
- ✅ Track login history và user statistics

### 2. **Environment Configuration** ✓
File `.env.local` đã được cập nhật với:
```env
JWT_SECRET=vision-coach-secret-key-change-in-production-2024
VITE_API_URL=http://localhost:3001
PORT=3001
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://localhost:5174
RATE_LIMIT_WINDOW=60000
MAX_REQUESTS_PER_WINDOW=100
```

### 3. **Frontend Integration** ✓
- ✅ App.tsx đã chuyển sang sử dụng `LoginPageWithBackend`
- ✅ Auto-verify token khi app load
- ✅ Tự động đăng xuất khi token expired
- ✅ Sync auth state giữa các tabs

### 4. **Quick Start Scripts** ✓
- ✅ `start-backend.bat` - Script Windows để khởi động backend
- ✅ `run-backend.bat` - Alias script (nếu có)

---

## 🎯 CÁCH SỬ DỤNG

### Bước 1: Cài Đặt Dependencies

#### Backend
```powershell
# Nếu chưa có node_modules cho backend
npm install
```

#### Frontend (nếu cần)
```powershell
# Trong thư mục chính
npm install
```

### Bước 2: Khởi Động Backend

**Cách 1: Dùng Script (Khuyến nghị)**
```powershell
# Double click vào file start-backend.bat
# HOẶC chạy trong terminal:
.\start-backend.bat
```

**Cách 2: Manual**
```powershell
node server.js
```

**Cách 3: Development Mode (auto-reload)**
```powershell
npm run dev
```

### Bước 3: Khởi Động Frontend

```powershell
# Terminal mới
npm run dev
```

### Bước 4: Truy Cập Ứng Dụng

1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:3001
3. **Health Check**: http://localhost:3001/health
4. **Metrics**: http://localhost:3001/metrics

---

## 🔐 TÍNH NĂNG BACKEND MỚI

### 1. **Enhanced Authentication**
```javascript
POST /api/auth/login
{
  "name": "Nguyễn Văn A",
  "age": "28",
  "phone": "0912345678"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_0912345678",
    "name": "Nguyễn Văn A",
    "age": "28",
    "phone": "0912345678",
    "loginTime": 1732694400000,
    "loginCount": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. **Token Verification**
```javascript
POST /api/auth/verify
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "userId": "user_0912345678",
    "name": "Nguyễn Văn A",
    "phone": "0912345678",
    "age": "28",
    "loginCount": 1,
    "lastLogin": 1732694400000
  }
}
```

### 3. **Enhanced Logout**
```javascript
POST /api/auth/logout
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
OR
Body: {
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "success": true,
  "message": "Logout successful"
}
```

### 4. **Rate Limiting**
- 100 requests per minute per client IP
- Automatic reset after 1 minute
- Returns 429 status when limit exceeded

### 5. **Session Management**
- Auto-cleanup expired sessions every 5 minutes
- 7-day session duration
- Track last access time
- Support multiple devices

### 6. **Metrics Endpoint**
```javascript
GET /metrics

Response:
{
  "uptime": 3600,
  "memoryUsage": {...},
  "activeUsers": 5,
  "activeSessions": 3,
  "totalLogins": 12,
  "timestamp": "2025-11-27T10:00:00.000Z",
  "rateLimit": {
    "activeClients": 2
  }
}
```

---

## 🎨 LUỒNG ĐĂNG NHẬP MỚI

### Frontend Flow
```
1. User nhập thông tin → LoginPageWithBackend
2. Submit form → loginUser() trong authService
3. Backend xác thực → trả về token
4. Frontend lưu token → localStorage
5. Frontend lưu user_data → localStorage
6. Dispatch event 'userLoggedIn'
7. App.tsx verify token → auto-verify
8. Navigate to /home
```

### Backend Flow
```
1. Nhận request /api/auth/login
2. Validate input (name, age, phone)
3. Check phone format (Vietnamese)
4. Create/update user in database
5. Generate JWT token
6. Create session with expiration
7. Track login history
8. Return user + token
```

### Auto-Verify Flow
```
1. App.tsx mount
2. Check localStorage for user_data + token
3. Call verifyUserToken(token)
4. Backend verify JWT + check session
5. If valid: setAuthState('authenticated')
6. If invalid: clear data + setAuthState('guest')
```

---

## 📊 DATABASE STRUCTURE (In-Memory)

### Users Map
```javascript
users.set('user_0912345678', {
  id: 'user_0912345678',
  name: 'Nguyễn Văn A',
  age: '28',
  phone: '0912345678',
  createdAt: 1732694400000,
  updatedAt: 1732694400000,
  lastLogin: 1732694400000,
  loginCount: 1,
  ip: '::1'
})
```

### Sessions Map
```javascript
sessions.set('token_abc123...', {
  userId: 'user_0912345678',
  createdAt: 1732694400000,
  lastAccess: 1732694400000,
  expiresAt: 1733299200000,
  userAgent: 'Mozilla/5.0...',
  ip: '::1'
})
```

### Login History Map
```javascript
loginHistory.set('user_0912345678', [
  { timestamp: 1732694400000, ip: '::1' },
  { timestamp: 1732694500000, ip: '::1' }
])
```

---

## 🛡️ BẢO MẬT

### 1. **JWT Token**
- Secret key: Configured in .env.local
- Expiration: 7 days
- Payload: userId, name, phone, age

### 2. **CORS Protection**
- Allowed origins từ .env.local
- Credentials: true
- Strict origin checking

### 3. **Rate Limiting**
- Per-IP tracking
- 100 requests/minute
- Auto-reset window

### 4. **Input Validation**
- Name: min 2 characters
- Age: 5-120
- Phone: Vietnamese format (0xxxxxxxxx)

### 5. **Session Security**
- Auto-cleanup expired sessions
- Track last access
- Device/IP tracking

---

## 🧪 TESTING

### Test Backend Endpoints

```powershell
# Test Health Check
curl http://localhost:3001/health

# Test Login
curl -X POST http://localhost:3001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"name":"Test User","age":"25","phone":"0912345678"}'

# Test Verify Token
curl -X POST http://localhost:3001/api/auth/verify `
  -H "Content-Type: application/json" `
  -d '{"token":"YOUR_TOKEN_HERE"}'

# Test Metrics
curl http://localhost:3001/metrics
```

### Test Frontend Login
1. Mở http://localhost:5173
2. Click "Đăng nhập"
3. Nhập thông tin hoặc chọn demo account
4. Submit → kiểm tra console log
5. Verify redirect to /home

---

## 📝 LOGS

### Backend Console Logs (Có Màu)
```
🚀 Vision Coach Backend Server - Enhanced Edition
Server:      http://localhost:3001
Health:      http://localhost:3001/health
Gemini API:  ✅ Configured
JWT Secret:  ✅ Configured

[2025-11-27T10:00:00.000Z] POST /api/auth/login
✓ User logged in: Nguyễn Văn A (user_0912345678)

[2025-11-27T10:05:00.000Z] POST /api/auth/verify
[2025-11-27T10:10:00.000Z] POST /api/auth/logout
✓ User logged out: user_0912345678

✓ Cleaned 2 expired sessions
```

### Frontend Console Logs
```
✅ Token verified successfully
⚠️ Token verification failed, logging out
```

---

## 🔧 TROUBLESHOOTING

### Backend không khởi động
```powershell
# Check Node.js version
node --version  # Should be >= 18.0.0

# Check dependencies
npm install

# Check port 3001 availability
netstat -ano | findstr :3001
```

### Login failed
1. Check backend đang chạy: http://localhost:3001/health
2. Check console logs (backend + frontend)
3. Check .env.local có VITE_API_URL đúng
4. Check CORS origin trong .env.local

### Token verification failed
1. Check JWT_SECRET giống nhau giữa sessions
2. Clear localStorage và login lại
3. Check backend logs for errors
4. Restart backend server

### CORS errors
1. Check CORS_ORIGIN trong .env.local
2. Restart backend sau khi thay đổi .env
3. Check frontend đang chạy trên port nào

---

## 🎉 KẾT LUẬN

Backend và đăng nhập đã được nâng cấp hoàn toàn với:
- ✅ JWT Authentication
- ✅ Session Management
- ✅ Rate Limiting
- ✅ Auto Token Verification
- ✅ Enhanced Security
- ✅ Better Logging
- ✅ Database Simulation

**Sẵn sàng sử dụng!** 🚀

Chạy `.\start-backend.bat` để bắt đầu!
