import { logger } from '../services/loggingService';
import { ErrorHandler, AppError } from './errorHandler';

/**
 * API Request Options
 */
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
}

/**
 * API Response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

/**
 * API Client with error handling, retry logic, and logging
 */
export class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number = 30000; // 30 seconds
  private defaultRetry: number = 3;
  private defaultRetryDelay: number = 1000;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Create abort controller with timeout
   */
  private createAbortController(timeout: number) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    return { controller, timeoutId };
  }

  /**
   * Make API request
   */
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retry = this.defaultRetry,
      retryDelay = this.defaultRetryDelay,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const startTime = performance.now();

    // Log request
    logger.logApiRequest(method, url);
    logger.startTimer(`api_${method}_${endpoint}`);

    try {
      // Create abort controller
      const { controller, timeoutId } = this.createAbortController(timeout);

      // Prepare request
      const requestInit: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: controller.signal,
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        requestInit.body = JSON.stringify(body);
      }

      // Make request with retry logic
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < retry; attempt++) {
        try {
          const response = await fetch(url, requestInit);
          clearTimeout(timeoutId);

          const duration = performance.now() - startTime;
          logger.endTimer(`api_${method}_${endpoint}`, { duration });

          // Parse response
          let data: any;
          try {
            data = await response.json();
          } catch {
            data = null;
          }

          // Log response
          logger.logApiResponse(method, url, response.status, duration);

          // Handle error status
          if (!response.ok) {
            const error = ErrorHandler.handleApiError(
              {
                response: {
                  status: response.status,
                  data,
                },
              },
              { attempt, retry }
            );

            // Retry on specific errors
            if (
              (response.status === 429 || response.status >= 500) &&
              attempt < retry - 1
            ) {
              const delay = retryDelay * Math.pow(2, attempt);
              logger.warn(`Retrying after ${delay}ms`, { attempt, status: response.status });
              await new Promise((resolve) => setTimeout(resolve, delay));
              continue;
            }

            throw error;
          }

          return {
            success: true,
            data,
            status: response.status,
          };
        } catch (error) {
          lastError = error as Error;

          // Retry on network errors
          if (
            error instanceof TypeError &&
            attempt < retry - 1
          ) {
            const delay = retryDelay * Math.pow(2, attempt);
            logger.warn(`Network error, retrying after ${delay}ms`, {
              attempt,
              error: lastError.message,
            });
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          throw error;
        }
      }

      throw lastError;
    } catch (error) {
      clearTimeout(0); // Clear any pending timeouts
      const duration = performance.now() - startTime;

      // Handle error
      const appError = ErrorHandler.handleApiError(error, {
        endpoint,
        method,
        duration,
      });

      ErrorHandler.logError(appError);

      return {
        success: false,
        error: ErrorHandler.getUserMessage(appError),
        status: appError.statusCode,
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

