/**
 * ========================================
 * ERROR HANDLING UTILITIES (Worker-local)
 * ========================================
 * Các class lỗi tối thiểu dùng trong Cloudflare Worker
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'INTERNAL_ERROR',
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields: Record<string, string[]> = {}) {
    super(message, 'VALIDATION_ERROR', 400);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', public retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', 429);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

