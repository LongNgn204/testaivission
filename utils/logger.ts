/**
 * ========================================
 * LOGGING UTILITY
 * ========================================
 * Structured logging với support cho dev/prod modes
 * Tuân thủ TypeScript strict mode
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

/**
 * Logger class - centralized logging
 */
class Logger {
  private isDev: boolean;
  private logHistory: LogEntry[] = [];
  private maxHistorySize: number = 100;

  constructor() {
    this.isDev = import.meta.env.DEV;
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: Record<string, unknown>, context?: string): void {
    this.log('debug', message, data, context);
  }

  /**
   * Log info message
   */
  info(message: string, data?: Record<string, unknown>, context?: string): void {
    this.log('info', message, data, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: Record<string, unknown>, context?: string): void {
    this.log('warn', message, data, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: string): void {
    const errorData = this.parseError(error);
    const entry: LogEntry = {
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      context,
      error: errorData,
    };

    this.storeEntry(entry);
    this.outputLog(entry);
  }

  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    context?: string
  ): void {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      context,
      data,
    };

    this.storeEntry(entry);
    this.outputLog(entry);
  }

  /**
   * Store log entry in history
   */
  private storeEntry(entry: LogEntry): void {
    this.logHistory.push(entry);

    // Keep only recent logs
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory = this.logHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Output log to console
   */
  private outputLog(entry: LogEntry): void {
    const prefix = `[${entry.level.toUpperCase()}]`;
    const context = entry.context ? ` [${entry.context}]` : '';
    const fullMessage = `${prefix}${context} ${entry.message}`;

    const consoleMethod = this.getConsoleMethod(entry.level);

    if (entry.data) {
      consoleMethod(fullMessage, entry.data);
    } else if (entry.error) {
      consoleMethod(fullMessage, entry.error);
    } else {
      consoleMethod(fullMessage);
    }
  }

  /**
   * Get appropriate console method
   */
  private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case 'debug':
        return this.isDev ? console.debug : () => {};
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Parse error object
   */
  private parseError(error: Error | unknown): LogEntry['error'] {
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      };
    }

    return {
      message: String(error),
    };
  }

  /**
   * Get log history
   */
  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Convenience functions
 */
export const log = {
  debug: (message: string, data?: Record<string, unknown>, context?: string) =>
    logger.debug(message, data, context),
  info: (message: string, data?: Record<string, unknown>, context?: string) =>
    logger.info(message, data, context),
  warn: (message: string, data?: Record<string, unknown>, context?: string) =>
    logger.warn(message, data, context),
  error: (message: string, error?: Error | unknown, context?: string) =>
    logger.error(message, error, context),
};

