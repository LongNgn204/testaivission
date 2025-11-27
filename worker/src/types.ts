/**
 * ============================================================
 * 📝 Type Definitions
 * ============================================================
 */

export interface Env {
  CACHE: KVNamespace;
  GEMINI_API_KEY: string;
  ENVIRONMENT?: string;
}

export interface TestData {
  testType: string;
  testData: any;
  history: any[];
  language: 'vi' | 'en';
}

export interface DashboardRequest {
  history: any[];
  language: 'vi' | 'en';
}

export interface ChatRequest {
  message: string;
  lastTestResult?: any;
  userProfile?: any;
  language: 'vi' | 'en';
}

export interface RoutineRequest {
  answers: {
    worksWithComputer: string;
    wearsGlasses: string;
    goal: string;
  };
  language: 'vi' | 'en';
}

export interface ProactiveTipRequest {
  lastTest?: any;
  userProfile?: any;
  language: 'vi' | 'en';
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  fromCache?: boolean;
}

export interface RateLimitConfig {
  limit: number;
  window: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

