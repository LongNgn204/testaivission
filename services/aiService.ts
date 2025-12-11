/**
 * =================================================================
 * 🤖 AIService - Calls Worker API (Cloudflare AI - FREE)
 * =================================================================
 *
 * Tất cả AI calls đi qua Worker API, sử dụng Cloudflare Workers AI
 * MIỄN PHÍ 100% - Không cần API key
 * 
 * FUNCTIONS:
 * - generateReport: Tạo báo cáo AI cho test results
 * - generateDashboardInsights: Phân tích dashboard
 * - generatePersonalizedRoutine: Tạo lịch tập cá nhân
 * - chat: Chat với Dr. Eva
 * - generateProactiveTip: Mẹo sức khỏe
 * - generateSpeech: TTS (dùng browser SpeechSynthesis)
 */

import { AIReport, StoredTestResult, TestType, WeeklyRoutine, DashboardInsights, AnswerState } from '../types';
import { getAuthToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vision-coach-worker.stu725114073.workers.dev';

// Generic fetch with retry, timeout, and 5xx backoff (copy from authService)
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
            const delay = Math.pow(2, attempt) * 500; // 0.5s, 1s
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

// Helper for API calls
async function callWorkerAPI(endpoint: string, body: any): Promise<any> {
   const token = getAuthToken();

   const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      // Timeout per call
      timeoutMs: 15000,
   });

   if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as any)?.message || `API error: ${response.status}`);
   }

   return response.json();
}

export class AIService {
   private audioCache: Map<string, { audioContent: string; timestamp: number; hits: number }>;

   constructor() {
      this.audioCache = new Map();
   }

   /**
    * Check if AI is available (always true with Worker API)
    */
   isAvailable(): boolean {
      return true; // AI always available via free Worker API
   }

   /**
    * 📋 Generate AI Report for test results
    */
   async generateReport(
      testType: TestType,
      testData: any,
      history: StoredTestResult[],
      language: 'vi' | 'en'
   ): Promise<AIReport> {
      const startTime = Date.now();
      console.log(`📋 Generating ${testType} report via Worker API...`);

      try {
         const report = await callWorkerAPI('/api/report', {
            testType,
            testData,
            history: history.slice(0, 10),
            language,
         });

         const elapsed = Date.now() - startTime;
         console.log(`✅ Report generated in ${elapsed}ms`);

         return {
            ...report,
            totalResponseTime: elapsed,
         };
      } catch (error: any) {
         console.error('❌ Report generation failed:', error.message);
         // Return fallback report
         return {
            id: `report_${Date.now()}`,
            testType,
            timestamp: new Date().toISOString(),
            totalResponseTime: Date.now() - startTime,
            confidence: 70,
            summary: language === 'vi'
               ? 'Không thể tạo báo cáo AI lúc này. Vui lòng thử lại sau.'
               : 'Unable to generate AI report at this time. Please try again later.',
            causes: '',
            recommendations: language === 'vi'
               ? ['Thử làm lại bài test', 'Kiểm tra kết nối mạng', 'Liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục']
               : ['Try the test again', 'Check your network connection', 'Contact support if the issue persists'],
            severity: 'LOW',
            prediction: '',
            trend: '',
         };
      }
   }

   /**
    * 📊 Generate Dashboard Insights from test history
    */
   async generateDashboardInsights(
      history: StoredTestResult[],
      language: 'vi' | 'en'
   ): Promise<DashboardInsights> {
      const startTime = Date.now();
      console.log(`📊 Generating dashboard insights via Worker API...`);

      try {
         const insights = await callWorkerAPI('/api/dashboard', {
            history: history.slice(0, 20),
            language,
         });

         const elapsed = Date.now() - startTime;
         console.log(`✅ Dashboard insights generated in ${elapsed}ms`);

         return insights;
      } catch (error: any) {
         console.error('❌ Dashboard insights failed:', error.message);
         return {
            score: 70,
            rating: 'AVERAGE',
            trend: 'INSUFFICIENT_DATA',
            overallSummary: language === 'vi'
               ? 'Chưa đủ dữ liệu để phân tích chi tiết'
               : 'Not enough data for detailed analysis',
            positives: [],
            areasToMonitor: [],
            proTip: language === 'vi'
               ? 'Hãy làm thêm bài test để có đánh giá chính xác hơn'
               : 'Complete more tests for accurate assessment',
         };
      }
   }

   /**
    * 📅 Generate Personalized Weekly Routine
    */
   async generatePersonalizedRoutine(
      answers: { worksWithComputer: string; wearsGlasses: string; goal: string },
      language: 'vi' | 'en'
   ): Promise<WeeklyRoutine> {
      const startTime = Date.now();
      console.log(`📅 Generating personalized routine via Worker API...`);

      try {
         const routine = await callWorkerAPI('/api/routine', {
            answers,
            language,
         });

         const elapsed = Date.now() - startTime;
         console.log(`✅ Routine generated in ${elapsed}ms`);

         return routine;
      } catch (error: any) {
         console.error('❌ Routine generation failed:', error.message);
         return this.getDefaultRoutine(language);
      }
   }

