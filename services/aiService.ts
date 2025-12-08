/**
 * =================================================================
 * 🤖 AIService - Backend-First AI Service for Vision Coach
 * =================================================================
 *
 * All AI calls are routed through the Cloudflare Worker backend to:
 * - Keep API keys secure (never exposed in browser)
 * - Enable caching and rate limiting
 * - Provide consistent error handling
 * 
 * ENDPOINTS USED:
 * - POST /api/report - Generate AI analysis report
 * - POST /api/dashboard - Generate dashboard insights
 * - POST /api/chat - Chat with Dr. Eva
 * - POST /api/routine - Generate personalized routine
 * - POST /api/proactive-tip - Generate proactive health tips
 * - POST /api/tts/generate - Generate TTS audio
 */

import { AIReport, StoredTestResult, TestType, WeeklyRoutine, DashboardInsights, AnswerState } from '../types';

// ⚡ API Configuration
const API_CONFIG = {
   baseUrl: import.meta.env.VITE_API_URL || 'https://vision-coach-worker.stu72511407.workers.dev',
   timeout: 30000, // 30 seconds
   retryAttempts: 2,
   retryDelay: 1000,
};

// 💾 TTS Cache Configuration
const TTS_CONFIG = {
   cacheDuration: 60 * 60 * 1000, // 60 minutes
   maxCacheSize: 500,
};

// 🔐 Auth Helper
const getAuthToken = (): string | null => {
   try {
      return localStorage.getItem('auth_token');
   } catch {
      return null;
   }
};

// 🌐 API Request Helper with retry logic
async function apiRequest<T>(
   endpoint: string,
   data: any,
   options: { requireAuth?: boolean; timeout?: number } = {}
): Promise<T> {
   const { requireAuth = true, timeout = API_CONFIG.timeout } = options;
   const url = `${API_CONFIG.baseUrl}${endpoint}`;

   const headers: HeadersInit = {
      'Content-Type': 'application/json',
   };

   if (requireAuth) {
      const token = getAuthToken();
      if (!token) {
         throw new Error('Authentication required. Please login.');
      }
      headers['Authorization'] = `Bearer ${token}`;
   }

   let lastError: Error | null = null;

   for (let attempt = 0; attempt <= API_CONFIG.retryAttempts; attempt++) {
      try {
         const controller = new AbortController();
         const timeoutId = setTimeout(() => controller.abort(), timeout);

         const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
            signal: controller.signal,
         });

         clearTimeout(timeoutId);

         if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = (errorData as any).message || (errorData as any).error || `HTTP ${response.status}`;
            throw new Error(errorMessage);
         }

         return await response.json() as T;
      } catch (error: any) {
         lastError = error;

         // Don't retry on auth errors or abort
         if (error.name === 'AbortError' || error.message.includes('Authentication')) {
            throw error;
         }

         // Wait before retry
         if (attempt < API_CONFIG.retryAttempts) {
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * (attempt + 1)));
            console.log(`⚡ Retrying API call (attempt ${attempt + 2})...`);
         }
      }
   }

   throw lastError || new Error('API request failed after retries');
}

export class AIService {
   private audioCache: Map<string, { audioContent: string; timestamp: number; hits: number }>;

   constructor() {
      this.audioCache = new Map();
   }

