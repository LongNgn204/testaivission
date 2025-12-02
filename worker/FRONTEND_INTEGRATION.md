# 🔌 Frontend Integration Guide

## Production API Endpoint

```
https://vision-coach-worker.stu725114073.workers.dev
```

---

## 🚀 Quick Setup

### 1. Update API Configuration

```typescript
// src/config/api.ts
export const API_CONFIG = {
  baseURL: 'https://vision-coach-worker.stu725114073.workers.dev',
  timeout: 30000,
};
```

### 2. API Service Example

```typescript
// src/services/backend.ts
const BASE_URL = 'https://vision-coach-worker.stu725114073.workers.dev';

// Authentication
export async function login(name: string, age: number, phone: string) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, age, phone })
  });
  
  if (!response.ok) throw new Error('Login failed');
  return response.json(); // { success: true, user: { id, name, token } }
}

export async function verifyToken(token: string) {
  const response = await fetch(`${BASE_URL}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  return response.json();
}

export async function logout(token: string) {
  const response = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}

// Test Results
export async function saveTestResult(token: string, testData: {
  testType: string;
  testData: any;
  score?: number;
  result?: string;
  duration?: number;
}) {
  const response = await fetch(`${BASE_URL}/api/tests/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(testData)
  });
  return response.json();
}

export async function getTestHistory(token: string, limit = 100, offset = 0) {
  const response = await fetch(
    `${BASE_URL}/api/tests/history?limit=${limit}&offset=${offset}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return response.json();
}

// AI Services
export async function generateReport(
  testType: string,
  testData: any,
  history: any[],
  language: 'vi' | 'en'
) {
  const response = await fetch(`${BASE_URL}/api/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testType, testData, history, language })
  });
  return response.json();
}

export async function getDashboardInsights(history: any[], language: 'vi' | 'en') {
  const response = await fetch(`${BASE_URL}/api/dashboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, language })
  });
  return response.json();
}

export async function chatWithAI(
  message: string,
  language: 'vi' | 'en',
  lastTestResult?: any
) {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, language, lastTestResult })
  });
  return response.json();
}

export async function generateRoutine(
  answers: {
    worksWithComputer: string;
    wearsGlasses: string;
    goal: string;
  },
  language: 'vi' | 'en'
) {
  const response = await fetch(`${BASE_URL}/api/routine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, language })
  });
  return response.json();
}
```

---

## 📝 API Response Types

```typescript
// Auth Response
interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    age: number;
    phone: string;
    loginTime: number;
    token: string;
  };
}

// Test Save Response
interface SaveTestResponse {
  success: boolean;
  message: string;
  testResult?: {
    id: string;
    testType: string;
    score?: number;
    result?: string;
    timestamp: number;
  };
}

// History Response
interface HistoryResponse {
  success: boolean;
  message: string;
  history: Array<{
    id: string;
    testType: string;
    testData: any;
    score?: number;
    result?: string;
    timestamp: number;
    duration?: number;
  }>;
  total: number;
  limit: number;
  offset: number;
}
```

---

## 🔐 Authentication Flow

```typescript
// 1. Login
const loginResponse = await login("Nguyen Van A", 25, "0912345678");
const token = loginResponse.user.token;

// 2. Store token
localStorage.setItem('authToken', token);

// 3. Use token for authenticated requests
const testResponse = await saveTestResult(token, {
  testType: 'snellen',
  testData: { leftEye: '20/20', rightEye: '20/25' },
  score: 95
});

// 4. Logout
await logout(token);
localStorage.removeItem('authToken');
```

---

## ⚠️ Error Handling

```typescript
async function safeApiCall<T>(apiFunction: () => Promise<T>): Promise<T> {
  try {
    return await apiFunction();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error - please check your connection');
    }
    throw error;
  }
}

// Usage
try {
  const response = await safeApiCall(() => login(name, age, phone));
  if (response.success) {
    // Handle success
  } else {
    // Handle API error
    console.error(response.message);
  }
} catch (error) {
  // Handle network error
  console.error(error.message);
}
```

---

## 🎯 React Hook Example

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import * as api from '../services/backend';

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('authToken')
  );
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.verifyToken(token)
        .then(response => {
          if (response.success) {
            setUser(response.user);
          } else {
            setToken(null);
            localStorage.removeItem('authToken');
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (name: string, age: number, phone: string) => {
    const response = await api.login(name, age, phone);
    if (response.success) {
      setToken(response.user.token);
      setUser(response.user);
      localStorage.setItem('authToken', response.user.token);
    }
    return response;
  };

  const logout = async () => {
    if (token) {
      await api.logout(token);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return { token, user, loading, login, logout };
}
```

---

## 📊 Usage Example in Component

```typescript
// pages/TestPage.tsx
import { useAuth } from '../hooks/useAuth';
import { saveTestResult } from '../services/backend';

function TestPage() {
  const { token, user } = useAuth();

  const handleTestComplete = async (testData: any) => {
    if (!token) {
      alert('Please login first');
      return;
    }

    try {
      const response = await saveTestResult(token, {
        testType: 'snellen',
        testData,
        score: calculateScore(testData),
        duration: testDuration
      });

      if (response.success) {
        console.log('Test saved:', response.testResult);
        // Show success message
      }
    } catch (error) {
      console.error('Failed to save test:', error);
      // Show error message
    }
  };

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      {/* Your test UI */}
    </div>
  );
}
```

---

## 🧪 Testing

```typescript
// Test in browser console
const BASE = 'https://vision-coach-worker.stu725114073.workers.dev';

// 1. Health check
fetch(`${BASE}/health`).then(r => r.json()).then(console.log);

// 2. Login
fetch(`${BASE}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Test', age: 25, phone: '0912345678' })
}).then(r => r.json()).then(console.log);

// 3. Save test (replace TOKEN)
fetch(`${BASE}/api/tests/save`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    testType: 'snellen',
    testData: { leftEye: '20/20' },
    score: 95
  })
}).then(r => r.json()).then(console.log);
```

---

## ✅ Checklist

- [ ] Update API base URL in config
- [ ] Implement authentication flow
- [ ] Add token storage (localStorage/sessionStorage)
- [ ] Add error handling
- [ ] Test all endpoints
- [ ] Add loading states
- [ ] Implement auto-retry for failed requests
- [ ] Add request timeout handling
- [ ] Test on production

---

## 🚀 Ready to Connect!

Production backend is live at:
**https://vision-coach-worker.stu725114073.workers.dev**

All endpoints are working and tested. Happy coding! 🎉
