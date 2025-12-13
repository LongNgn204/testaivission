/**
 * ========================================
 * ERROR HANDLER MIDDLEWARE
 * ========================================
 * Centralized error handling cho Cloudflare Worker
 */

import { AppError, ValidationError, AuthenticationError, RateLimitError } from '../../../utils/errors';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: {
    timestamp: string;
    version: string;
  };
}

/**
 * Convert error to HTTP response
 */
export function errorToResponse(error: unknown): { status: number; body: ErrorResponse } {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new AppError(error.message, 'INTERNAL_ERROR', 500, false);
  } else {
    appError = new AppError(String(error), 'UNKNOWN_ERROR', 500, false);
  }

  const status = appError.statusCode || 500;

  const body: ErrorResponse = {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      details: appError instanceof ValidationError ? appError.fields : undefined,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0',
    },
  };

  return { status, body };
}

/**
 * Error handler middleware
 */
export function errorHandler(error: unknown): Response {
  const { status, body } = errorToResponse(error);

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Async error wrapper
 */
export function asyncHandler<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<Response | R> {
  return async (...args: T): Promise<Response | R> => {
    try {
      return await fn(...args);
    } catch (error) {
      return errorHandler(error);
    }
  };
}

