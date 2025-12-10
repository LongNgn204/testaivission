/**
 * ============================================================
 * 💬 ChatbotService - Calls Worker API (Cloudflare AI)
 * ============================================================
 * 
 * Gọi Worker API thay vì OpenRouter
 * AI miễn phí 100% qua Cloudflare Workers AI
 */

import { getAuthToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vision-coach-worker.stu725114073.workers.dev';

export class ChatbotService {
  /**
   * 💬 Chat with Dr. Eva via Worker API
   */
  async chat(message: string, lastTestResult: any, userProfile: any, language: 'vi' | 'en'): Promise<string> {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message,
          lastTestResult,
          userProfile,
          language,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error((error as any)?.message || `API error: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.message || (language === 'vi'
        ? 'Xin lỗi, tôi không thể trả lời lúc này.'
        : 'Sorry, I cannot respond at this time.');
    } catch (error: any) {
      console.error('Chat error:', error.message);
      throw new Error(language === 'vi'
        ? 'Không thể kết nối với AI: ' + error.message
        : 'Cannot connect to AI: ' + error.message);
    }
  }

  /**
   * Legacy methods - redirect to Worker API
   */
  async report(testType: string, testData: any, history: any[], language: 'vi' | 'en') {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/api/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ testType, testData, history, language }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Report error:', error);
      throw error;
    }
  }

  async routine(userProfile: any, testResults: any[], language: 'vi' | 'en') {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/api/routine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ answers: userProfile, language }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Routine error:', error);
      throw error;
    }
  }

  async tip(userProfile: any, language: 'vi' | 'en') {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/api/proactive-tip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userProfile, language }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.tip || null;
    } catch (error: any) {
      console.error('Tip error:', error);
      return null;
    }
  }

  async dashboard(testHistory: any[], language: 'vi' | 'en') {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ history: testHistory, language }),
      });

      if (!response.ok) {
        console.error(`Dashboard API error: ${response.status}`);
        // Return null instead of throwing - let hook handle fallback
        return null;
      }

      return await response.json();
    } catch (error: any) {
      console.error('Dashboard error:', error);
      // Return null instead of throwing - let hook handle fallback gracefully
      return null;
    }
  }
}
