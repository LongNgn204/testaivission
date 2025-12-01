import { analytics, EventType } from '../analyticsService';

describe('AnalyticsService', () => {
  beforeEach(() => {
    analytics.clear();
    jest.clearAllMocks();
  });

  describe('Event Tracking', () => {
    it('should track events', () => {
      const eventId = analytics.trackEvent(EventType.TEST_COMPLETED, {
        testType: 'snellen',
        score: 20,
      });

      expect(eventId).toBeDefined();
      const events = analytics.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(EventType.TEST_COMPLETED);
    });

    it('should track page views', () => {
      analytics.trackPageView('/home', { referrer: 'google' });
      const events = analytics.getEvents();

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(EventType.PAGE_VIEWED);
      expect(events[0].properties?.page).toBe('/home');
    });

    it('should track test completion', () => {
      analytics.trackTestCompletion('snellen', 20, 120, { difficulty: 'easy' });
      const events = analytics.getEvents();

      expect(events).toHaveLength(1);
      expect(events[0].properties?.testType).toBe('snellen');
      expect(events[0].properties?.score).toBe(20);
    });

    it('should track feature usage', () => {
      analytics.trackFeatureUsage('hospital_locator', { resultsCount: 5 });
      const events = analytics.getEvents();

      expect(events).toHaveLength(1);
      expect(events[0].properties?.feature).toBe('hospital_locator');
    });

    it('should track button clicks', () => {
      analytics.trackButtonClick('submit_button', { page: 'login' });
      const events = analytics.getEvents();

      expect(events).toHaveLength(1);
      expect(events[0].properties?.button).toBe('submit_button');
    });

    it('should track API calls', () => {
      analytics.trackApiCall('/api/test', 'GET', 200, 150, { cached: true });
      const events = analytics.getEvents();

      expect(events).toHaveLength(1);
      expect(events[0].properties?.endpoint).toBe('/api/test');
      expect(events[0].properties?.status).toBe(200);
    });

    it('should track errors', () => {
      analytics.trackError('API timeout', { endpoint: '/api/test' });
      const events = analytics.getEvents();

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(EventType.ERROR_OCCURRED);
    });

    it('should track AI interactions', () => {
      analytics.trackAiInteraction('chat', { message: 'Hello' });
      const events = analytics.getEvents();

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(EventType.AI_CHAT_MESSAGE);
    });

    it('should track badge earned', () => {
      analytics.trackBadgeEarned('test_master', { points: 100 });
      const events = analytics.getEvents();

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(EventType.BADGE_EARNED);
    });
  });

  describe('Session Management', () => {
    it('should create session on initialization', () => {
      const session = analytics.getSession();

      expect(session.id).toBeDefined();
      expect(session.startTime).toBeDefined();
      expect(session.deviceInfo).toBeDefined();
    });

    it('should track page views in session', () => {
      analytics.trackPageView('/home');
      analytics.trackPageView('/about');

      const session = analytics.getSession();
      expect(session.pageViews).toBe(2);
    });

    it('should track event count in session', () => {
      analytics.trackEvent(EventType.BUTTON_CLICKED);
      analytics.trackEvent(EventType.PAGE_VIEWED);

      const session = analytics.getSession();
      expect(session.events).toBe(2);
    });
  });

  describe('Event Filtering', () => {
    beforeEach(() => {
      analytics.trackEvent(EventType.TEST_COMPLETED);
      analytics.trackEvent(EventType.TEST_COMPLETED);
      analytics.trackEvent(EventType.PAGE_VIEWED);
      analytics.trackEvent(EventType.ERROR_OCCURRED);
    });

    it('should filter events by type', () => {
      const testEvents = analytics.getEventsByType(EventType.TEST_COMPLETED);

      expect(testEvents).toHaveLength(2);
      expect(testEvents.every(e => e.type === EventType.TEST_COMPLETED)).toBe(true);
    });

    it('should get all events', () => {
      const allEvents = analytics.getEvents();

      expect(allEvents.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Analytics Summary', () => {
    beforeEach(() => {
      analytics.trackPageView('/home');
      analytics.trackEvent(EventType.TEST_COMPLETED);
      analytics.trackEvent(EventType.TEST_COMPLETED);
      analytics.trackEvent(EventType.ERROR_OCCURRED);
    });

    it('should generate summary', () => {
      const summary = analytics.getSummary();

      expect(summary.sessionId).toBeDefined();
      expect(summary.pageViews).toBe(1);
      expect(summary.events).toBe(4);
      expect(summary.eventsByType).toBeDefined();
    });

    it('should count events by type in summary', () => {
      const summary = analytics.getSummary();

      expect(summary.eventsByType[EventType.TEST_COMPLETED]).toBe(2);
      expect(summary.eventsByType[EventType.ERROR_OCCURRED]).toBe(1);
    });
  });

  describe('Data Export', () => {
    it('should export analytics data', () => {
      analytics.trackEvent(EventType.TEST_COMPLETED);
      const exported = analytics.export();

      expect(exported.session).toBeDefined();
      expect(exported.events).toBeDefined();
      expect(exported.summary).toBeDefined();
      expect(exported.exportedAt).toBeDefined();
    });

    it('should export valid JSON', () => {
      analytics.trackEvent(EventType.TEST_COMPLETED);
      const exported = analytics.export();
      const json = JSON.stringify(exported);

      expect(() => JSON.parse(json)).not.toThrow();
    });
  });

  describe('Data Management', () => {
    it('should maintain max events limit', () => {
      // Add more events than max
      for (let i = 0; i < 1100; i++) {
        analytics.trackEvent(EventType.PAGE_VIEWED);
      }

      const events = analytics.getEvents();
      expect(events.length).toBeLessThanOrEqual(1000);
    });

    it('should clear all data', () => {
      analytics.trackEvent(EventType.TEST_COMPLETED);
      expect(analytics.getEvents().length).toBeGreaterThan(0);

      analytics.clear();
      expect(analytics.getEvents()).toHaveLength(0);
    });
  });
});

