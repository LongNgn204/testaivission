import { logger } from './loggingService';
import { analytics, EventType } from './analyticsService';

/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint (ms)
  fid?: number; // First Input Delay (ms)
  cls?: number; // Cumulative Layout Shift (unitless)
  ttfb?: number; // Time to First Byte (ms)
  fcp?: number; // First Contentful Paint (ms)

  // Navigation Timing
  domInteractive?: number;
  domComplete?: number;
  loadEventEnd?: number;

  // Resource Timing
  resourceCount?: number;
  totalResourceSize?: number;
  slowestResource?: {
    name: string;
    duration: number;
  };

  // Memory (if available)
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
}

/**
 * Performance Monitoring Service
 */
class PerformanceMonitoringService {
  private metrics: PerformanceMetrics = {};
  private thresholds = {
    lcp: 2500, // 2.5s
    fid: 100, // 100ms
    cls: 0.1, // 0.1
    ttfb: 600, // 600ms
    fcp: 1800, // 1.8s
  };

  constructor() {
    this.initializeMetrics();
    this.setupObservers();
  }

  /**
   * Initialize metrics from Navigation Timing API
   */
  private initializeMetrics() {
    if (!window.performance) {
      logger.warn('Performance API not available');
      return;
    }

    const perfData = window.performance.timing;
    const perfNav = window.performance.navigation;

    // Calculate navigation timings
    const navigationStart = perfData.navigationStart;
    const domInteractive = perfData.domInteractive - navigationStart;
    const domComplete = perfData.domComplete - navigationStart;
    const loadEventEnd = perfData.loadEventEnd - navigationStart;

    this.metrics = {
      domInteractive,
      domComplete,
      loadEventEnd,
    };

    // Get resource timings
    this.analyzeResourceTiming();

    // Get memory info if available
    this.getMemoryInfo();

    logger.info('Performance metrics initialized', this.metrics);
  }

  /**
   * Analyze resource timing
   */
  private analyzeResourceTiming() {
    if (!window.performance.getEntriesByType) {
      return;
    }

    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let totalSize = 0;
    let slowestResource = { name: '', duration: 0 };

    for (const resource of resources) {
      totalSize += resource.transferSize || 0;

      if (resource.duration > slowestResource.duration) {
        slowestResource = {
          name: resource.name,
          duration: Math.round(resource.duration),
        };
      }
    }

    this.metrics.resourceCount = resources.length;
    this.metrics.totalResourceSize = totalSize;
    this.metrics.slowestResource = slowestResource.duration > 0 ? slowestResource : undefined;
  }

