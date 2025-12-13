/**
 * ========================================
 * PERFORMANCE MONITORING
 * ========================================
 * Theo dõi performance metrics
 * Tuân thủ TypeScript strict mode
 */

import { logger } from './logger';

export interface PerformanceMetrics {
  name: string;
  duration: number; // milliseconds
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Performance monitor class
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetricsSize: number = 100;
  private timers: Map<string, number> = new Map();

  /**
   * Start measuring
   */
  start(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * End measuring and record metric
   */
  end(name: string, metadata?: Record<string, unknown>): PerformanceMetrics {
    const startTime = this.timers.get(name);

    if (!startTime) {
      logger.warn(`Timer not found: ${name}`, {}, 'PerformanceMonitor');
      return {
        name,
        duration: 0,
        timestamp: new Date().toISOString(),
        metadata,
      };
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    const metric: PerformanceMetrics = {
      name,
      duration,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.recordMetric(metric);

    // Log slow operations
    if (duration > 1000) {
      logger.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms`, metadata, 'PerformanceMonitor');
    }

    return metric;
  }

  /**
   * Measure async function
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.start(name);

    try {
      const result = await fn();
      this.end(name, metadata);
      return result;
    } catch (error) {
      this.end(name, { ...metadata, error: String(error) });
      throw error;
    }
  }

  /**
   * Measure sync function
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, unknown>
  ): T {
    this.start(name);

    try {
      const result = fn();
      this.end(name, metadata);
      return result;
    } catch (error) {
      this.end(name, { ...metadata, error: String(error) });
      throw error;
    }
  }

  /**
   * Record metric
   */
  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics = this.metrics.slice(-this.maxMetricsSize);
    }
  }

  /**
   * Get metrics for operation
   */
  getMetrics(name?: string): PerformanceMetrics[] {
    if (!name) {
      return [...this.metrics];
    }

    return this.metrics.filter((m) => m.name === name);
  }

  /**
   * Get statistics for operation
   */
  getStats(name: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p95: number;
    p99: number;
  } | null {
    const metrics = this.getMetrics(name);

    if (metrics.length === 0) {
      return null;
    }

    const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);

    return {
      count: durations.length,
      min: durations[0]!,
      max: durations[durations.length - 1]!,
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
    };
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.timers.clear();
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}

/**
 * Export singleton instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Convenience functions
 */
export const perf = {
  start: (name: string) => performanceMonitor.start(name),
  end: (name: string, metadata?: Record<string, unknown>) =>
    performanceMonitor.end(name, metadata),
  measure: <T,>(name: string, fn: () => Promise<T>, metadata?: Record<string, unknown>) =>
    performanceMonitor.measure(name, fn, metadata),
  measureSync: <T,>(name: string, fn: () => T, metadata?: Record<string, unknown>) =>
    performanceMonitor.measureSync(name, fn, metadata),
  getStats: (name: string) => performanceMonitor.getStats(name),
};

/**
 * Web Vitals tracking (for frontend)
 */
export function trackWebVitals(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Track Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        if (lastEntry) {
          logger.info('Web Vital: LCP', {
            value: (lastEntry as any).renderTime || (lastEntry as any).loadTime,
          }, 'WebVitals');
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      logger.warn('Failed to track LCP', error, 'WebVitals');
    }
  }

  // Track First Input Delay (FID)
  if ('PerformanceObserver' in window) {
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        for (const entry of entries) {
          logger.info('Web Vital: FID', {
            value: (entry as any).processingDuration,
          }, 'WebVitals');
        }
      });

      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      logger.warn('Failed to track FID', error, 'WebVitals');
    }
  }

  // Track Cumulative Layout Shift (CLS)
  if ('PerformanceObserver' in window) {
    try {
      let clsValue = 0;

      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }

        logger.info('Web Vital: CLS', { value: clsValue }, 'WebVitals');
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      logger.warn('Failed to track CLS', error, 'WebVitals');
    }
  }
}