   /**
    * 💬 Chat with Dr. Eva
    */
   async chat(
      userMessage: string,
      lastTestResult: StoredTestResult | null,
      userProfile: AnswerState | null,
      language: 'vi' | 'en'
   ): Promise<string> {
      const startTime = Date.now();
      console.log(`💬 Sending chat message via Worker API...`);

      try {
         const data = await callWorkerAPI('/api/chat', {
            message: userMessage,
            lastTestResult,
            userProfile,
            language,
         });

         const elapsed = Date.now() - startTime;
         console.log(`✅ Chat response received in ${elapsed}ms`);

         return data.message || (language === 'vi'
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
    */
   async generateProactiveTip(
      lastTest: StoredTestResult | null,
      userProfile: AnswerState | null,
      language: 'vi' | 'en'
   ): Promise<string | null> {
      try {
         const data = await callWorkerAPI('/api/proactive-tip', {
            lastTest,
            userProfile,
            language,
         });
         return data.tip || null;
      } catch (error: any) {
         console.error('❌ Proactive tip failed:', error.message);
         return null;
      }
   }

   /**
    * 🎙️ Generate TTS using browser's SpeechSynthesis API (no API needed)
    */
   async generateSpeech(text: string, language: 'vi' | 'en'): Promise<string | null> {
      return new Promise((resolve) => {
         try {
            if (!('speechSynthesis' in window)) {
               console.warn('⚠️ Browser does not support SpeechSynthesis');
               resolve(null);
               return;
            }

            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language === 'vi' ? 'vi-VN' : 'en-US';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            const voices = window.speechSynthesis.getVoices();
            const targetVoice = voices.find(v =>
               v.lang.startsWith(language === 'vi' ? 'vi' : 'en')
            );
            if (targetVoice) {
               utterance.voice = targetVoice;
            }

            utterance.onend = () => {
               console.log(`✅ Browser TTS completed`);
               resolve(`tts:${Date.now()}`);
            };

            utterance.onerror = (event) => {
               console.error('❌ Browser TTS error:', event.error);
               resolve(null);
            };

            window.speechSynthesis.speak(utterance);
            console.log(`🎙️ Browser TTS started (${language})`);

         } catch (error: any) {
            console.error('❌ TTS failed:', error.message);
            resolve(null);
         }
      });
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
      language: 'vi' | 'en'
   ): Promise<{ verified: number; errors: string[] }> {
      const errors: string[] = [];
      let verified = 0;

      const isVietnameseText = (text: string) => /[ăâêôơưđáàạảãắằặẳẵấầậẩẫéèẹẻẽếềệểễóòọỏõốồộổỗớờợởỡúùụủũứừựửữíìịỉĩýỳỵỷỹ]/i.test(text);
      const forbiddenVi = [/báo cáo ai (tạm thời )?không khả dụng/i, /không thể tạo báo cáo ai/i];
      const forbiddenEn = [/AI report is temporarily unavailable/i, /Unable to generate AI report/i];

      const severityRank = (s: any) => ({ LOW: 0, MEDIUM: 1, HIGH: 2 } as const)[s as 'LOW'|'MEDIUM'|'HIGH'] ?? -1;

      const expectMinSeverityFromSnellen = (score: string): 'LOW'|'MEDIUM'|'HIGH' => {
         switch (score) {
            case '20/20': return 'LOW';
            case '20/30': return 'LOW';
            case '20/40': return 'LOW';
            case '20/60': return 'MEDIUM';
            case '20/100': return 'HIGH';
            case 'Dưới 20/100': return 'HIGH';
            default: return 'LOW';
         }
      };

      for (const item of history) {
         try {
            const report = item.report;
            if (!report) {
               errors.push(`${item.testType} (${item.date}): Missing report`);
               continue;
            }

            // Basic field checks (flexible but with sensible floors)
            if (!report.summary || report.summary.trim().length < 120) {
               errors.push(`${item.testType} (${item.date}): ${language === 'vi' ? 'Tóm tắt quá ngắn (<120 ký tự)' : 'Summary too short (<120 chars)'}`);
               continue;
            }

            if (!Array.isArray(report.recommendations) || report.recommendations.length < 3) {
               errors.push(`${item.testType} (${item.date}): ${language === 'vi' ? 'Thiếu khuyến nghị (>=3)' : 'Insufficient recommendations (>=3)'}`);
               continue;
            }

            if (!['LOW','MEDIUM','HIGH'].includes(report.severity)) {
               errors.push(`${item.testType} (${item.date}): ${language === 'vi' ? 'Mức độ nghiêm trọng không hợp lệ' : 'Invalid severity'}`);
               continue;
            }

            if (typeof report.confidence !== 'number' || isNaN(report.confidence) || report.confidence < 50 || report.confidence > 100) {
               errors.push(`${item.testType} (${item.date}): ${language === 'vi' ? 'Độ tin cậy không hợp lệ' : 'Invalid confidence'}`);
               continue;
            }

            // Language sanity check
            if (language === 'vi' && !isVietnameseText(report.summary)) {
               errors.push(`${item.testType} (${item.date}): ${language === 'vi' ? 'Ngôn ngữ có vẻ không phải tiếng Việt' : 'Language mismatch'}`);
               continue;
            }
            if (language === 'en' && isVietnameseText(report.summary)) {
               errors.push(`${item.testType} (${item.date}): ${language === 'vi' ? 'Báo cáo tiếng Anh nhưng có dấu tiếng Việt' : 'English report contains Vietnamese diacritics'}`);
               continue;
            }

            // Forbidden phrases (avoid rigid/fallback messages)
            const fbs = language === 'vi' ? forbiddenVi : forbiddenEn;
            if (fbs.some((rx) => rx.test(report.summary))) {
               errors.push(`${item.testType} (${item.date}): ${language === 'vi' ? 'Chứa câu xin lỗi/fallback AI' : 'Contains fallback/apology text'}`);
               continue;
            }

            // Consistency checks by test type
            switch (item.testType) {
               case 'amsler': {
                  const rd = item.resultData as any;
                  if (rd && typeof rd.issueDetected === 'boolean') {
                     if (rd.issueDetected && report.severity === 'LOW') {
                        errors.push(`amsler (${item.date}): ${language === 'vi' ? 'Amsler bất thường nhưng báo cáo đánh giá LOW' : 'Amsler abnormal yet severity LOW'}`);
                        continue;
                     }
                     if (!rd.issueDetected && report.severity === 'HIGH') {
                        errors.push(`amsler (${item.date}): ${language === 'vi' ? 'Amsler bình thường nhưng báo cáo đánh giá HIGH' : 'Amsler normal yet severity HIGH'}`);
                        continue;
                     }
                  }
                  break;
               }
               case 'snellen': {
                  const rd = item.resultData as any;
                  if (rd && rd.score) {
                     const expected = expectMinSeverityFromSnellen(rd.score);
                     if (severityRank(report.severity) < severityRank(expected)) {
                        errors.push(`snellen (${item.date}): ${language === 'vi' ? `Mức độ nên ≥ ${expected} theo điểm ${rd.score}` : `Severity should be ≥ ${expected} for score ${rd.score}`}`);
                        continue;
                     }
                  }
                  break;
               }
               case 'colorblind': {
                  const rd = item.resultData as any;
                  if (rd && typeof rd.accuracy === 'number') {
                     if (rd.accuracy <= 50 && report.severity === 'LOW') {
                        errors.push(`colorblind (${item.date}): ${language === 'vi' ? 'Độ chính xác thấp nhưng severity = LOW' : 'Low accuracy but severity = LOW'}`);
                        continue;
                     }
                     if (rd.accuracy >= 90 && report.severity === 'HIGH') {
                        errors.push(`colorblind (${item.date}): ${language === 'vi' ? 'Độ chính xác cao nhưng severity = HIGH' : 'High accuracy but severity = HIGH'}`);
                        continue;
                     }
                  }
                  break;
               }
               case 'duochrome': {
                  const rd = item.resultData as any;
                  if (rd && rd.overallResult) {
                     if (rd.overallResult === 'normal' && report.severity !== 'LOW') {
                        errors.push(`duochrome (${item.date}): ${language === 'vi' ? 'Kết quả bình thường nhưng severity ≠ LOW' : 'Normal result but severity ≠ LOW'}`);
                        continue;
                     }
                     if (rd.overallResult !== 'normal' && report.severity === 'LOW') {
                        errors.push(`duochrome (${item.date}): ${language === 'vi' ? 'Kết quả bất thường nhưng severity = LOW' : 'Abnormal result but severity = LOW'}`);
                        continue;
                     }
                  }
                  break;
               }
               case 'astigmatism': {
                  const rd = item.resultData as any;
                  if (rd && rd.overallSeverity) {
                     if (rd.overallSeverity === 'NONE' && report.severity !== 'LOW') {
                        errors.push(`astigmatism (${item.date}): ${language === 'vi' ? 'Kết quả không loạn thị nhưng severity ≠ LOW' : 'No astigmatism but severity ≠ LOW'}`);
                        continue;
                     }
                  }
                  break;
               }
            }

            verified++;
         } catch (e) {
            errors.push(`${item.testType} (${item.date}): ${String(e)}`);
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
