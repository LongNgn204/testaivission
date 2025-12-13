/**
 * ========================================
 * DATA STORAGE SERVICE
 * ========================================
 * Xử lý lưu trữ dữ liệu (localStorage + backend sync)
 * Tuân thủ TypeScript strict mode
 */

import { logger } from '../utils/logger';
import type { StoredTestResult, ChatMessage } from '../types';

export interface StorageConfig {
  prefix?: string;
  maxSize?: number; // bytes
}

/**
 * Data storage service
 */
class DataStorageService {
  private prefix: string;
  private maxSize: number;

  constructor(config: StorageConfig = {}) {
    this.prefix = config.prefix ?? 'vision_coach_';
    this.maxSize = config.maxSize ?? 5 * 1024 * 1024; // 5MB default
  }

  /**
   * Save test result
   */
  saveTestResult(result: StoredTestResult): void {
    try {
      const key = `${this.prefix}test_${result.id}`;
      const data = JSON.stringify(result);

      this.checkSize(data);
      localStorage.setItem(key, data);

      logger.info('Test result saved to storage', { testId: result.id }, 'DataStorageService');
    } catch (error) {
      logger.error('Failed to save test result', error, 'DataStorageService');
      throw error;
    }
  }

  /**
   * Get test result
   */
  getTestResult(testId: string): StoredTestResult | null {
    try {
      const key = `${this.prefix}test_${testId}`;
      const data = localStorage.getItem(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data) as StoredTestResult;
    } catch (error) {
      logger.warn('Failed to get test result', error, 'DataStorageService');
      return null;
    }
  }

  /**
   * Get all test results
   */
  getAllTestResults(): StoredTestResult[] {
    try {
      const results: StoredTestResult[] = [];
      const prefix = `${this.prefix}test_`;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key?.startsWith(prefix)) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              results.push(JSON.parse(data) as StoredTestResult);
            } catch (e) {
              logger.warn(`Failed to parse test result at ${key}`, e, 'DataStorageService');
            }
          }
        }
      }

      // Sort by date descending
      results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return results;
    } catch (error) {
      logger.error('Failed to get all test results', error, 'DataStorageService');
      return [];
    }
  }

  /**
   * Delete test result
   */
  deleteTestResult(testId: string): void {
    try {
      const key = `${this.prefix}test_${testId}`;
      localStorage.removeItem(key);

      logger.info('Test result deleted from storage', { testId }, 'DataStorageService');
    } catch (error) {
      logger.error('Failed to delete test result', error, 'DataStorageService');
      throw error;
    }
  }

  /**
   * Save chat message
   */
  saveChatMessage(message: ChatMessage): void {
    try {
      const key = `${this.prefix}chat_${message.timestamp}`;
      const data = JSON.stringify(message);

      this.checkSize(data);
      localStorage.setItem(key, data);

      logger.debug('Chat message saved to storage', {}, 'DataStorageService');
    } catch (error) {
      logger.error('Failed to save chat message', error, 'DataStorageService');
      throw error;
    }
  }

  /**
   * Get chat history
   */
  getChatHistory(limit: number = 50): ChatMessage[] {
    try {
      const messages: ChatMessage[] = [];
      const prefix = `${this.prefix}chat_`;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key?.startsWith(prefix)) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              messages.push(JSON.parse(data) as ChatMessage);
            } catch (e) {
              logger.warn(`Failed to parse chat message at ${key}`, e, 'DataStorageService');
            }
          }
        }
      }

      // Sort by timestamp ascending
      messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      // Return only recent messages
      return messages.slice(-limit);
    } catch (error) {
      logger.error('Failed to get chat history', error, 'DataStorageService');
      return [];
    }
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    try {
      const keysToDelete: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.prefix)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach((key) => localStorage.removeItem(key));

      logger.info('All data cleared from storage', { count: keysToDelete.length }, 'DataStorageService');
    } catch (error) {
      logger.error('Failed to clear all data', error, 'DataStorageService');
      throw error;
    }
  }

  /**
   * Get storage size
   */
  getStorageSize(): number {
    try {
      let size = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.prefix)) {
          const data = localStorage.getItem(key);
          if (data) {
            size += data.length + key.length;
          }
        }
      }

      return size;
    } catch (error) {
      logger.warn('Failed to get storage size', error, 'DataStorageService');
      return 0;
    }
  }

  /**
   * Check if storage size exceeds limit
   */
  private checkSize(newData: string): void {
    const currentSize = this.getStorageSize();
    const newSize = currentSize + newData.length;

    if (newSize > this.maxSize) {
      logger.warn(
        'Storage size limit exceeded',
        { currentSize, newSize, maxSize: this.maxSize },
        'DataStorageService'
      );
      // Could implement cleanup logic here
    }
  }
}

/**
 * Export singleton instance
 */
export const dataStorageService = new DataStorageService();

