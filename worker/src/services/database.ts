/**
 * ============================================================
 * 🗄️ D1 Database Service
 * ============================================================
 * 
 * Handles all database operations with Cloudflare D1
 */

import type {
  User,
  Session,
  TestResult,
  AIReport,
  Routine,
  Reminder,
  ChatHistory,
  UserSettings
} from '../types';

export class DatabaseService {
  constructor(private db: D1Database) { }

  async trackCost(params: {
    userId?: string | null;
    service: 'llm' | 'embedding' | 'tts' | 'stt';
    endpoint?: string;
    tokensInput?: number;
    tokensOutput?: number;
    costUsd?: number;
  }): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO cost_tracking (id, user_id, service, endpoint, tokens_input, tokens_output, cost_usd, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        `cost_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        params.userId ?? null,
        params.service,
        params.endpoint ?? null,
        params.tokensInput ?? null,
        params.tokensOutput ?? null,
        params.costUsd ?? 0,
        Date.now()
      )
      .run();
  }

  // ============================================================
  // User Operations
  // ============================================================

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const id = `user_${user.phone.replace(/\D/g, '')}`;
    const now = Date.now();

    const userData: User = {
      id,
      ...user,
      created_at: now,
      updated_at: now,
    };

    await this.db
      .prepare(
        `INSERT INTO users (id, name, age, phone, email, avatar_url, created_at, updated_at, last_login, profile_data)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        userData.id,
        userData.name,
        userData.age,
        userData.phone,
        userData.email || null,
        userData.avatar_url || null,
        userData.created_at,
        userData.updated_at,
        userData.last_login || null,
        userData.profile_data || null
      )
      .run();

