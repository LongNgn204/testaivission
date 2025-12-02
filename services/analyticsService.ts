import { logger } from './loggingService';

/**
 * Analytics Event Types
 */
export enum EventType {
  // User events
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_SIGNUP = 'user_signup',
  USER_PROFILE_UPDATE = 'user_profile_update',

  // Test events
  TEST_STARTED = 'test_started',
  TEST_COMPLETED = 'test_completed',
  TEST_FAILED = 'test_failed',
  TEST_SKIPPED = 'test_skipped',

  // Feature usage
  FEATURE_USED = 'feature_used',
  BUTTON_CLICKED = 'button_clicked',
  PAGE_VIEWED = 'page_viewed',
  MODAL_OPENED = 'modal_opened',
  MODAL_CLOSED = 'modal_closed',

  // AI interactions
  AI_CHAT_STARTED = 'ai_chat_started',
  AI_CHAT_MESSAGE = 'ai_chat_message',
  AI_VOICE_USED = 'ai_voice_used',

  // Performance
  API_CALL = 'api_call',
  PAGE_LOAD = 'page_load',
  PERFORMANCE_METRIC = 'performance_metric',

  // Errors
  ERROR_OCCURRED = 'error_occurred',
  API_ERROR = 'api_error',

  // Engagement
  BADGE_EARNED = 'badge_earned',
  STREAK_UPDATED = 'streak_updated',
  EXERCISE_COMPLETED = 'exercise_completed',
  REMINDER_SET = 'reminder_set',
}

/**
 * Analytics Event
 */
export interface AnalyticsEvent {
  id: string;
  type: EventType;
  timestamp: string;
  userId?: string;
  sessionId: string;
  properties?: Record<string, any>;
  duration?: number;
  error?: string;
}

/**
 * Analytics Session
 */
export interface AnalyticsSession {
  id: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  pageViews: number;
  events: number;
  deviceInfo: {
    userAgent: string;
    language: string;
    timezone: string;
  };
  referrer?: string;
}

/**
 * Core Web Vitals
 */
export interface CoreWebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  fcp?: number; // First Contentful Paint
}

/**
 * Analytics Service
 */
