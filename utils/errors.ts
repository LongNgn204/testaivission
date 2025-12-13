/**
 * ========================================
 * ERROR HANDLING UTILITIES
 * ========================================
 * Centralized error classes và handling logic
 * Tuân thủ TypeScript strict mode
 */

/**
 * Base application error class
 * Tất cả errors trong app nên extend từ class này
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);

    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Validation error - khi input không hợp lệ
 */
export class ValidationError extends AppError {
  public readonly fields: Record<string, string[]>;

  constructor(message: string, fields: Record<string, string[]> = {}) {
    super(message, 'VALIDATION_ERROR', 400);
    Object.setPrototypeOf(this, ValidationError.prototype);

    this.fields = fields;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      fields: this.fields,
    };
  }
}

/**
 * Authentication error - khi xác thực thất bại
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Xác thực thất bại') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization error - khi không có quyền truy cập
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Không có quyền truy cập') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not found error - khi resource không tồn tại
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} không tìm thấy`, 'NOT_FOUND', 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * API error - khi gọi external API thất bại
 */
export class APIError extends AppError {
  public readonly originalError?: Error;

  constructor(
    message: string,
    statusCode: number = 500,
    originalError?: Error
  ) {
    super(message, 'API_ERROR', statusCode);
    Object.setPrototypeOf(this, APIError.prototype);

    this.originalError = originalError;
  }
}

/**
 * Network error - khi mất kết nối
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Lỗi kết nối mạng') {
    super(message, 'NETWORK_ERROR', 0);
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Timeout error - khi request quá lâu
 */
export class TimeoutError extends AppError {
  constructor(message: string = 'Yêu cầu hết thời gian chờ') {
    super(message, 'TIMEOUT_ERROR', 408);
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Rate limit error - khi vượt quá giới hạn request
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Quá nhiều yêu cầu', retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', 429);
    Object.setPrototypeOf(this, RateLimitError.prototype);

    this.retryAfter = retryAfter;
  }
}

/**
 * Helper function để check nếu error là operational
 * (có thể xử lý gracefully) hay programming error
 */
export function isOperationalError(error: unknown): error is AppError {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Helper function để convert bất kỳ error thành AppError
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', 500, false);
  }

  return new AppError(
    String(error),
    'UNKNOWN_ERROR',
    500,
    false
  );
}

/**
 * Error handler cho async functions
 * Dùng để wrap async functions và handle errors gracefully
 */
export function asyncHandler<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = toAppError(error);
      console.error('[AsyncHandler Error]', appError);
      throw appError;
    }
  };
}

