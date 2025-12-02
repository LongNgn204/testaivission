import { logger, LogLevel } from '../loggingService';

describe('LoggingService', () => {
  beforeEach(() => {
    logger.clearLogs();
    jest.clearAllMocks();
  });

  describe('Basic Logging', () => {
    it('should log info messages', () => {
      logger.info('Test message', { key: 'value' });
      const logs = logger.getLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.INFO);
      expect(logs[0].message).toBe('Test message');
      expect(logs[0].context).toEqual({ key: 'value' });
    });

    it('should log debug messages', () => {
      logger.debug('Debug message');
      const logs = logger.getLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.DEBUG);
    });

    it('should log warn messages', () => {
      logger.warn('Warning message');
      const logs = logger.getLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.WARN);
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      const logs = logger.getLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].context?.errorMessage).toBe('Test error');
    });
  });

  describe('Performance Tracking', () => {
    it('should track timer duration', () => {
      // Mock performance.now to control duration
      const nowSpy = jest
        .spyOn(performance, 'now')
        .mockReturnValueOnce(1000) // start
        .mockReturnValueOnce(1105); // end (105ms)

      logger.startTimer('test_operation');
      const duration = logger.endTimer('test_operation');

      expect(duration).toBeGreaterThanOrEqual(100);
      const metrics = logger.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('test_operation');

      nowSpy.mockRestore();
    });

    it('should warn if timer not found', () => {
      const warnSpy = jest.spyOn(logger, 'warn');
      logger.endTimer('non_existent_timer');

      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe('API Logging', () => {
    it('should log API requests', () => {
      logger.logApiRequest('GET', '/api/test');
      const logs = logger.getLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].message).toContain('API Request');
      expect(logs[0].context?.method).toBe('GET');
      expect(logs[0].context?.url).toBe('/api/test');
    });

    it('should log API responses', () => {
      logger.logApiResponse('POST', '/api/test', 200, 150);
      const logs = logger.getLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].message).toContain('API Response');
      expect(logs[0].context?.status).toBe(200);
    });

    it('should mark error responses as warnings', () => {
      logger.logApiResponse('GET', '/api/test', 500, 100);
      const logs = logger.getLogs();

      expect(logs[0].level).toBe(LogLevel.WARN);
    });
  });

  describe('Log Filtering', () => {
    beforeEach(() => {
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message', new Error('test'));
    });

    it('should filter logs by level', () => {
      const errors = logger.getLogsByLevel(LogLevel.ERROR);
      expect(errors).toHaveLength(1);
      expect(errors[0].level).toBe(LogLevel.ERROR);
    });

    it('should get all logs', () => {
      const allLogs = logger.getLogs();
      expect(allLogs.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Log Management', () => {
    it('should maintain max logs limit', () => {
      // Add more logs than the max limit
      for (let i = 0; i < 600; i++) {
        logger.info(`Message ${i}`);
      }

      const logs = logger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(500);
    });

    it('should export logs as JSON', () => {
      logger.info('Test message');
      const exported = logger.exportLogs();
      const parsed = JSON.parse(exported);

      expect(parsed.logs).toBeDefined();
      expect(parsed.metrics).toBeDefined();
      expect(parsed.exportedAt).toBeDefined();
    });

    it('should clear all logs', () => {
      logger.info('Test message');
      expect(logger.getLogs()).toHaveLength(1);

      logger.clearLogs();
      expect(logger.getLogs()).toHaveLength(0);
    });
  });

  describe('User Context', () => {
    it('should include user context in logs', () => {
      localStorage.getItem.mockReturnValue('user123');
      
      logger.info('Test message');
      const logs = logger.getLogs();

      expect(logs[0].userId).toBeDefined();
    });
  });
});

