/**
 * ============================================================
 * 💬 ChatbotService - Giao tiếp với Google Gemini AI
 * ============================================================
 * 
 * Cung cấp các hàm gọi Google Gemini API trực tiếp
 * Fallback: Nếu có backend, sẽ dùng backend thay vì AI trực tiếp
 */

import { getAuthToken } from './authService';
import { GoogleGenAI } from '@google/genai';

const API_BASE_URL = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:3001';
const GEMINI_API_KEY = (import.meta as any)?.env?.VITE_GEMINI_API_KEY || '';

function authHeaders() {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// Generic fetch with retry and timeout for robustness
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

async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetchWithRetry(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'API request failed');
  }
  return data as T;
}

export class ChatbotService {
  // Try backend first, fallback to direct AI
  private async tryBackendFirst<T>(path: string, body: any): Promise<T> {
    try {
      // Try backend if available
      if (API_BASE_URL && API_BASE_URL !== 'http://localhost:3001') {
        return await apiPost<T>(path, body);
      }
    } catch (error) {
      console.warn(`Backend ${path} failed, will try direct AI if available`);
    }
    throw new Error('No backend available and no API key configured');
  }

  async chat(message: string, lastTestResult: any, userProfile: any, language: 'vi' | 'en'): Promise<string> {
    try {
      // Try backend first
      const data = await apiPost<{ success: boolean; message: string }>(
        '/api/chat',
        { message, lastTestResult, userProfile, language }
      );
      if (!data.success) throw new Error('Chat failed');
      return data.message;
    } catch (error) {
      console.warn('Backend chat failed, using direct AI');
      // If backend fails and we have API key, use direct AI
      if (GEMINI_API_KEY) {
        return await this.chatWithDirectAI(message, language);
      }
      throw new Error('Chat service unavailable: No backend and no API key');
    }
  }

  private async chatWithDirectAI(message: string, language: 'vi' | 'en'): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = language === 'vi'
      ? 'Bạn là Bác sĩ Eva - trợ lý y tế chuyên khoa nhãn khoa. Hãy trả lời ngắn gọn (30-40 từ) nhưng đầy đủ thông tin. Sử dụng tiếng Việt.'
      : 'You are Dr. Eva - an ophthalmology medical assistant. Answer concisely (30-40 words) but informatively. Use English.';

    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nUser message: ${message}`
            }
          ]
        }
      ]
    });

    const text = response.response.text();
    return text || 'Xin lỗi, tôi không thể trả lời lúc này.';
  }

  async report(testType: string, testData: any, history: any[], language: 'vi' | 'en') {
    try {
      return await apiPost('/api/report', { testType, testData, history, language });
    } catch (error) {
      console.warn('Backend report failed');
      throw error;
    }
  }

  async routine(userProfile: any, testResults: any[], language: 'vi' | 'en') {
    try {
      return await apiPost('/api/routine', { userProfile, testResults, language });
    } catch (error) {
      console.warn('Backend routine failed');
      throw error;
    }
  }

  async tip(userProfile: any, language: 'vi' | 'en') {
    try {
      return await apiPost('/api/proactive-tip', { userProfile, language });
    } catch (error) {
      console.warn('Backend tip failed');
      throw error;
    }
  }

  async dashboard(testHistory: any[], language: 'vi' | 'en') {
    try {
      return await apiPost('/api/dashboard', { testHistory, language });
    } catch (error) {
      console.warn('Backend dashboard failed');
      throw error;
    }
  }
}

