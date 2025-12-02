/**
 * ============================================================
 * 🔐 Authentication Service
 * ============================================================
 * 
 * Handles all authentication-related API calls
 */

// Use localhost for development, change for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Generic fetch with retry, timeout, and 5xx backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const {
    timeoutMs = 15000, // default 15s
    ...rest
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...rest, signal: controller.signal });
      clearTimeout(timer);

      // Retry on 5xx; don't retry on 4xx
      if (res.status >= 500 && attempt < 2) {
        const delay = Math.pow(2, attempt) * 500; // 0.5s, 1s
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      return res;
    } catch (e) {
      clearTimeout(timer);
      lastError = e;
      if (attempt < 2) {
        const delay = Math.pow(2, attempt) * 500;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
    }
  }
  throw lastError || new Error('Network error');
}

// Helper function to get auth token from headers
function getAuthHeader(): Record<string, string> {
  const token = getAuthToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
  return {};
}

export interface LoginRequest {
  name?: string;
  age?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export interface RegisterRequest {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  age?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    age?: string;
    loginTime: number;
    token: string;
  };
  error?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    age?: string;
    token: string;
  };
  error?: string;
}

export interface PasswordValidation {
  valid: boolean;
  errors: string[];
}

export interface VerifyTokenResponse {
  success: boolean;
  message: string;
  user?: {
    userId: string;
    phone: string;
    name: string;
    age: string;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * Login user with credentials
 */
export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json() as LoginResponse;

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Login failed',
        error: data.error,
      };
    }

    return data;
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
      error: error.message,
    };
  }
}

/**
 * Verify user token
 */
export async function verifyUserToken(token: string): Promise<VerifyTokenResponse> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json() as VerifyTokenResponse;

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Token verification failed',
      };
    }

    return data;
  } catch (error: any) {
    console.error('Token verification error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
}

/**
 * Logout user
 */
export async function logoutUser(token?: string): Promise<LogoutResponse> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({}),
    });

    const data = await response.json() as LogoutResponse;

    if (!response.ok) {
      return {
        success: false,
        message: 'Logout failed',
      };
    }

    return data;
  } catch (error: any) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
}

/**
 * Get stored auth token
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error reading auth token:', error);
    return null;
  }
}

/**
 * Save auth token
 */
export function saveAuthToken(token: string): void {
  try {
    localStorage.setItem('auth_token', token);
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
}

/**
 * Clear auth token
 */
export function clearAuthToken(): void {
  try {
    localStorage.removeItem('auth_token');
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  const result = await verifyUserToken(token);
  return result.success;
}

/**
 * Register new user
 */
export async function registerUser(credentials: RegisterRequest): Promise<RegisterResponse> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json() as RegisterResponse;

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Registration failed',
        error: data.error,
      };
    }

    return data;
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
      error: error.message,
    };
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Vietnamese format: 0xxx xxx xxxx)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate password strength (optional - only validate if provided)
 */
export function validatePassword(password: string | undefined): PasswordValidation {
  const errors: string[] = [];

  // If password is not provided, it's valid (password is optional)
  if (!password) {
    return {
      valid: true,
      errors: [],
    };
  }

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }


  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Test Result interfaces
 */
export interface TestResultData {
  testType: string;
  testData: any;
  score?: number;
  result?: string;
}

export interface TestResultResponse {
  id: string;
  testType: string;
  testData: any;
  score?: number;
  result?: string;
  timestamp: number;
}

export interface SaveTestResultResponse {
  success: boolean;
  message: string;
  testResult?: TestResultResponse;
  queued?: boolean;
  error?: string;
}

export interface GetTestHistoryResponse {
  success: boolean;
  message: string;
  history: TestResultResponse[];
  total?: number;
  limit?: number;
  offset?: number;
  error?: string;
}

/**
 * Save test result to backend
 */
const OFFLINE_QUEUE_KEY = 'offline_test_queue';

function enqueueOfflineTest(testData: TestResultData) {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ testData, ts: Date.now() });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(arr));
  } catch {}
}

export async function processOfflineQueue(): Promise<number> {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    const arr: Array<{ testData: TestResultData; ts: number }> = raw ? JSON.parse(raw) : [];
    if (!arr.length) return 0;
    const remaining: typeof arr = [];
    for (const item of arr) {
      try {
        const res = await fetchWithRetry(`${API_BASE_URL}/api/tests/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(item.testData),
        });
        if (!res.ok) throw new Error('Failed');
        // success -> skip
      } catch {
        remaining.push(item); // keep in queue
        break; // stop early, likely still offline
      }
    }
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    return arr.length - remaining.length;
  } catch {
    return 0;
  }
}

export async function saveTestResult(testData: TestResultData): Promise<SaveTestResultResponse> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/tests/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json() as SaveTestResultResponse;

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to save test result',
        error: data.error,
      };
    }

    return data;
  } catch (error: any) {
    // If offline, queue and return queued=true
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      enqueueOfflineTest(testData);
      return { success: true, message: 'Queued offline', queued: true };
    }
    console.error('Save test result error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
      error: error.message,
    };
  }
}

/**
 * Get test history from backend
 */
export async function getTestHistory(userId: string, limit: number = 100, offset: number = 0): Promise<GetTestHistoryResponse> {
  try {
    const url = `${API_BASE_URL}/api/tests/history?limit=${encodeURIComponent(String(limit))}&offset=${encodeURIComponent(String(offset))}`;
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json() as GetTestHistoryResponse;

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to get test history',
        history: [],
        error: data.error,
      };
    }

    return data;
  } catch (error: any) {
    console.error('Get test history error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
      history: [],
      error: error.message,
    };
  }
}

