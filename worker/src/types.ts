/**
 * ============================================================
 * 📝 Type Definitions
 * ============================================================
 */

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  GEMINI_API_KEY: string;
  JWT_SECRET: string;
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

// ============================================================
// Database Models
// ============================================================

export interface User {
  id: string;
  name: string;
  age: number;
  phone: string;
  email?: string;
  avatar_url?: string;
  created_at: number;
  updated_at: number;
  last_login?: number;
  profile_data?: string; // JSON string
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  created_at: number;
  expires_at: number;
  device_info?: string; // JSON string
}

export interface TestResult {
  id: string;
  user_id: string;
  test_type: string;
  test_data: string; // JSON string
  score?: number;
  result?: string;
  notes?: string;
  created_at: number;
  duration?: number;
}

export interface AIReport {
  id: string;
  test_result_id: string;
  user_id: string;
  report_type: string;
  report_data: string; // JSON string
  language: string;
  created_at: number;
}

export interface Routine {
  id: string;
  user_id: string;
  routine_data: string; // JSON string
  language: string;
  created_at: number;
  is_active: number;
}

export interface Reminder {
  id: string;
  user_id: string;
  routine_id?: string;
  title: string;
  description?: string;
  schedule_time: string;
  days: string; // JSON array
  is_enabled: number;
  created_at: number;
  updated_at: number;
}

export interface ChatHistory {
  id: string;
  user_id: string;
  message: string;
  response: string;
  context_data?: string; // JSON string
  language: string;
  created_at: number;
}

export interface UserSettings {
  user_id: string;
  language: string;
  theme: string;
  notifications_enabled: number;
  voice_enabled: number;
  settings_data?: string; // JSON string
  updated_at: number;
}
