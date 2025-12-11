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

// Generic fetch with retry, timeout, and 5xx backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = 15000, ...rest } = options;
  let lastError: any;
  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...rest, signal: controller.signal });
      clearTimeout(timer);
      if (res.status >= 500 && attempt < 2) {
        const delay = Math.pow(2, attempt) * 500;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      return res;
    } catch (e) {
      clearTimeout(timer);
      lastError = e;
      if (attempt < 2) {
        const delay = Math.pow(2, attempt) * 500;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
    }
  }
  throw lastError || new Error('Network error');
}

// Simple guardrails: sanitize and rate limit
function sanitizeUserMessage(input: string): string {
  // Remove potential HTML/script and trim length
  const text = input.replace(/<[^>]*>?/gm, '').replace(/[\u0000-\u001F\u007F]/g, '').trim();
  return text.slice(0, 500);
}

let lastCallTs = 0;
const COOLDOWN_MS = 1200;

export class ChatbotService {
  /**
   * 💬 Chat with Dr. Eva via Worker API (Streaming via SSE emulation)
   */
  async chatStream(
    message: string,
    lastTestResult: any,
    userProfile: any,
    language: 'vi' | 'en',
    onChunk: (chunk: string) => void
  ): Promise<string> {
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        onChunk(language === 'vi' ? 'Bạn đang ngoại tuyến. ' : 'You are offline. ');
        return language === 'vi'
          ? 'Bạn đang ngoại tuyến. Vui lòng kiểm tra kết nối Internet.'
          : 'You are offline. Please check your Internet connection.';
      }

      // Rate limit is handled in chat(); avoid double-checking here to prevent false "please wait" responses
      // See issue: chatStream invoked chat() immediately, causing cooldown to trigger.

      const safeMessage = sanitizeUserMessage(message);
      if (!safeMessage) {
        return language === 'vi' ? 'Nội dung trống.' : 'Empty message.';
      }

      const token = getAuthToken();

      // Streaming endpoint not available: call regular chat and emit once
      const full = await this.chat(message, lastTestResult, userProfile, language);
      onChunk(full);
      return full;
    } catch (e: any) {
      const fallback = language === 'vi'
        ? 'Xin lỗi, AI đang bận. Vui lòng thử lại sau.'
        : 'Sorry, the AI is busy. Please try again later.';
      onChunk(fallback);
      return fallback;
    }
  }

  /**
   * 💬 Chat with Dr. Eva via Worker API
   */
  async chat(message: string, lastTestResult: any, userProfile: any, language: 'vi' | 'en'): Promise<string> {
    try {
      // Quick offline check
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return language === 'vi'
          ? 'Bạn đang ngoại tuyến. Vui lòng kiểm tra kết nối Internet.'
          : 'You are offline. Please check your Internet connection.';
      }

      // Rate limit to protect backend and UX
      const now = Date.now();
      if (now - lastCallTs < COOLDOWN_MS) {
        return language === 'vi'
          ? 'Vui lòng chờ một chút trước khi gửi tiếp.'
          : 'Please wait a moment before sending another message.';
      }
      lastCallTs = now;

      // Sanitize user input
      const safeMessage = sanitizeUserMessage(message);
      if (!safeMessage) {
        return language === 'vi' ? 'Nội dung trống.' : 'Empty message.';
      }

      const token = getAuthToken();

      const response = await fetchWithRetry(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: safeMessage,
          lastTestResult,
          userProfile,
          language,
        }),
        timeoutMs: 15000,
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
      // Return graceful fallback instead of throwing to keep UI responsive
      return language === 'vi'
        ? 'Xin lỗi, AI đang bận. Vui lòng thử lại sau.'
        : 'Sorry, the AI is busy. Please try again later.';
    }
  }

  /**
   * Legacy methods - redirect to Worker API
   */
  async report(testType: string, testData: any, history: any[], language: 'vi' | 'en') {
    try {
      const token = getAuthToken();

      const response = await fetchWithRetry(`${API_BASE_URL}/api/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ testType, testData, history, language }),
        timeoutMs: 20000,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Report error:', error);
      // Graceful fallback for UI
      return {
        id: `report_${Date.now()}`,
        testType,
        timestamp: new Date().toISOString(),
        confidence: 60,
        summary: language === 'vi' ? 'Không thể tạo báo cáo lúc này.' : 'Unable to generate report right now.',
        recommendations: [],
        severity: 'LOW',
        prediction: '',
        trend: '',
      };
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