class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private session: AnalyticsSession;
  private maxEvents = 1000;
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private isEnabled = true;
  private remoteEndpoint = '';
  private flushTimer?: ReturnType<typeof setInterval>;

  constructor() {
    this.session = this.createSession();
    this.initializeSession();
    this.setupPerformanceObservers();

    // Configure remote endpoint from env
    const endpoint = (import.meta as any).env?.VITE_ANALYTICS_ENDPOINT as string | undefined;
    if (endpoint) {
      this.setRemoteEndpoint(endpoint);
      this.setEnabled(true);
    }

    this.startAutoFlush();
  }

  /**
   * Create new session
   */
  private createSession(): AnalyticsSession {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date().toISOString(),
      pageViews: 0,
      events: 0,
      deviceInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      referrer: document.referrer,
    };
  }

  /**
   * Initialize session
   */
  private initializeSession() {
    // Get user ID from localStorage
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.session.userId = user.id;
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Track page view on init
    this.trackEvent(EventType.PAGE_VIEWED, {
      page: window.location.pathname,
      title: document.title,
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent(EventType.PAGE_VIEWED, {
          page: 'hidden',
          duration: Date.now() - new Date(this.session.startTime).getTime(),
        });
      }
    });

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    logger.info('Analytics session started', { sessionId: this.session.id });
  }

  /**
   * Setup performance observers
   */
  private setupPerformanceObservers() {
    // Observe Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'largest-contentful-paint') {
              this.trackEvent(EventType.PERFORMANCE_METRIC, {
                metric: 'LCP',
                value: Math.round(entry.startTime),
              });
            }
          }
        });
        paintObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Observer not supported
      }

      // Observe First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackEvent(EventType.PERFORMANCE_METRIC, {
              metric: 'FID',
              value: Math.round(entry.processingDuration),
            });
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // Observer not supported
      }

      // Observe Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.trackEvent(EventType.PERFORMANCE_METRIC, {
            metric: 'CLS',
            value: Math.round(clsValue * 1000) / 1000,
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Observer not supported
      }
    }
  }

  /**
   * Track event
   */
  public trackEvent(
    type: EventType,
    properties?: Record<string, any>,
    duration?: number
  ): string {
    const event: AnalyticsEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      userId: this.session.userId,
      sessionId: this.session.id,
      properties,
      duration,
    };

    this.events.push(event);
    this.session.events++;

    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log event
    logger.debug(`Analytics: ${type}`, properties);

    // Auto-flush if batch size reached
    if (this.events.length >= this.batchSize) {
      this.flush();
    }

    return event.id;
  }

  /**
   * Track page view
   */
  public trackPageView(page: string, properties?: Record<string, any>) {
    this.session.pageViews++;
    this.trackEvent(EventType.PAGE_VIEWED, {
      page,
      ...properties,
    });
  }

  /**
   * Track test completion
   */
  public trackTestCompletion(
    testType: string,
    score: number,
    duration: number,
    properties?: Record<string, any>
  ) {
    this.trackEvent(EventType.TEST_COMPLETED, {
      testType,
      score,
      duration,
      ...properties,
    });
  }

  /**
   * Track feature usage
   */
  public trackFeatureUsage(feature: string, properties?: Record<string, any>) {
    this.trackEvent(EventType.FEATURE_USED, {
      feature,
      ...properties,
    });
  }

  /**
   * Track button click
   */
  public trackButtonClick(buttonName: string, properties?: Record<string, any>) {
    this.trackEvent(EventType.BUTTON_CLICKED, {
      button: buttonName,
      ...properties,
    });
  }

  /**
   * Track API call
   */
  public trackApiCall(
    endpoint: string,
    method: string,
    status: number,
    duration: number,
    properties?: Record<string, any>
  ) {
    this.trackEvent(EventType.API_CALL, {
      endpoint,
      method,
      status,
      duration,
      ...properties,
    });
  }

  /**
   * Track error
   */
  public trackError(error: string, properties?: Record<string, any>) {
    this.trackEvent(EventType.ERROR_OCCURRED, {
      error,
      ...properties,
    });
  }

  /**
   * Track AI interaction
   */
  public trackAiInteraction(type: 'chat' | 'voice', properties?: Record<string, any>) {
    const eventType = type === 'chat' ? EventType.AI_CHAT_MESSAGE : EventType.AI_VOICE_USED;
    this.trackEvent(eventType, properties);
  }

  /**
   * Track badge earned
   */
  public trackBadgeEarned(badgeName: string, properties?: Record<string, any>) {
    this.trackEvent(EventType.BADGE_EARNED, {
      badge: badgeName,
      ...properties,
    });
  }

  /**
   * Get session info
   */
  public getSession(): AnalyticsSession {
    return { ...this.session };
  }

  /**
   * Get events
   */
  public getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  public getEventsByType(type: EventType): AnalyticsEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  /**
   * Flush events to remote endpoint
   */
  public async flush() {
    if (!this.isEnabled || this.events.length === 0 || !this.remoteEndpoint) {
      return;
    }

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await fetch(this.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session: this.session,
          events: eventsToSend,
        }),
        keepalive: true,
      });

      logger.debug(`Flushed ${eventsToSend.length} analytics events`);
    } catch (error) {
      logger.warn('Failed to flush analytics events', { error: (error as Error).message });
      // Re-add events if flush failed
      this.events = [...eventsToSend, ...this.events];
    }
  }

  /**
   * Start auto-flush
   */
  private startAutoFlush() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop auto-flush
   */
  public stopAutoFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }

  /**
   * Enable/disable analytics
   */
  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Set remote endpoint
   */
  public setRemoteEndpoint(endpoint: string) {
    this.remoteEndpoint = endpoint;
  }

  /**
   * Get analytics summary
   */
  public getSummary() {
    const now = new Date();
    const sessionStart = new Date(this.session.startTime);
    const duration = now.getTime() - sessionStart.getTime();

    return {
      sessionId: this.session.id,
      userId: this.session.userId,
      duration: Math.round(duration / 1000), // seconds
      pageViews: this.session.pageViews,
      events: this.session.events,
      eventsByType: this.getEventTypeCounts(),
    };
  }

  /**
   * Get event type counts
   */
  private getEventTypeCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const event of this.events) {
      counts[event.type] = (counts[event.type] || 0) + 1;
    }
    return counts;
  }

  /**
   * Export analytics data
   */
  public export() {
    return {
      session: this.session,
      events: this.events,
      summary: this.getSummary(),
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Clear all data
   */
  public clear() {
    this.events = [];
    this.session = this.createSession();
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

