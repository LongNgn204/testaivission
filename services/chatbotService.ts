/**
 * ============================================================
 * 💬 ChatbotService - Direct OpenRouter API Calls
 * ============================================================
 * 
 * Gọi trực tiếp OpenRouter API từ frontend
 * Không còn phụ thuộc backend
 */

import { openRouterChat, hasOpenRouterKey } from './openRouterService';

export class ChatbotService {
  /**
   * 💬 Chat with Dr. Eva via OpenRouter
   */
  async chat(message: string, lastTestResult: any, userProfile: any, language: 'vi' | 'en'): Promise<string> {
    if (!hasOpenRouterKey()) {
      throw new Error(language === 'vi'
        ? 'Chưa cấu hình OpenRouter API Key'
        : 'OpenRouter API Key not configured');
    }

    try {
      const response = await openRouterChat(message, lastTestResult, userProfile, language);
      return response;
    } catch (error: any) {
      console.error('Chat error:', error.message);
      throw new Error(language === 'vi'
        ? 'Không thể kết nối với AI: ' + error.message
        : 'Cannot connect to AI: ' + error.message);
    }
  }

  /**
   * Legacy methods - redirect to OpenRouter
   */
  async report(testType: string, testData: any, history: any[], language: 'vi' | 'en') {
    const { openRouterReport } = await import('./openRouterService');
    return await openRouterReport(testType, testData, history, language);
  }

  async routine(userProfile: any, testResults: any[], language: 'vi' | 'en') {
    const { openRouterRoutine } = await import('./openRouterService');
    return await openRouterRoutine(userProfile, language);
  }

  async tip(userProfile: any, language: 'vi' | 'en') {
    const { openRouterProactiveTip } = await import('./openRouterService');
    return await openRouterProactiveTip(null, userProfile, language);
  }

  async dashboard(testHistory: any[], language: 'vi' | 'en') {
    const { openRouterDashboard } = await import('./openRouterService');
    return await openRouterDashboard(testHistory, language);
  }
}