   /**
    * 📋 Generate AI Report for test results
    * Routes to: POST /api/report
    */
   async generateReport(
      testType: TestType,
      testData: any,
      history: StoredTestResult[],
      language: 'vi' | 'en'
   ): Promise<AIReport> {
      const startTime = Date.now();
      console.log(`📋 Generating ${testType} report via backend...`);

      try {
         const response = await apiRequest<any>('/api/report', {
            testType,
            testData,
            history: history.slice(0, 10), // Send last 10 for trend analysis
            language,
         });

         const elapsed = Date.now() - startTime;
         console.log(`✅ Report generated in ${elapsed}ms (cached: ${response.fromCache || false})`);

         return {
            id: response.id || `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            testType,
            timestamp: response.timestamp || new Date().toISOString(),
            totalResponseTime: elapsed,
            confidence: parseFloat((response.confidence * 100).toFixed(2)) || 85,
            summary: response.summary || '',
            causes: response.causes || '',
            recommendations: response.recommendations || [],
            severity: response.severity || 'LOW',
            prediction: response.prediction || '',
            trend: response.trend || '',
         };
      } catch (error: any) {
         console.error('❌ Report generation failed:', error.message);
         throw new Error(`Không thể tạo báo cáo AI. ${error.message}`);
      }
   }

   /**
    * 📊 Generate Dashboard Insights from test history
    * Routes to: POST /api/dashboard
    */
   async generateDashboardInsights(
      history: StoredTestResult[],
      language: 'vi' | 'en'
   ): Promise<DashboardInsights> {
      const startTime = Date.now();
      console.log(`📊 Generating dashboard insights via backend...`);

      try {
         const response = await apiRequest<DashboardInsights>('/api/dashboard', {
            history: history.slice(0, 20), // Send last 20 for analysis
            language,
         });

         const elapsed = Date.now() - startTime;
         console.log(`✅ Dashboard insights generated in ${elapsed}ms`);

         return response;
      } catch (error: any) {
         console.error('❌ Dashboard insights failed:', error.message);
         throw new Error('Failed to generate dashboard insights');
      }
   }

   /**
    * 📅 Generate Personalized Weekly Routine
    * Routes to: POST /api/routine
    */
   async generatePersonalizedRoutine(
      answers: { worksWithComputer: string; wearsGlasses: string; goal: string },
      language: 'vi' | 'en'
   ): Promise<WeeklyRoutine> {
      const startTime = Date.now();
      console.log(`📅 Generating personalized routine via backend...`);

      try {
         const response = await apiRequest<WeeklyRoutine>('/api/routine', {
            answers,
            language,
         });

         const elapsed = Date.now() - startTime;
         console.log(`✅ Routine generated in ${elapsed}ms`);

         return response;
      } catch (error: any) {
         console.error('❌ Routine generation failed:', error.message);
         // Return default routine on error
         return this.getDefaultRoutine(language);
      }
   }

   /**
    * 💬 Chat with Dr. Eva
    * Routes to: POST /api/chat
    */
   async chat(
      userMessage: string,
      lastTestResult: StoredTestResult | null,
      userProfile: AnswerState | null,
      language: 'vi' | 'en'
   ): Promise<string> {
      const startTime = Date.now();
      console.log(`💬 Sending chat message to backend...`);

      try {
         const response = await apiRequest<{ message: string }>('/api/chat', {
            message: userMessage,
            lastTestResult: lastTestResult ? {
               testType: lastTestResult.testType,
               date: lastTestResult.date,
               severity: lastTestResult.report?.severity,
               resultData: lastTestResult.resultData,
            } : null,
            userProfile,
            language,
         });

         const elapsed = Date.now() - startTime;
         console.log(`✅ Chat response received in ${elapsed}ms`);

         return response.message || (language === 'vi'
            ? 'Xin lỗi, tôi không thể trả lời câu hỏi này.'
            : 'Sorry, I cannot answer this question.');
      } catch (error: any) {
         console.error('❌ Chat failed:', error.message);
         return language === 'vi'
            ? 'Xin lỗi, có lỗi kết nối. Vui lòng thử lại sau.'
            : 'Sorry, there was a connection error. Please try again.';
      }
   }

   /**
    * 💡 Generate Proactive Health Tip
    * Routes to: POST /api/proactive-tip
    */
   async generateProactiveTip(
      lastTest: StoredTestResult | null,
      userProfile: AnswerState | null,
      language: 'vi' | 'en'
   ): Promise<string | null> {
      try {
         const response = await apiRequest<{ tip: string }>('/api/proactive-tip', {
            lastTest: lastTest ? {
               testType: lastTest.testType,
               severity: lastTest.report?.severity,
            } : null,
            userProfile,
            language,
         });

         return response.tip || null;
      } catch (error: any) {
         console.error('❌ Proactive tip failed:', error.message);
         return null;
      }
   }

   /**
    * 🎙️ Generate TTS using backend (Google Cloud TTS)
    * Routes to: POST /api/tts/generate
    */
   async generateSpeech(text: string, language: 'vi' | 'en'): Promise<string | null> {
      try {
         const startTime = Date.now();
         const cacheKey = `${language}:${text}`;

         // Check cache
         const cached = this.audioCache.get(cacheKey);
         if (cached && Date.now() - cached.timestamp < TTS_CONFIG.cacheDuration) {
            cached.hits++;
            console.log(`⚡ TTS Cache HIT (${cached.hits}x) - 0ms`);
            await this.playAudioFromBase64(cached.audioContent);
            return cacheKey;
         }

         const response = await apiRequest<{ audioContent: string }>('/api/tts/generate', {
            text: text.trim(),
            language,
         });

         if (!response.audioContent) {
            console.error('No audio content received');
            return null;
         }

         // Cache the audio
         this.audioCache.set(cacheKey, {
            audioContent: response.audioContent,
            timestamp: Date.now(),
            hits: 0,
         });

         // LRU eviction
         if (this.audioCache.size > TTS_CONFIG.maxCacheSize) {
            let leastUsedKey = '';
            let leastHits = Infinity;
            this.audioCache.forEach((value, key) => {
               if (value.hits < leastHits) {
                  leastHits = value.hits;
                  leastUsedKey = key;
               }
            });
            if (leastUsedKey) {
               this.audioCache.delete(leastUsedKey);
            }
         }

         // Play audio
         await this.playAudioFromBase64(response.audioContent);

         const elapsed = Date.now() - startTime;
         console.log(`⚡ TTS Generated in ${elapsed}ms`);

         return cacheKey;
      } catch (error: any) {
         console.error('❌ TTS failed:', error.message);
         return null;
      }
   }

   /**
    * 🔊 Play base64 audio
    */
   private async playAudioFromBase64(base64Audio: string): Promise<void> {
      try {
         const binaryString = atob(base64Audio);
         const bytes = new Uint8Array(binaryString.length);
         for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
         }

         const blob = new Blob([bytes], { type: 'audio/mp3' });
         const audioUrl = URL.createObjectURL(blob);
         const audio = new Audio(audioUrl);

         await new Promise<void>((resolve, reject) => {
            audio.onended = () => {
               URL.revokeObjectURL(audioUrl);
               resolve();
            };
            audio.onerror = reject;
            audio.play().catch(reject);
         });
      } catch (error) {
         console.error('Failed to play audio:', error);
      }
   }

   /**
    * 📅 Default routine fallback
    */
   private getDefaultRoutine(language: 'vi' | 'en'): WeeklyRoutine {
      const isVi = language === 'vi';
      return {
         Monday: [
            { type: 'test', key: 'snellen', name: isVi ? 'Kiểm tra thị lực Snellen' : 'Snellen Test', duration: 3 },
            { type: 'exercise', key: 'exercise_20_20_20', name: isVi ? 'Bài tập 20-20-20' : '20-20-20 Exercise', duration: 2 }
         ],
         Tuesday: [
            { type: 'exercise', key: 'exercise_palming', name: isVi ? 'Bài tập thư giãn mắt' : 'Eye Relaxation', duration: 3 }
         ],
         Wednesday: [
            { type: 'test', key: 'colorblind', name: isVi ? 'Kiểm tra mù màu' : 'Color Blind Test', duration: 3 },
            { type: 'exercise', key: 'exercise_focus_change', name: isVi ? 'Bài tập thay đổi tiêu điểm' : 'Focus Change', duration: 3 }
         ],
         Thursday: [
            { type: 'exercise', key: 'exercise_20_20_20', name: isVi ? 'Bài tập 20-20-20' : '20-20-20 Exercise', duration: 2 }
         ],
         Friday: [
            { type: 'test', key: 'amsler', name: isVi ? 'Kiểm tra lưới Amsler' : 'Amsler Grid Test', duration: 2 },
            { type: 'exercise', key: 'exercise_palming', name: isVi ? 'Bài tập thư giãn' : 'Palming Exercise', duration: 3 }
         ],
         Saturday: [],
         Sunday: [],
      };
   }

   /**
    * 📊 Verify all reports (local validation)
    */
   async verifyAllReports(
      history: StoredTestResult[],
      _language: 'vi' | 'en'
   ): Promise<{ verified: number; errors: string[] }> {
      const errors: string[] = [];
      let verified = 0;

      for (const result of history) {
         try {
            const report = result.report;

            if (!report.summary || report.summary.length < 50) {
               errors.push(`${result.testType} (${result.date}): Summary too short`);
               continue;
            }

            if (!report.recommendations || report.recommendations.length === 0) {
               errors.push(`${result.testType} (${result.date}): No recommendations`);
               continue;
            }

            if (!['LOW', 'MEDIUM', 'HIGH'].includes(report.severity)) {
               errors.push(`${result.testType} (${result.date}): Invalid severity`);
               continue;
            }

            verified++;
         } catch (e) {
            errors.push(`${result.testType} (${result.date}): ${String(e)}`);
         }
      }

      console.log(`✅ Verified ${verified}/${history.length} reports`);
      return { verified, errors };
   }

   /**
    * 🔄 Backward compatibility: generateChatResponse
    */
   async generateChatResponse(userMessage: string, language: 'vi' | 'en'): Promise<string> {
      return this.chat(userMessage, null, null, language);
   }
}
