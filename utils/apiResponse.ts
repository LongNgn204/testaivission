/**
 * ========================================
 * API RESPONSE WRAPPER
 * ========================================
 * Standardized API response format
 * Tuân thủ TypeScript strict mode
 */

/**
 * Standard API response format
 * Tất cả API responses nên tuân thủ format này
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    version: string;
    traceId?: string;
  };
}

/**
 * Success response builder
 */
export function successResponse<T>(
  data: T,
  meta?: Record<string, unknown>
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0',
      ...meta,
    },
  };
}

/**
 * Error response builder
 */
export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0',
    },
  };
}

/**
 * Paginated response builder
 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): ApiResponse<PaginatedData<T>> {
  return successResponse({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

/**
 * Type guard để check nếu response là success
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { data: T } {
  return response.success && response.data !== undefined;
}

/**
 * Type guard để check nếu response là error
 */
export function isErrorResponse(
  response: ApiResponse
): response is ApiResponse & { error: NonNullable<ApiResponse['error']> } {
  return !response.success && response.error !== undefined;
}

