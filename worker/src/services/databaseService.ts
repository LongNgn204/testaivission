/**
 * ========================================
 * DATABASE SERVICE
 * ========================================
 * D1 database operations với optimization
 * Tuân thủ TypeScript strict mode
 */

export interface QueryOptions {
  timeout?: number;
  cache?: boolean;
  cacheTTL?: number;
}

/**
 * Database service for D1
 */
export class DatabaseService {
  private db: D1Database;
  private queryCache: Map<string, { data: unknown; expiresAt: number }> = new Map();

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Execute query with caching
   */
  async query<T = unknown>(
    sql: string,
    params: unknown[] = [],
    options: QueryOptions = {}
  ): Promise<T[]> {
    const { cache = true, cacheTTL = 300 } = options;

    // Check cache
    if (cache) {
      const cacheKey = this.generateCacheKey(sql, params);
      const cached = this.queryCache.get(cacheKey);

      if (cached && cached.expiresAt > Date.now()) {
        return cached.data as T[];
      }
    }

    // Execute query
    const result = await this.db
      .prepare(sql)
      .bind(...params)
      .all();

    const data = (result.results ?? []) as T[];

    // Cache result
    if (cache) {
      const cacheKey = this.generateCacheKey(sql, params);
      this.queryCache.set(cacheKey, {
        data,
        expiresAt: Date.now() + cacheTTL * 1000,
      });
    }

    return data;
  }

  /**
   * Execute single row query
   */
  async queryOne<T = unknown>(
    sql: string,
    params: unknown[] = [],
    options: QueryOptions = {}
  ): Promise<T | null> {
    const results = await this.query<T>(sql, params, options);
    return results[0] ?? null;
  }

  /**
   * Execute insert/update/delete
   */
  async execute(
    sql: string,
    params: unknown[] = []
  ): Promise<{ success: boolean; changes: number }> {
    // Clear cache for write operations
    this.clearCache();

    const result = await this.db
      .prepare(sql)
      .bind(...params)
      .run();

    return {
      success: result.success ?? false,
      changes: result.meta?.changes ?? 0,
    };
  }

  /**
   * Batch insert
   */
  async batchInsert<T extends Record<string, unknown>>(
    table: string,
    rows: T[]
  ): Promise<{ success: boolean; changes: number }> {
    if (rows.length === 0) {
      return { success: true, changes: 0 };
    }

    // Build batch insert query
    const columns = Object.keys(rows[0]!);
    const placeholders = rows.map(() => `(${columns.map(() => '?').join(',')})`).join(',');

    const values = rows.flatMap((row) => columns.map((col) => row[col]));

    const sql = `INSERT INTO ${table} (${columns.join(',')}) VALUES ${placeholders}`;

    return this.execute(sql, values);
  }

  /**
   * Get user test results
   */
  async getUserTestResults(
    userId: string,
    limit: number = 10
  ): Promise<Array<{ id: string; testType: string; date: string; score?: string }>> {
    return this.query(
      `SELECT id, test_type as testType, created_at as date, score 
       FROM test_results 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit],
      { cache: true, cacheTTL: 60 }
    );
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<{
    totalTests: number;
    lastTestDate: string | null;
    testsByType: Record<string, number>;
  }> {
    const result = await this.queryOne<{
      total_tests: number;
      last_test_date: string | null;
    }>(
      `SELECT 
        COUNT(*) as total_tests,
        MAX(created_at) as last_test_date
       FROM test_results 
       WHERE user_id = ?`,
      [userId],
      { cache: true, cacheTTL: 300 }
    );

    const testsByType = await this.query<{ test_type: string; count: number }>(
      `SELECT test_type, COUNT(*) as count 
       FROM test_results 
       WHERE user_id = ? 
       GROUP BY test_type`,
      [userId],
      { cache: true, cacheTTL: 300 }
    );

    return {
      totalTests: result?.total_tests ?? 0,
      lastTestDate: result?.last_test_date ?? null,
      testsByType: Object.fromEntries(
        testsByType.map((row) => [row.test_type, row.count])
      ),
    };
  }

  /**
   * Save test result
   */
  async saveTestResult(
    userId: string,
    testType: string,
    testData: Record<string, unknown>,
    score?: string
  ): Promise<{ id: string }> {
    const id = this.generateId();

    await this.execute(
      `INSERT INTO test_results (id, user_id, test_type, test_data, score, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [id, userId, testType, JSON.stringify(testData), score]
    );

    return { id };
  }

  /**
   * Save AI report
   */
  async saveAIReport(
    testResultId: string,
    userId: string,
    testType: string,
    report: Record<string, unknown>
  ): Promise<{ id: string }> {
    const id = this.generateId();

    await this.execute(
      `INSERT INTO ai_reports (id, test_result_id, user_id, test_type, summary, recommendations, confidence, severity, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        id,
        testResultId,
        userId,
        testType,
        report.summary ?? '',
        JSON.stringify(report.recommendations ?? []),
        report.confidence ?? 0,
        report.severity ?? 'LOW',
      ]
    );

    return { id };
  }

  /**
   * Clear query cache
   */
  clearCache(): void {
    this.queryCache.clear();
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(sql: string, params: unknown[]): string {
    return `${sql}:${JSON.stringify(params)}`;
  }

  /**
   * Track LLM cost/usage
   */
  async trackCost(params: {
    userId?: string | null;
    service: 'llm' | 'embedding' | 'tts' | 'stt';
    endpoint?: string;
    tokensInput?: number;
    tokensOutput?: number;
    costUsd?: number;
  }): Promise<void> {
    await this.execute(
      `INSERT INTO cost_tracking (id, user_id, service, endpoint, tokens_input, tokens_output, cost_usd, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        this.generateId(),
        params.userId ?? null,
        params.service,
        params.endpoint ?? null,
        params.tokensInput ?? null,
        params.tokensOutput ?? null,
        params.costUsd ?? 0,
      ]
    );
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Create database service instance
 */
export function createDatabaseService(db: D1Database): DatabaseService {
  return new DatabaseService(db);
}