  /**
   * Get memory info if available
   */
  private getMemoryInfo() {
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      this.metrics.usedJSHeapSize = memory.usedJSHeapSize;
      this.metrics.totalJSHeapSize = memory.totalJSHeapSize;
      this.metrics.jsHeapSizeLimit = memory.jsHeapSizeLimit;
    }
  }

  /**
   * Setup performance observers
   */
  private setupObservers() {
    if (!('PerformanceObserver' in window)) {
      logger.warn('PerformanceObserver not available');
      return;
    }

    // Observe Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = Math.round(lastEntry.startTime);
        this.checkThreshold('lcp', this.metrics.lcp);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      logger.debug('LCP observer not supported');
    }

    // Observe First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          this.metrics.fid = Math.round((entry as any).processingDuration);
          this.checkThreshold('fid', this.metrics.fid);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      logger.debug('FID observer not supported');
    }

    // Observe Cumulative Layout Shift
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cls = Math.round(clsValue * 1000) / 1000;
        this.checkThreshold('cls', this.metrics.cls);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      logger.debug('CLS observer not supported');
    }

    // Observe First Contentful Paint
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = Math.round(entry.startTime);
            this.checkThreshold('fcp', this.metrics.fcp);
          }
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      logger.debug('FCP observer not supported');
    }

    // Observe Time to First Byte
    try {
      const navTiming = window.performance.timing;
      if (navTiming.responseStart && navTiming.navigationStart) {
        this.metrics.ttfb = navTiming.responseStart - navTiming.navigationStart;
        this.checkThreshold('ttfb', this.metrics.ttfb);
      }
    } catch (e) {
      logger.debug('TTFB calculation failed');
    }
  }

  /**
   * Check if metric exceeds threshold
   */
  private checkThreshold(metric: keyof typeof this.thresholds, value: number) {
    const threshold = this.thresholds[metric];
    if (value > threshold) {
      logger.warn(`Performance threshold exceeded: ${metric} = ${value}ms (threshold: ${threshold}ms)`);
      analytics.trackEvent(EventType.PERFORMANCE_METRIC, {
        metric,
        value,
        threshold,
        exceeded: true,
      });
    }
  }

  /**
   * Get all metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get specific metric
   */
  public getMetric(name: keyof PerformanceMetrics): number | undefined {
    return this.metrics[name] as number | undefined;
  }

  /**
   * Get Core Web Vitals status
   */
  public getCoreWebVitalsStatus() {
    return {
      lcp: {
        value: this.metrics.lcp,
        status: this.getStatus('lcp', this.metrics.lcp),
      },
      fid: {
        value: this.metrics.fid,
        status: this.getStatus('fid', this.metrics.fid),
      },
      cls: {
        value: this.metrics.cls,
        status: this.getStatus('cls', this.metrics.cls),
      },
    };
  }

  /**
   * Get status based on value and thresholds
   */
  private getStatus(
    metric: keyof typeof this.thresholds,
    value?: number
  ): 'good' | 'needs-improvement' | 'poor' | 'unknown' {
    if (value === undefined) return 'unknown';

    const threshold = this.thresholds[metric];
    const poorThreshold = threshold * 1.5;

    if (value <= threshold) return 'good';
    if (value <= poorThreshold) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Get performance score (0-100)
   */
  public getPerformanceScore(): number {
    let score = 100;

    // LCP (25 points)
    if (this.metrics.lcp) {
      if (this.metrics.lcp > 4000) score -= 25;
      else if (this.metrics.lcp > 2500) score -= 15;
      else if (this.metrics.lcp > 1500) score -= 5;
    }

    // FID (25 points)
    if (this.metrics.fid) {
      if (this.metrics.fid > 300) score -= 25;
      else if (this.metrics.fid > 100) score -= 15;
      else if (this.metrics.fid > 50) score -= 5;
    }

    // CLS (25 points)
    if (this.metrics.cls) {
      if (this.metrics.cls > 0.25) score -= 25;
      else if (this.metrics.cls > 0.1) score -= 15;
      else if (this.metrics.cls > 0.05) score -= 5;
    }

    // FCP (15 points)
    if (this.metrics.fcp) {
      if (this.metrics.fcp > 3000) score -= 15;
      else if (this.metrics.fcp > 1800) score -= 10;
      else if (this.metrics.fcp > 1000) score -= 5;
    }

    // TTFB (10 points)
    if (this.metrics.ttfb) {
      if (this.metrics.ttfb > 1200) score -= 10;
      else if (this.metrics.ttfb > 600) score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get performance report
   */
  public getReport() {
    return {
      metrics: this.getMetrics(),
      coreWebVitals: this.getCoreWebVitalsStatus(),
      performanceScore: this.getPerformanceScore(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Track custom metric
   */
  public trackCustomMetric(name: string, value: number, unit: string = 'ms') {
    logger.info(`Custom metric: ${name} = ${value}${unit}`);
    analytics.trackEvent(EventType.PERFORMANCE_METRIC, {
      metric: name,
      value,
      unit,
    });
  }

  /**
   * Measure function execution time
   */
  public async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.trackCustomMetric(name, Math.round(duration), 'ms');
    }
  }

  /**
   * Measure sync function execution time
   */
  public measureSync<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - start;
      this.trackCustomMetric(name, Math.round(duration), 'ms');
    }
  }
}

// Export singleton instance
export const performanceMonitoring = new PerformanceMonitoringService();

