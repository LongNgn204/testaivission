/**
 * Enhanced Centralized Logging Service
 * 
 * Features:
 * - Structured logging with levels (INFO, WARN, ERROR, DEBUG)
 * - Performance tracking (timers, metrics)
 * - Error tracking with stack traces
 * - Remote logging support (Sentry, LogRocket)
 * - Log rotation and storage limits
 * - User session tracking
 * - API request/response logging
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogData {
  id: string;
  message: string;
  level: LogLevel;
  timestamp: string;
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
  userId?: string;
}

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: string;
  context?: Record<string, any>;
}

class LoggingService {
  private logs: LogData[] = [];
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();
  private maxLogs = 500; // Keep last 500 logs
  private isDevelopment = import.meta.env.DEV;
  private remoteLoggingEnabled = false;

  constructor() {
    // Initialize error tracking if available
    this.initializeErrorTracking();
  }

  /**
   * Initialize global error tracking
   */
  private initializeErrorTracking() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', event.reason);
    });

    // Catch global errors
    window.addEventListener('error', (event) => {
      this.error('Global Error', event.error || new Error(event.message));
    });
  }

  /**
   * Generate unique log ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user context
   */
  private getUserContext(): Partial<LogData> {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem('userId') || undefined,
    };
  }

  /**
   * Core logging method
   */
  private sanitizeContext(context: Record<string, any> = {}) {
    try {
      const clone: Record<string, any> = Array.isArray(context) ? [...(context as any)] : { ...context };
      const scrub = (val: any): any => {
        if (typeof val === 'string') {
          // Mask phone numbers and emails
          let v = val.replace(/\b0\d{9,10}\b/g, (m) => m.slice(0, 4) + '****');
          v = v.replace(/([\w.%+-]+)@([\w.-]+)\.(\w{2,})/g, '***@***.$3');
          return v;
        }
        if (typeof val === 'object' && val !== null) {
          const r: Record<string, any> = Array.isArray(val) ? [...(val as any)] : { ...val };
          for (const k of Object.keys(r)) {
            r[k] = scrub(r[k]);
          }
          return r;
        }
        return val;
      };
      return scrub(clone);
    } catch {
      return context;
    }
  }

  private log(
    level: LogLevel,
    message: string,
    context: Record<string, any> = {}
  ) {
    const safeContext = this.sanitizeContext(context);
    const logEntry: LogData = {
      id: this.generateId(),
      level,
      message,
      timestamp: new Date().toISOString(),
      context: safeContext,
      ...this.getUserContext(),
    };

    this.logs.push(logEntry);

    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    this.outputToConsole(logEntry);

    // Send to remote service
    if (this.remoteLoggingEnabled && level === LogLevel.ERROR) {
      this.sendToRemote(logEntry);
    }

    // Store in localStorage for debugging
    if (this.isDevelopment) {
      this.storeInLocalStorage(logEntry);
    }
  }

  /**
   * Output to console with styling
   */
  private outputToConsole(entry: LogData) {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${entry.level}]`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`%c${prefix} ${entry.message}`, 'color: gray', entry.context);
        break;
      case LogLevel.INFO:
        console.log(`%c${prefix} ${entry.message}`, 'color: blue', entry.context);
        break;
      case LogLevel.WARN:
        console.warn(`%c${prefix} ${entry.message}`, 'color: orange', entry.context);
        break;
      case LogLevel.ERROR:
        console.error(`%c${prefix} ${entry.message}`, 'color: red', entry.context);
        break;
    }
  }

  /**
   * Store logs in localStorage for debugging
   */
  private storeInLocalStorage(entry: LogData) {
    try {
      const stored = localStorage.getItem('__app_logs__');
      const logs = stored ? JSON.parse(stored) : [];
      logs.push(entry);
      // Keep last 100 logs in localStorage
      if (logs.length > 100) {
        logs.shift();
      }
      localStorage.setItem('__app_logs__', JSON.stringify(logs));
    } catch (e) {
      // Silently fail if localStorage is full
    }
  }

  /**
   * Send error to remote tracking service
   */
  private sendToRemote(entry: LogData) {
    // This can be extended to send to Sentry, LogRocket, etc.
    if (window.__ERROR_TRACKING__) {
      window.__ERROR_TRACKING__.captureException(new Error(entry.message), {
        level: entry.level,
        contexts: entry.context,
      });
    }
  }

  /**
   * Public logging methods
   */
  public debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, error: Error | string, context?: Record<string, any>) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const errorContext = {
      ...context,
      errorMessage: errorObj.message,
      stack: errorObj.stack,
      name: errorObj.name,
    };
    this.log(LogLevel.ERROR, message, errorContext);
  }

  /**
   * Performance tracking
   */
  public startTimer(name: string) {
    this.timers.set(name, performance.now());
  }

  public endTimer(name: string, context?: Record<string, any>) {
    const startTime = this.timers.get(name);
    if (!startTime) {
      this.warn(`Timer "${name}" not found`);
      return;
    }

    const duration = performance.now() - startTime;
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: new Date().toISOString(),
      context,
    };

    this.metrics.push(metric);
    this.info(`Performance: ${name} took ${duration.toFixed(2)}ms`, { duration });
    this.timers.delete(name);

    return duration;
  }

  /**
   * API request logging
   */
  public logApiRequest(method: string, url: string, context?: Record<string, any>) {
    this.info(`API Request: ${method} ${url}`, {
      method,
      url,
      ...context,
    });
  }

  /**
   * API response logging
   */
  public logApiResponse(
    method: string,
    url: string,
    status: number,
    duration: number,
    context?: Record<string, any>
  ) {
    const level = status >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, `API Response: ${method} ${url} [${status}]`, {
      method,
      url,
      status,
      duration: `${duration.toFixed(2)}ms`,
      ...context,
    });
  }

  /**
   * Get all logs
   */
  public getLogs(): LogData[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  public getLogsByLevel(level: LogLevel): LogData[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Get metrics
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all logs
   */
  public clearLogs() {
    this.logs = [];
    this.metrics = [];
    this.timers.clear();
  }

  /**
   * Export logs as JSON
   */
  public exportLogs(): string {
    return JSON.stringify(
      {
        logs: this.logs,
        metrics: this.metrics,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  /**
   * Enable/disable remote logging
   */
  public setRemoteLoggingEnabled(enabled: boolean) {
    this.remoteLoggingEnabled = enabled;
  }
}

// Export a singleton instance
export const logger = new LoggingService();

// Extend window interface for error tracking
declare global {
  interface Window {
    __ERROR_TRACKING__?: {
      captureException: (error: Error, context?: any) => void;
    };
  }
}

