import { logger } from '../services/loggingService';
import { analytics, EventType } from '../services/analyticsService';

/**
 * Google Analytics 4 Integration
 * 
 * Setup:
 * 1. Get Measurement ID from Google Analytics
 * 2. Add to environment: VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 * 3. Call initializeGoogleAnalytics() in App.tsx
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Initialize Google Analytics 4
 */
export function initializeGoogleAnalytics(measurementId: string) {
  if (!measurementId) {
    logger.warn('Google Analytics: Measurement ID not provided');
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];

  // Define gtag function
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }

  window.gtag = gtag;

  // Initialize GA4
  gtag('js', new Date());
  gtag('config', measurementId, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
  });

  // Load GA script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  logger.info('Google Analytics initialized', { measurementId });

  // Setup event forwarding
  setupEventForwarding();
}

/**
 * Setup event forwarding from our analytics to Google Analytics
 */
function setupEventForwarding() {
  // Listen for analytics events and forward to GA4
  const originalTrackEvent = analytics.trackEvent;

  analytics.trackEvent = function (type: EventType, properties?: Record<string, any>, duration?: number) {
    // Call original method
    const result = originalTrackEvent.call(this, type, properties, duration);

    // Forward to Google Analytics
    if (window.gtag) {
      const eventName = convertEventTypeToGaEvent(type);
      const eventData = {
        ...properties,
        duration,
      };

      window.gtag('event', eventName, eventData);
    }

    return result;
  };
}

/**
 * Convert our event types to Google Analytics event names
 */
function convertEventTypeToGaEvent(type: EventType): string {
  const mapping: Record<EventType, string> = {
    [EventType.USER_LOGIN]: 'login',
    [EventType.USER_LOGOUT]: 'logout',
    [EventType.USER_SIGNUP]: 'sign_up',
    [EventType.USER_PROFILE_UPDATE]: 'user_profile_update',
    [EventType.TEST_STARTED]: 'test_started',
    [EventType.TEST_COMPLETED]: 'test_completed',
    [EventType.TEST_FAILED]: 'test_failed',
    [EventType.TEST_SKIPPED]: 'test_skipped',
    [EventType.FEATURE_USED]: 'feature_used',
    [EventType.BUTTON_CLICKED]: 'button_clicked',
    [EventType.PAGE_VIEWED]: 'page_view',
    [EventType.MODAL_OPENED]: 'modal_opened',
    [EventType.MODAL_CLOSED]: 'modal_closed',
    [EventType.AI_CHAT_STARTED]: 'ai_chat_started',
    [EventType.AI_CHAT_MESSAGE]: 'ai_chat_message',
    [EventType.AI_VOICE_USED]: 'ai_voice_used',
    [EventType.API_CALL]: 'api_call',
    [EventType.PAGE_LOAD]: 'page_load',
    [EventType.PERFORMANCE_METRIC]: 'performance_metric',
    [EventType.ERROR_OCCURRED]: 'error_occurred',
    [EventType.API_ERROR]: 'api_error',
    [EventType.BADGE_EARNED]: 'badge_earned',
    [EventType.STREAK_UPDATED]: 'streak_updated',
    [EventType.EXERCISE_COMPLETED]: 'exercise_completed',
    [EventType.REMINDER_SET]: 'reminder_set',
  };

  return mapping[type] || type;
}

/**
 * Track page view in Google Analytics
 */
export function trackPageViewGA(page: string, title?: string) {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: page,
      page_title: title || document.title,
    });
  }
}

/**
 * Track event in Google Analytics
 */
export function trackEventGA(eventName: string, properties?: Record<string, any>) {
  if (window.gtag) {
    window.gtag('event', eventName, properties);
  }
}

/**
 * Set user ID in Google Analytics
 */
export function setUserIdGA(userId: string) {
  if (window.gtag) {
    window.gtag('config', {
      user_id: userId,
    });
  }
}

/**
 * Set user properties in Google Analytics
 */
export function setUserPropertiesGA(properties: Record<string, any>) {
  if (window.gtag) {
    window.gtag('set', {
      user_properties: properties,
    });
  }
}

/**
 * Track exception in Google Analytics
 */
export function trackExceptionGA(description: string, fatal: boolean = false) {
  if (window.gtag) {
    window.gtag('event', 'exception', {
      description,
      fatal,
    });
  }
}

/**
 * Track timing in Google Analytics
 */
export function trackTimingGA(
  category: string,
  variable: string,
  time: number,
  label?: string
) {
  if (window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: variable,
      value: time,
      event_category: category,
      event_label: label,
    });
  }
}