    return userData;
  }

  async getUserById(userId: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(userId)
      .first<User>();

    return result || null;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE phone = ?')
      .bind(phone)
      .first<User>();

    return result || null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return;

    fields.push('updated_at = ?');
    values.push(now, userId);

    await this.db
      .prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await this.db
      .prepare('UPDATE users SET last_login = ?, updated_at = ? WHERE id = ?')
      .bind(Date.now(), Date.now(), userId)
      .run();
  }

  // ============================================================
  // Session Operations
  // ============================================================

  async createSession(session: Omit<Session, 'id' | 'created_at'>): Promise<Session> {
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const sessionData: Session = {
      id,
      ...session,
      created_at: now,
    };

    await this.db
      .prepare(
        `INSERT INTO sessions (id, user_id, token, created_at, expires_at, device_info)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        sessionData.id,
        sessionData.user_id,
        sessionData.token,
        sessionData.created_at,
        sessionData.expires_at,
        sessionData.device_info || null
      )
      .run();

    return sessionData;
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    const result = await this.db
      .prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > ?')
      .bind(token, Date.now())
      .first<Session>();

    return result || null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM sessions WHERE id = ?')
      .bind(sessionId)
      .run();
  }

  async deleteExpiredSessions(): Promise<void> {
    await this.db
      .prepare('DELETE FROM sessions WHERE expires_at < ?')
      .bind(Date.now())
      .run();
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM sessions WHERE user_id = ?')
      .bind(userId)
      .run();
  }

  // ============================================================
  // Test Results Operations
  // ============================================================

  async saveTestResult(test: Omit<TestResult, 'id' | 'created_at'>): Promise<TestResult> {
    const id = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const testData: TestResult = {
      id,
      ...test,
      created_at: now,
    };

    await this.db
      .prepare(
        `INSERT INTO test_results (id, user_id, test_type, test_data, score, result, notes, created_at, duration)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        testData.id,
        testData.user_id,
        testData.test_type,
        testData.test_data,
        testData.score || null,
        testData.result || null,
        testData.notes || null,
        testData.created_at,
        testData.duration || null
      )
      .run();

    return testData;
  }

  async getTestResultById(testId: string): Promise<TestResult | null> {
    const result = await this.db
      .prepare('SELECT * FROM test_results WHERE id = ?')
      .bind(testId)
      .first<TestResult>();

    return result || null;
  }

  async getTestResultByTimestamp(userId: string, timestamp: string): Promise<TestResult | null> {
    const result = await this.db
      .prepare('SELECT * FROM test_results WHERE user_id = ? AND created_at = ?')
      .bind(userId, timestamp)
      .first<TestResult>();

    return result || null;
  }

  async getUserTestHistory(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<{ tests: TestResult[]; total: number }> {
    const tests = await this.db
      .prepare(
        `SELECT * FROM test_results 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`
      )
      .bind(userId, limit, offset)
      .all<TestResult>();

    const countResult = await this.db
      .prepare('SELECT COUNT(*) as count FROM test_results WHERE user_id = ?')
      .bind(userId)
      .first<{ count: number }>();

    return {
      tests: tests.results || [],
      total: countResult?.count || 0,
    };
  }

  async getUserTestsByType(
    userId: string,
    testType: string,
    limit: number = 50
  ): Promise<TestResult[]> {
    const result = await this.db
      .prepare(
        `SELECT * FROM test_results 
         WHERE user_id = ? AND test_type = ? 
         ORDER BY created_at DESC 
         LIMIT ?`
      )
      .bind(userId, testType, limit)
      .all<TestResult>();

    return result.results || [];
  }

  // ============================================================
  // AI Reports Operations
  // ============================================================

  async saveAIReport(report: Omit<AIReport, 'id' | 'created_at'>): Promise<AIReport> {
    const id = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const reportData: AIReport = {
      id,
      ...report,
      created_at: now,
    };

    await this.db
      .prepare(
        `INSERT INTO ai_reports (id, test_result_id, user_id, report_type, report_data, language, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        reportData.id,
        reportData.test_result_id,
        reportData.user_id,
        reportData.report_type,
        reportData.report_data,
        reportData.language,
        reportData.created_at
      )
      .run();

    return reportData;
  }

  async getReportByTestId(testResultId: string, language: string): Promise<AIReport | null> {
    const result = await this.db
      .prepare('SELECT * FROM ai_reports WHERE test_result_id = ? AND language = ? ORDER BY created_at DESC LIMIT 1')
      .bind(testResultId, language)
      .first<AIReport>();

    return result || null;
  }

  // ============================================================
  // Routines Operations
  // ============================================================

  async saveRoutine(routine: Omit<Routine, 'id' | 'created_at'>): Promise<Routine> {
    const id = `routine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const routineData: Routine = {
      id,
      ...routine,
      created_at: now,
    };

    // Deactivate previous routines
    await this.db
      .prepare('UPDATE routines SET is_active = 0 WHERE user_id = ?')
      .bind(routine.user_id)
      .run();

    // Insert new routine
    await this.db
      .prepare(
        `INSERT INTO routines (id, user_id, routine_data, language, created_at, is_active)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        routineData.id,
        routineData.user_id,
        routineData.routine_data,
        routineData.language,
        routineData.created_at,
        routineData.is_active
      )
      .run();

    return routineData;
  }

  async getActiveRoutine(userId: string): Promise<Routine | null> {
    const result = await this.db
      .prepare('SELECT * FROM routines WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1')
      .bind(userId)
      .first<Routine>();

    return result || null;
  }

  // ============================================================
  // Reminders Operations
  // ============================================================

  async saveReminder(reminder: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>): Promise<Reminder> {
    const id = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const reminderData: Reminder = {
      id,
      ...reminder,
      created_at: now,
      updated_at: now,
    };

    await this.db
      .prepare(
        `INSERT INTO reminders (id, user_id, routine_id, title, description, schedule_time, days, is_enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        reminderData.id,
        reminderData.user_id,
        reminderData.routine_id || null,
        reminderData.title,
        reminderData.description || null,
        reminderData.schedule_time,
        reminderData.days,
        reminderData.is_enabled,
        reminderData.created_at,
        reminderData.updated_at
      )
      .run();

    return reminderData;
  }

  async getUserReminders(userId: string): Promise<Reminder[]> {
    const result = await this.db
      .prepare('SELECT * FROM reminders WHERE user_id = ? ORDER BY schedule_time ASC')
      .bind(userId)
      .all<Reminder>();

    return result.results || [];
  }

  async updateReminder(reminderId: string, updates: Partial<Reminder>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return;

    fields.push('updated_at = ?');
    values.push(Date.now(), reminderId);

    await this.db
      .prepare(`UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async deleteReminder(reminderId: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM reminders WHERE id = ?')
      .bind(reminderId)
      .run();
  }

  // ============================================================
  // Chat History Operations
  // ============================================================

  async saveChatHistory(chat: Omit<ChatHistory, 'id' | 'created_at'>): Promise<ChatHistory> {
    const id = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const chatData: ChatHistory = {
      id,
      ...chat,
      created_at: now,
    };

    await this.db
      .prepare(
        `INSERT INTO chat_history (id, user_id, message, response, context_data, language, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        chatData.id,
        chatData.user_id,
        chatData.message,
        chatData.response,
        chatData.context_data || null,
        chatData.language,
        chatData.created_at
      )
      .run();

    return chatData;
  }

  async getUserChatHistory(userId: string, limit: number = 50): Promise<ChatHistory[]> {
    const result = await this.db
      .prepare(
        `SELECT * FROM chat_history 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`
      )
      .bind(userId, limit)
      .all<ChatHistory>();

    return result.results || [];
  }

  // ============================================================
  // User Settings Operations
  // ============================================================

  async saveUserSettings(settings: Omit<UserSettings, 'updated_at'>): Promise<UserSettings> {
    const now = Date.now();
    const settingsData: UserSettings = {
      ...settings,
      updated_at: now,
    };

    await this.db
      .prepare(
        `INSERT OR REPLACE INTO user_settings (user_id, language, theme, notifications_enabled, voice_enabled, settings_data, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        settingsData.user_id,
        settingsData.language,
        settingsData.theme,
        settingsData.notifications_enabled,
        settingsData.voice_enabled,
        settingsData.settings_data || null,
        settingsData.updated_at
      )
      .run();

    return settingsData;
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const result = await this.db
      .prepare('SELECT * FROM user_settings WHERE user_id = ?')
      .bind(userId)
      .first<UserSettings>();

    return result || null;
  }

  // ============================================================
  // Analytics Operations
  // ============================================================

  async trackEvent(
    eventType: string,
    userId?: string,
    eventData?: any
  ): Promise<void> {
    const id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await this.db
      .prepare(
        `INSERT INTO analytics (id, user_id, event_type, event_data, created_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        userId || null,
        eventType,
        eventData ? JSON.stringify(eventData) : null,
        Date.now()
      )
      .run();
  }

  // ============================================================
  // Utility Operations
  // ============================================================

  async cleanup(): Promise<void> {
    // Delete expired sessions
    await this.deleteExpiredSessions();

    // Delete old analytics (keep last 90 days)
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    await this.db
      .prepare('DELETE FROM analytics WHERE created_at < ?')
      .bind(ninetyDaysAgo)
      .run();
  }
}
