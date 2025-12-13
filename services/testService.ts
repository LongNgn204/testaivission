/**
 * ========================================
 * TEST SERVICE
 * ========================================
 * Xử lý logic các bài test thị lực
 * Tuân thủ TypeScript strict mode
 */

import { createApiClient } from './apiClient';
import { logger } from '../utils/logger';
import { config } from '../utils/config';
import type {
  TestType,
  TestResultData,
  AIReport,
  StoredTestResult,
} from '../types';

export interface TestServiceConfig {
  apiUrl: string;
  token?: string;
}

/**
 * Test service class
 */
class TestService {
  private api: ReturnType<typeof createApiClient>;
  private token: string | null = null;

  constructor(config: TestServiceConfig) {
    this.api = createApiClient(config.apiUrl);
    this.token = config.token ?? null;
  }

  /**
   * Generate AI report for test result
   */
  async generateReport(
    testType: TestType,
    testData: TestResultData,
    language: 'vi' | 'en' = 'vi'
  ): Promise<AIReport> {
    try {
      logger.info('Generating AI report', { testType }, 'TestService');

      const response = await this.api.post<AIReport>(
        '/api/report',
        {
          testType,
          testData,
          language,
        },
        {
          headers: this.getAuthHeaders(),
        }
      );

      logger.info('Report generated successfully', { reportId: response.id }, 'TestService');
      return response;
    } catch (error) {
      logger.error('Failed to generate report', error, 'TestService');
      throw error;
    }
  }

  /**
   * Save test result to backend
   */
  async saveTestResult(result: StoredTestResult): Promise<{ success: boolean; id: string }> {
    try {
      logger.info('Saving test result', { testType: result.testType }, 'TestService');

      const response = await this.api.post<{ success: boolean; id: string }>(
        '/api/test-results',
        result,
        {
          headers: this.getAuthHeaders(),
        }
      );

      logger.info('Test result saved', { id: response.id }, 'TestService');
      return response;
    } catch (error) {
      logger.error('Failed to save test result', error, 'TestService');
      throw error;
    }
  }

  /**
   * Get test history
   */
  async getTestHistory(limit: number = 10): Promise<StoredTestResult[]> {
    try {
      logger.info('Fetching test history', { limit }, 'TestService');

      const response = await this.api.get<StoredTestResult[]>(
        `/api/test-results?limit=${limit}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      logger.info('Test history fetched', { count: response.length }, 'TestService');
      return response;
    } catch (error) {
      logger.error('Failed to fetch test history', error, 'TestService');
      throw error;
    }
  }

  /**
   * Get test statistics
   */
  async getTestStats(): Promise<{
    totalTests: number;
    testsByType: Record<TestType, number>;
    lastTestDate: string | null;
  }> {
    try {
      logger.info('Fetching test statistics', {}, 'TestService');

      const response = await this.api.get<{
        totalTests: number;
        testsByType: Record<TestType, number>;
        lastTestDate: string | null;
      }>(
        '/api/test-stats',
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response;
    } catch (error) {
      logger.error('Failed to fetch test statistics', error, 'TestService');
      throw error;
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    if (!this.token) {
      return {};
    }

    return {
      'Authorization': `Bearer ${this.token}`,
    };
  }
}

/**
 * Create test service instance
 */
export function createTestService(config: TestServiceConfig): TestService {
  return new TestService(config);
}

/**
 * Export singleton instance
 */
export const testService = createTestService({
  apiUrl: config.apiUrl,
});

