import { logger } from '../services/loggingService';

/**
 * Custom Error Classes
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: Record<string, any>) {
    super(message, 'AUTH_ERROR', 401, context);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: Record<string, any>) {
    super(message, 'AUTHZ_ERROR', 403, context);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, any>) {
    super(`${resource} not found`, 'NOT_FOUND', 404, context);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'CONFLICT', 409, context);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', context?: Record<string, any>) {
    super(message, 'RATE_LIMIT', 429, context);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error', context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', 0, context);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'Request timeout', context?: Record<string, any>) {
    super(message, 'TIMEOUT', 408, context);
    this.name = 'TimeoutError';
  }
}

/**
 * Error Handler Utility
 */
export class ErrorHandler {
  /**
   * Handle API errors
   */
  static handleApiError(error: any, context?: Record<string, any>): AppError {
    // Network error
    if (!navigator.onLine) {
      return new NetworkError('No internet connection', context);
    }

    // Fetch error
    if (error instanceof TypeError) {
      return new NetworkError(error.message, context);
    }

    // HTTP error response
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || error.message || 'API Error';

      switch (status) {
        case 400:
          return new ValidationError(message, { ...context, status, data });
        case 401:
          return new AuthenticationError(message, { ...context, status, data });
        case 403:
          return new AuthorizationError(message, { ...context, status, data });
        case 404:
          return new NotFoundError(message, { ...context, status, data });
        case 409:
          return new ConflictError(message, { ...context, status, data });
        case 429:
          return new RateLimitError(message, { ...context, status, data });
        case 500:
        case 502:
        case 503:
        case 504:
          return new AppError(
            'Server error. Please try again later.',
            'SERVER_ERROR',
            status,
            { ...context, status, data }
          );
        default:
          return new AppError(message, 'API_ERROR', status, { ...context, status, data });
      }
    }

    // Timeout error
    if (error.code === 'ECONNABORTED') {
      return new TimeoutError(error.message, context);
    }

    // Unknown error
    return new AppError(
      error.message || 'Unknown error occurred',
      'UNKNOWN_ERROR',
      500,
      context
    );
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(
    errors: Record<string, string[]> | string,
    context?: Record<string, any>
  ): ValidationError {
    const message = typeof errors === 'string' ? errors : 'Validation failed';
    return new ValidationError(message, {
      ...context,
      errors: typeof errors === 'object' ? errors : undefined,
    });
  }

  /**
   * Log error with context
   */
  static logError(error: Error | AppError, context?: Record<string, any>) {
    if (error instanceof AppError) {
      logger.error(error.message, error, {
        code: error.code,
        statusCode: error.statusCode,
        ...error.context,
        ...context,
      });
    } else {
      logger.error(error.message, error, context);
    }
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: Error | AppError): string {
    if (error instanceof ValidationError) {
      return 'Please check your input and try again.';
    }

    if (error instanceof AuthenticationError) {
      return 'Please log in to continue.';
    }

    if (error instanceof AuthorizationError) {
      return 'You do not have permission to perform this action.';
    }

    if (error instanceof NotFoundError) {
      return 'The requested resource was not found.';
    }

    if (error instanceof RateLimitError) {
      return 'Too many requests. Please wait a moment and try again.';
    }

    if (error instanceof NetworkError) {
      return 'Network error. Please check your connection.';
    }

    if (error instanceof TimeoutError) {
      return 'Request timed out. Please try again.';
    }

    if (error instanceof AppError) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Retry logic with exponential backoff
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        const delay = baseDelay * Math.pow(2, attempt);

        logger.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms`, {
          error: lastError.message,
          attempt,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Safe async execution
   */
  static async safeAsync<T>(
    fn: () => Promise<T>,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      this.logError(error as Error);
      return fallback;
    }
  }

  /**
   * Safe sync execution
   */
  static safeSync<T>(fn: () => T, fallback?: T): T | undefined {
    try {
      return fn();
    } catch (error) {
      this.logError(error as Error);
      return fallback;
    }
  }
}

/**
 * Global error handler setup
 */
export function setupGlobalErrorHandling() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.logError(event.reason);
    // Prevent default browser behavior
    event.preventDefault();
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    ErrorHandler.logError(event.error || new Error(event.message));
  });
}

