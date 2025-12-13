/**
 * ========================================
 * AUTHENTICATION SERVICE
 * ========================================
 * Xử lý xác thực người dùng
 * Tuân thủ TypeScript strict mode
 */

import { createApiClient } from './apiClient';
import { validateInput, UserAuthSchema, type UserAuthInput } from '../utils/validation';
import { AuthenticationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../utils/config';

export interface User {
  id: string;
  name: string;
  phone: string;
  age: number;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

/**
 * Authentication service
 */
class AuthService {
  private api = createApiClient(config.apiUrl);
  private tokenKey = 'vision_coach_token';
  private userKey = 'user_data';

  /**
   * Login user
   */
  async login(input: UserAuthInput): Promise<AuthResponse> {
    try {
      // Validate input
      const validated = validateInput(UserAuthSchema, input, 'Login input');

      logger.info('Attempting login', { phone: validated.phone }, 'AuthService');

      // Call API
      const response = await this.api.post<AuthResponse>('/api/auth/login', validated);

      if (!response.success || !response.token || !response.user) {
        throw new AuthenticationError('Login failed: Invalid response');
      }

      // Store token and user data
      this.setToken(response.token);
      this.setUser(response.user);

      logger.info('Login successful', { userId: response.user.id }, 'AuthService');

      // Dispatch event for other tabs
      window.dispatchEvent(new Event('userLoggedIn'));

      return response;
    } catch (error) {
      logger.error('Login failed', error, 'AuthService');
      throw error;
    }
  }

  /**
   * Verify token with backend
   */
  async verifyToken(token: string): Promise<{ success: boolean; user?: User }> {
    try {
      const response = await this.api.post<{ success: boolean; user?: User }>(
        '/api/auth/verify',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      return response;
    } catch (error) {
      logger.warn('Token verification failed', error, 'AuthService');
      return { success: false };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await this.api.post(
          '/api/auth/logout',
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      logger.warn('Logout API call failed', error, 'AuthService');
    } finally {
      // Clear local data regardless of API result
      this.clearToken();
      this.clearUser();

      logger.info('User logged out', {}, 'AuthService');

      // Dispatch event
      window.dispatchEvent(new Event('userLoggedOut'));
    }
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      logger.warn('Failed to get token from localStorage', error, 'AuthService');
      return null;
    }
  }

  /**
   * Set token
   */
  private setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      logger.error('Failed to set token in localStorage', error, 'AuthService');
    }
  }

  /**
   * Clear token
   */
  private clearToken(): void {
    try {
      localStorage.removeItem(this.tokenKey);
    } catch (error) {
      logger.warn('Failed to clear token from localStorage', error, 'AuthService');
    }
  }

  /**
   * Get stored user
   */
  getUser(): User | null {
    try {
      const data = localStorage.getItem(this.userKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.warn('Failed to get user from localStorage', error, 'AuthService');
      return null;
    }
  }

  /**
   * Set user
   */
  private setUser(user: User): void {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      logger.error('Failed to set user in localStorage', error, 'AuthService');
    }
  }

  /**
   * Clear user
   */
  private clearUser(): void {
    try {
      localStorage.removeItem(this.userKey);
    } catch (error) {
      logger.warn('Failed to clear user from localStorage', error, 'AuthService');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }
}

// Export singleton instance
export const authService = new AuthService();

/**
 * Convenience functions (for backward compatibility)
 */
export async function verifyUserToken(token: string): Promise<{ success: boolean; user?: User }> {
  return authService.verifyToken(token);
}

export function getAuthToken(): string | null {
  return authService.getToken();
}

export function clearAuthToken(): void {
  authService.clearToken();
}

export async function processOfflineQueue(): Promise<void> {
  // TODO: Implement offline queue processing
  logger.info('Processing offline queue', {}, 'AuthService');
}
