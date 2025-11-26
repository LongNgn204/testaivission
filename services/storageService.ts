/**
 * =================================================================
 * 💾 StorageService - Lưu trữ lịch sử bài test + báo cáo AI theo người dùng
 * =================================================================
 *
 * MỤC ĐÍCH:
 * - Ghi lại mỗi lần làm test: raw result (resultData) + AI report (report)
 * - Lấy lịch sử test theo user hiện tại (phân vùng theo số điện thoại)
 * - Giới hạn tối đa 50 bản ghi gần nhất để tránh phình localStorage
 *
 * CÁCH DÙNG:
 *   import { StorageService } from '../services/storageService';
 *   const storage = new StorageService();
 *   storage.saveTestResult(resultData, report);
 *   const history = storage.getTestHistory();
 *   storage.clearHistory();
 */
import { StoredTestResult, TestResultData, AIReport } from '../types';

const HISTORY_KEY_PREFIX = 'aiVisionTestHistory_';

export class StorageService {
  // Get current user ID from localStorage
  private getUserId(): string {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        // Create unique ID from phone number
        return user.phone || 'default';
      }
    } catch (error) {
      console.error("Failed to get user ID:", error);
    }
    return 'default';
  }

  private getHistoryKey(): string {
    return `${HISTORY_KEY_PREFIX}${this.getUserId()}`;
  }

  saveTestResult(resultData: TestResultData, report: AIReport): void {
    try {
      const history = this.getTestHistory();
      const newResult: StoredTestResult = {
        id: report.id,
        testType: report.testType,
        date: resultData.date,
        resultData,
        report,
      };
      history.unshift(newResult); // Add to the beginning
      localStorage.setItem(this.getHistoryKey(), JSON.stringify(history.slice(0, 50))); // Limit history to 50 entries per user
    } catch (error) {
      console.error("Failed to save test result to localStorage:", error);
    }
  }

  getTestHistory(): StoredTestResult[] {
    try {
      const historyJson = localStorage.getItem(this.getHistoryKey());
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error("Failed to retrieve test history from localStorage:", error);
      return [];
    }
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(this.getHistoryKey());
    } catch (error) {
      console.error("Failed to clear history from localStorage:", error);
    }
  }
}