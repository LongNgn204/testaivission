/**
 * ============================================================
 * 💬 ChatbotService - Giao tiếp với Backend (Express/Worker)
 * ============================================================
 * 
 * Cung cấp các hàm gọi API backend: chat, report, routine, tips, dashboard
 */

import { getAuthToken } from './authService';

const API_BASE_URL = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:3001';

function authHeaders() {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
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
  async chat(message: string, lastTestResult: any, userProfile: any, language: 'vi' | 'en'): Promise<string> {
    const data = await apiPost<{ success: boolean; message: string }>(
      '/api/chat',
      { message, lastTestResult, userProfile, language }
    );
    if (!data.success) throw new Error('Chat failed');
    return data.message;
  }

  async report(testType: string, testData: any, history: any[], language: 'vi' | 'en') {
    return apiPost('/api/report', { testType, testData, history, language });
  }

  async routine(userProfile: any, testResults: any[], language: 'vi' | 'en') {
    return apiPost('/api/routine', { userProfile, testResults, language });
  }

  async tip(userProfile: any, language: 'vi' | 'en') {
    return apiPost('/api/proactive-tip', { userProfile, language });
  }

  async dashboard(testHistory: any[], language: 'vi' | 'en') {
    return apiPost('/api/dashboard', { testHistory, language });
  }
}

