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
  return text.slice(0, 2000); // Tăng limit từ 500 lên 2000 để cho phép tin nhắn dài hơn
}

let lastCallTs = 0;
const COOLDOWN_MS = 300; // Giảm từ 1200ms xuống 300ms để phản hồi nhanh hơn

export class ChatbotService {
  /**
   * 💬 Chat with Dr. Eva via Worker API (Streaming via SSE emulation)
   */
  async chatStream(
    message: string,
    lastTestResult: any,
    userProfile: any,
    language: 'vi' | 'en',
    onChunk: (chunk: string) => void,
    options?: { model?: string; temperature?: number; topP?: number; maxTokens?: number }
  ): Promise<string> {
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        onChunk(language === 'vi' ? 'Bạn đang ngoại tuyến. ' : 'You are offline. ');
        return language === 'vi'
          ? 'Bạn đang ngoại tuyến. Vui lòng kiểm tra kết nối Internet.'
          : 'You are offline. Please check your Internet connection.';
      }

      const safeMessage = sanitizeUserMessage(message);
      if (!safeMessage) {
        return language === 'vi' ? 'Nội dung trống.' : 'Empty message.';
      }

      const token = getAuthToken();

      // Use SSE over fetch to preserve Authorization header
      const res = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: safeMessage,
          lastTestResult,
          userProfile,
          language,
          model: options?.model,
          temperature: options?.temperature,
          topP: options?.topP,
          maxTokens: options?.maxTokens,
        }),
      });

      if (!res.ok || !res.body) {
        // Fallback to non-streaming
        const full = await this.chat(message, lastTestResult, userProfile, language);
        onChunk(full);
        return full;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let final = '';

      const processBuffer = () => {
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const raw = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const lines = raw.split('\n');
          let event: string | null = null;
          let data = '';
          for (const line of lines) {
            if (line.startsWith('event:')) event = line.slice(6).trim();
            else if (line.startsWith('data:')) data += line.slice(5).trim();
          }
          if (!event) {
            // default event is message; treat as data
            if (data) {
              onChunk(data);
              final += data;
            }
          } else if (event === 'done') {
            // stop
            return true;
          } else if (event === 'error') {
            // relay error
            onChunk('');
            return true;
          } else {
            // unknown event -> treat as data
            if (data) {
              onChunk(data);
              final += data;
            }
          }
        }
        return false;
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const shouldStop = processBuffer();
        if (shouldStop) break;
      }

      // Process any remaining data
      if (buffer.length > 0) {
        buffer += '\n\n';
        processBuffer();
      }

      return final || (language === 'vi' ? 'Không có nội dung.' : 'No content.');
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
