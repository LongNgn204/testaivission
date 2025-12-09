/**
 * =================================================================
 * 🤖 AIService - Direct OpenRouter API Calls from Frontend
 * =================================================================
 *
 * Tất cả AI calls giờ đi trực tiếp qua OpenRouter API
 * Không còn phụ thuộc backend
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
import {
   openRouterChat,
   openRouterReport,
   openRouterDashboard,
   openRouterRoutine,
   openRouterProactiveTip,
   hasOpenRouterKey,
} from './openRouterService';

export class AIService {
   private audioCache: Map<string, { audioContent: string; timestamp: number; hits: number }>;

   constructor() {
      this.audioCache = new Map();
   }

   /**
    * Check if OpenRouter API is available
    */
   isAvailable(): boolean {
      return hasOpenRouterKey();
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
      console.log(`📋 Generating ${testType} report via OpenRouter...`);

      try {
         const report = await openRouterReport(testType, testData, history.slice(0, 10), language);

         const elapsed = Date.now() - startTime;
         console.log(`✅ Report generated in ${elapsed}ms`);

         return {
            ...report,
            totalResponseTime: elapsed,
         };
      } catch (error: any) {
         console.error('❌ Report generation failed:', error.message);
         throw new Error(`Không thể tạo báo cáo AI. ${error.message}`);
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
      console.log(`📊 Generating dashboard insights via OpenRouter...`);

      try {
         const insights = await openRouterDashboard(history.slice(0, 20), language);

         const elapsed = Date.now() - startTime;
         console.log(`✅ Dashboard insights generated in ${elapsed}ms`);

         return insights;
      } catch (error: any) {
         console.error('❌ Dashboard insights failed:', error.message);
         throw new Error('Failed to generate dashboard insights');
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
      console.log(`📅 Generating personalized routine via OpenRouter...`);

      try {
         const routine = await openRouterRoutine(answers, language);

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
      console.log(`💬 Sending chat message via OpenRouter...`);

      try {
         const response = await openRouterChat(userMessage, lastTestResult, userProfile, language);

         const elapsed = Date.now() - startTime;
         console.log(`✅ Chat response received in ${elapsed}ms`);

         return response || (language === 'vi'
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
         return await openRouterProactiveTip(lastTest, userProfile, language);
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
