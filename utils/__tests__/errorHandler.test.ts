import {
  ErrorHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  NetworkError,
  TimeoutError,
} from '../errorHandler';

describe('ErrorHandler', () => {
  describe('Error Classes', () => {
    it('should create ValidationError', () => {
      const error = new ValidationError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should create AuthenticationError', () => {
      const error = new AuthenticationError();
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTH_ERROR');
    });

    it('should create NotFoundError', () => {
      const error = new NotFoundError('User');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should create NetworkError', () => {
      const error = new NetworkError();
      expect(error.statusCode).toBe(0);
      expect(error.code).toBe('NETWORK_ERROR');
    });

    it('should create TimeoutError', () => {
      const error = new TimeoutError();
      expect(error.statusCode).toBe(408);
      expect(error.code).toBe('TIMEOUT');
    });
  });

  describe('API Error Handling', () => {
    it('should handle 400 validation errors', () => {
      const error = ErrorHandler.handleApiError({
        response: {
          status: 400,
          data: { message: 'Invalid input' },
        },
      });

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(400);
    });

    it('should handle 401 authentication errors', () => {
      const error = ErrorHandler.handleApiError({
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      });

      expect(error).toBeInstanceOf(AuthenticationError);
    });

    it('should handle 404 not found errors', () => {
      const error = ErrorHandler.handleApiError({
        response: {
          status: 404,
          data: { message: 'Not found' },
        },
      });

      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('should handle network errors', () => {
      const error = ErrorHandler.handleApiError(new TypeError('Network error'));

      expect(error).toBeInstanceOf(NetworkError);
    });

    it('should handle timeout errors', () => {
      const error = ErrorHandler.handleApiError({
        code: 'ECONNABORTED',
        message: 'Timeout',
      });

      expect(error).toBeInstanceOf(TimeoutError);
    });
  });

  describe('User Messages', () => {
    it('should provide user-friendly message for validation error', () => {
      const error = new ValidationError('Invalid input');
      const message = ErrorHandler.getUserMessage(error);

      expect(message).toContain('check your input');
    });

    it('should provide user-friendly message for auth error', () => {
      const error = new AuthenticationError();
      const message = ErrorHandler.getUserMessage(error);

      expect(message).toContain('log in');
    });

    it('should provide user-friendly message for network error', () => {
      const error = new NetworkError();
      const message = ErrorHandler.getUserMessage(error);

      expect(message).toContain('Network');
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      const fn = jest.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      const result = await ErrorHandler.retryWithBackoff(fn, 3, 10);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const fn = jest.fn(async () => {
        throw new Error('Permanent failure');
      });

      await expect(
        ErrorHandler.retryWithBackoff(fn, 2, 10)
      ).rejects.toThrow('Permanent failure');

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Safe Execution', () => {
    it('should safely execute async function', async () => {
      const fn = jest.fn(async () => 'result');
      const result = await ErrorHandler.safeAsync(fn);

      expect(result).toBe('result');
      expect(fn).toHaveBeenCalled();
    });

    it('should return fallback on async error', async () => {
      const fn = jest.fn(async () => {
        throw new Error('Error');
      });

      const result = await ErrorHandler.safeAsync(fn, 'fallback');

      expect(result).toBe('fallback');
    });

    it('should safely execute sync function', () => {
      const fn = jest.fn(() => 'result');
      const result = ErrorHandler.safeSync(fn);

      expect(result).toBe('result');
    });

    it('should return fallback on sync error', () => {
      const fn = jest.fn(() => {
        throw new Error('Error');
      });

      const result = ErrorHandler.safeSync(fn, 'fallback');

      expect(result).toBe('fallback');
    });
  });
});

