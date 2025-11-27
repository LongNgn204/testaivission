/**
 * ============================================================
 * 🔐 Authentication Service
 * ============================================================
 * 
 * Handles all authentication-related API calls
 */

// Use localhost for development, change for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  name: string;
  age: string;
  phone: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    age: string;
    phone: string;
    loginTime: number;
    token: string;
  };
  error?: string;
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
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
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
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: token || '' }),
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

