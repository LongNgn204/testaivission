/**
 * ========================================
 * API CLIENT WRAPPER
 * ========================================
 * Centralized HTTP client với error handling, retry logic, etc.
 * Tuân thủ TypeScript strict mode
 */

import { logger } from '../utils/logger';
import {
  AppError,
  APIError,
  NetworkError,
  TimeoutError,
  toAppError,
} from '../utils/errors';
import { ApiResponse, isErrorResponse } from '../utils/apiResponse';

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  retryAttempts?: number;
  skipErrorLog?: boolean;
}

/**
 * API Client class
 */
export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout ?? 30000; // 30s default
    this.retryAttempts = config.retryAttempts ?? 3;
    this.retryDelay = config.retryDelay ?? 1000;
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    path: string,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    path: string,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  /**
   * Main request method với retry logic
   */
  private async request<T = unknown>(
    path: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const {
      timeout = this.timeout,
      retryAttempts = this.retryAttempts,
      skipErrorLog = false,
      ...fetchOptions
    } = options;

    const url = this.buildUrl(path);
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, fetchOptions, timeout);
        const data = await response.json() as ApiResponse<T>;

        // Check if response indicates error
        if (isErrorResponse(data)) {
          throw new APIError(
            data.error.message,
            response.status
          );
        }

        // Return data from successful response
        if (data.data !== undefined) {
          return data.data;
        }

        throw new APIError('Invalid response format', response.status);
      } catch (error) {
        lastError = toAppError(error);

        // Don't retry on client errors (4xx)
        if (lastError instanceof APIError && lastError.statusCode >= 400 && lastError.statusCode < 500) {
          throw lastError;
        }

        // Retry on server errors (5xx) or network errors
        if (attempt < retryAttempts) {
          const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
          logger.warn(
            `Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${retryAttempts})`,
            { url, error: lastError.message },
            'ApiClient'
          );
          await this.sleep(delay);
          continue;
        }

        if (!skipErrorLog) {
          logger.error(`API request failed after ${retryAttempts + 1} attempts`, lastError, 'ApiClient');
        }

        throw lastError;
      }
    }

    throw lastError ?? new APIError('Unknown error', 500);
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(`Request timeout after ${timeout}ms`);
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Network request failed');
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Build full URL
   */
  private buildUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${cleanPath}`;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Create API client instance
 */
export function createApiClient(baseUrl: string): ApiClient {
  return new ApiClient({
    baseUrl,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  });
}

