/**
 * =================================================================
 * 🤖 AIService - Tầng giao tiếp với Google Gemini (báo cáo, dashboard, coach, TTS)
 * =================================================================
 *
 * CHỨC NĂNG CHÍNH:
 * - generateReport: Phân tích kết quả từng bài test → AIReport (JSON an toàn)
 * - generateDashboardInsights: Tóm tắt xu hướng sức khỏe mắt → DashboardInsights (JSON)
 * - generateProactiveTip: Gợi ý ngắn dạng voice khi idle
 * - generatePersonalizedRoutine: Lập lịch trình tuần dựa vào AnswerState
 * - chat: Trả lời hội thoại ngắn của Vision Coach (text)
 * - generateSpeech: Phát âm văn bản (Web Speech API) + cache utterance
 *
 * CÁCH DÙNG:
 *   const ai = new AIService();
 *   const report = await ai.generateReport('snellen', data, history, 'vi');
 *   const insights = await ai.generateDashboardInsights(history, 'vi');
 *   const tip = await ai.generateProactiveTip(last, profile, 'vi');
 *   const cacheKey = await ai.generateSpeech('Xin chào', 'vi');
 *
 * CHÚ Ý ENV:
 * - Ưu tiên: import.meta.env.VITE_GEMINI_API_KEY (Vite)
 * - Fallback: API_KEY (Node/CI)
 */
import { GoogleGenAI, Type } from "@google/genai";
import { AIReport, StoredTestResult, TestType, WeeklyRoutine, DashboardInsights, AnswerState } from '../types';

// ⚡ CRITICAL: Get API Key from environment
const API_KEY: string | undefined = (() => {
    // Try Vite environment first
    if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GEMINI_API_KEY) {
        return (import.meta as any).env.VITE_GEMINI_API_KEY;
    }
    // Try process.env
    if (typeof process !== 'undefined' && (process as any)?.env?.VITE_GEMINI_API_KEY) {
        return (process as any).env.VITE_GEMINI_API_KEY;
    }
    // Try window global
    if (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__) {
        return (window as any).__GEMINI_API_KEY__;
    }
    console.warn('⚠️ VITE_GEMINI_API_KEY not found in environment');
    return undefined;
})();

// ⚡ ULTRA-FAST AI CONFIGURATION - OPTIMIZED FOR SPEED & INTELLIGENCE
const AI_CONFIG = {
   gemini: {
      model: 'gemini-2.5-flash', // 🚀 UPGRADED: Gemini 2.5 Flash (Latest High-Performance Model)
      temperature: 0.3, // 🧠 BALANCED: Slightly higher for more natural creativity
      maxTokens: 4000, // 📝 EXTENDED: For deeper, more comprehensive analysis
      topP: 0.8, // 🎯 FOCUSED: High relevance
      topK: 40 // 🧠 DIVERSE: Better vocabulary selection
   },
   tts: {
      cacheDuration: 60 * 60 * 1000, // ⚡ ULTRA-LONG CACHE: 60 minutes for instant responses
      maxCacheSize: 500, // ⚡ MASSIVE CACHE: Store even more for instant hits
      voice: {
         vi: 'vi-VN', // Vietnamese voice
         en: 'en-US'  // English voice
      },
      rate: 1.0, // Speaking rate
      pitch: 1.0, // Voice pitch
      volume: 1.0 // Voice volume
   },
   streaming: {
      enabled: true, // 🌊 STREAMING: Real-time response chunks
      bufferSize: 128 // ⚡ ULTRA-FAST: Tiny buffer for instant streaming
   }
};

// Persona mô tả bác sĩ Eva để nhắc AI giữ giọng điệu tự nhiên như bác sĩ 10 năm kinh nghiệm
const DOCTOR_PERSONA = `
Bạn là bác sĩ chuyên khoa MẮT (ophthalmologist) tên Eva, có hơn 10 năm kinh nghiệm lâm sàng tại bệnh viện tuyến trung ương.
- Luôn giải thích rõ ràng, đồng cảm, ưu tiên sức khỏe bệnh nhân.
- Luôn nhắc bệnh nhân đi khám trực tiếp nếu phát hiện dấu hiệu nguy hiểm.
- So sánh kết quả hiện tại với lịch sử, nhắc tới số liệu cụ thể.
- Không dùng lời đao to búa lớn, nói tự nhiên, tiếng Việt đời thường (hoặc tiếng Anh tự nhiên nếu được yêu cầu).
`;

// Tóm tắt lịch sử kiểm tra để đưa vào prompt, giúp AI hiểu bối cảnh nhanh
const buildHistoryDigest = (history: StoredTestResult[]) => {
   if (!history.length) {
      return 'Chưa có lịch sử bài test.';
   }

   return history
      .slice(0, 6)
      .map((item) => {
         const date = new Date(item.date).toLocaleDateString();
         const score = (item.resultData as any)?.score || (item.report as any)?.score || 'N/A';
         const severity = item.report?.severity || 'unknown';
         return `- ${item.testType.toUpperCase()} (${date}): score ${score}, severity ${severity}`;
      })
      .join('\n');
};

// 👨‍⚕️ BÁC SĨ CHUYÊN KHOA SCHEMA: Chi tiết, Sâu sắc & Tự nhiên
const createResponseSchema = (language: 'vi' | 'en') => {
   if (language === 'vi') {
      return {
         type: Type.OBJECT,
         properties: {
            confidence: {
               type: Type.NUMBER,
               description: `Độ tin cậy chẩn đoán (0.85-0.99). Dựa trên phân tích sâu các dữ liệu.`
            },
            summary: {
               type: Type.STRING,
               description: `250-300 từ TIẾNG VIỆT. PHÂN TÍCH LÂM SÀNG SÂU SẮC & TỰ NHIÊN:
                    - Sử dụng ngôn ngữ tự nhiên, đồng cảm, như bác sĩ đang nói chuyện trực tiếp.
                    - Tránh dùng từ ngữ máy móc, khô khan.
                    - Chẩn đoán chính xác với tư duy y khoa biện chứng.
                    - Giải thích cặn kẽ ý nghĩa của từng chỉ số một cách dễ hiểu.
                    - Kết nối các dữ liệu để đưa ra nhận định tổng thể.`
            },
            trend: {
               type: Type.STRING,
               description: `100-150 từ TIẾNG VIỆT. PHÂN TÍCH XU HƯỚNG & DỰ BÁO:
                    - Nhận diện các mẫu hình (patterns) tinh vi trong lịch sử.
                    - Dự báo rủi ro tiềm ẩn trước khi chúng xảy ra.
                    - Đánh giá tốc độ lão hóa hoặc phục hồi của mắt.`
            },
            causes: {
               type: Type.STRING,
               description: `80-100 từ TIẾNG VIỆT. PHÂN TÍCH NGUYÊN NHÂN:
                    - Liệt kê 4-5 nguyên nhân có khả năng cao nhất.
                    - Giải thích cơ chế gây bệnh (sinh lý bệnh) một cách đơn giản.
                    - Yếu tố nguy cơ (di truyền, lối sống, tuổi tác, môi trường).`
            },
            recommendations: {
               type: Type.ARRAY,
               items: { type: Type.STRING },
               description: `8-10 LỜI KHUYÊN CỤ THỂ TIẾNG VIỆT:
                    1. KHẨN CẤP (nếu cần): "⚠️ Cần đi khám ngay..."
                    2. ĐIỀU TRỊ TẠI NHÀ: Bài tập, thuốc nhỏ mắt (nếu cần), dinh dưỡng.
                    3. THAY ĐỔI LỐI SỐNG: Quy tắc 20-20-20, ánh sáng, tư thế.
                    4. THEO DÕI: Khi nào cần test lại.
                    Mỗi lời khuyên cần giải thích TẠI SAO và LÀM THẾ NÀO.`
            },
            severity: {
               type: Type.STRING,
               description: `LOW/MEDIUM/HIGH - Phân loại mức độ nghiêm trọng theo tiêu chuẩn y khoa`
            },
            prediction: {
               type: Type.STRING,
               description: `80-100 từ TIẾNG VIỆT. TIÊN LƯỢNG:
                    - Khả năng phục hồi.
                    - Thời gian dự kiến.
                    - Lời động viên tích cực.`
            },
         },
         required: ["confidence", "summary", "trend", "recommendations", "severity", "causes", "prediction"]
      };
   } else {
      return {
         type: Type.OBJECT,
         properties: {
            confidence: {
               type: Type.NUMBER,
               description: `Diagnostic confidence (0.85-0.99).`
            },
            summary: {
               type: Type.STRING,
               description: `250-300 words ENGLISH. DEEP & NATURAL CLINICAL ANALYSIS:
                    - Use natural, empathetic language. Avoid robotic phrasing.
                    - Precise diagnosis.
                    - Explain metrics thoroughly.`
            },
            trend: {
               type: Type.STRING,
               description: `100-150 words ENGLISH. TREND ANALYSIS.`
            },
            causes: {
               type: Type.STRING,
               description: `80-100 words ENGLISH. CAUSE ANALYSIS.`
            },
            recommendations: {
               type: Type.ARRAY,
               items: { type: Type.STRING },
               description: `8-10 DETAILED RECOMMENDATIONS.`
            },
            severity: {
               type: Type.STRING,
               description: `LOW/MEDIUM/HIGH`
            },
            prediction: {
               type: Type.STRING,
               description: `80-100 words ENGLISH. PROGNOSIS.`
            },
         },
         required: ["confidence", "summary", "trend", "recommendations", "severity", "causes", "prediction"]
      };
   }
};


export class AIService {
   private ai: any;

   constructor() {
      // Không bắt buộc API key khi chỉ dùng Web Speech (generateSpeech)
      // Chỉ khởi tạo Gemini client khi có key; nếu không, các hàm AI sẽ tự fallback/throw để caller xử lý
      if (API_KEY) {
         this.ai = new GoogleGenAI({ apiKey: API_KEY });
      } else {
         this.ai = null;
      }

      // 🎙️ Ensure voices are loaded (cho Web Speech API)
      if ('speechSynthesis' in window) {
         window.speechSynthesis.onvoiceschanged = () => {
            console.log('🎙️ TTS Voices loaded:', window.speechSynthesis.getVoices().length);
         };
         // Trigger voice loading
         window.speechSynthesis.getVoices();
      }
   }

   // 🗣️ Utterance cache để play lại
   private utteranceCache = new Map<string, { utterance: SpeechSynthesisUtterance, timestamp: number, hits: number }>();

   // 🎙️ Helper: Đợi voices load xong
   private async waitForVoices(): Promise<SpeechSynthesisVoice[]> {
      return new Promise((resolve) => {
         const voices = window.speechSynthesis.getVoices();
         if (voices.length > 0) {
            resolve(voices);
            return;
         }

         window.speechSynthesis.onvoiceschanged = () => {
            resolve(window.speechSynthesis.getVoices());
         };
      });
   }

   async generateSpeech(text: string, language: 'vi' | 'en'): Promise<string | null> {
      try {
         const startTime = Date.now();

         if (!('speechSynthesis' in window)) {
            console.error('Web Speech API not supported');
            return null;
         }

         // 💾 SMART CACHE: Check utterance cache
         const cacheKey = `${language}:${text}`;
         const cached = this.utteranceCache.get(cacheKey);

         if (cached && Date.now() - cached.timestamp < AI_CONFIG.tts.cacheDuration) {
            cached.hits++;
            console.log(`⚡ TTS Cache HIT (${cached.hits}x) - 0ms:`, text.substring(0, 40));

            // Play lại từ cache
            window.speechSynthesis.cancel(); // Stop any current speech
            window.speechSynthesis.speak(cached.utterance);
            return cacheKey; // Return cache key as identifier
         }

         // 🎯 WEB SPEECH API: Đợi và tìm giọng tốt nhất
         const voices = await this.waitForVoices();
         let selectedVoice: SpeechSynthesisVoice | null = null;

         if (language === 'vi') {
            // Ưu tiên: Google Tiếng Việt > Microsoft Tiếng Việt > bất kỳ giọng vi-VN nào
            selectedVoice = voices.find(v => v.lang === 'vi-VN' && v.name.includes('Google')) ||
               voices.find(v => v.lang === 'vi-VN' && v.name.includes('Microsoft')) ||
               voices.find(v => v.lang.startsWith('vi')) ||
               null;
         } else {
            // Tiếng Anh: Ưu tiên giọng nữ Google/Microsoft
            selectedVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google') && v.name.includes('Female')) ||
               voices.find(v => v.lang === 'en-US' && v.name.includes('Microsoft') && v.name.includes('Zira')) ||
               voices.find(v => v.lang === 'en-US') ||
               null;
         }

         const utterance = new SpeechSynthesisUtterance(text);
         utterance.lang = AI_CONFIG.tts.voice[language];
         if (selectedVoice) {
            utterance.voice = selectedVoice;
         }
         utterance.rate = AI_CONFIG.tts.rate;
         utterance.pitch = AI_CONFIG.tts.pitch;
         utterance.volume = AI_CONFIG.tts.volume;

         // 💾 Cache utterance để play lại
         this.utteranceCache.set(cacheKey, {
            utterance,
            timestamp: Date.now(),
            hits: 0
         });

         // 🧹 LRU EVICTION
         if (this.utteranceCache.size > AI_CONFIG.tts.maxCacheSize) {
            let leastUsedKey = '';
            let leastHits = Infinity;

            this.utteranceCache.forEach((value, key) => {
               if (value.hits < leastHits) {
                  leastHits = value.hits;
                  leastUsedKey = key;
               }
            });

            if (leastUsedKey) {
               this.utteranceCache.delete(leastUsedKey);
               console.log('🗑️ TTS Cache: Evicted least-used entry');
            }
         }

         const elapsed = Date.now() - startTime;
         console.log(`⚡ TTS Generated in ${elapsed}ms:`, text.substring(0, 40));

         // Play speech
         window.speechSynthesis.cancel(); // Stop any current speech
         window.speechSynthesis.speak(utterance);

         return cacheKey; // Return cache key as identifier
      } catch (error) {
         console.error(`Failed to generate speech for text "${text}":`, error);
         return null;
      }
   }

   async generateProactiveTip(lastTest: StoredTestResult | null, userProfile: AnswerState | null, language: 'vi' | 'en'): Promise<string | null> {
      const langInstruction = language === 'vi' ? 'VIETNAMESE' : 'ENGLISH';
      const prompt = `
        ${DOCTOR_PERSONA}

        Bạn đang đóng vai một bác sĩ đang chủ động nhắc bệnh nhân. Người dùng đang ở trạng thái idle. Hãy đưa ra 1 câu gợi ý ngắn gọn, tự nhiên, thân thiện.

        RULES:
        1.  **Be Conversational:** Start with a friendly opener like "Just a thought..." or "While you're here...".
        2.  **Be Concise:** The entire tip must be a single sentence, maximum 25 words.
        3.  **Be Contextual:** Use the provided user profile and last test result to make the tip relevant. If no context is available, give a general eye-care tip.
        4.  **Be Encouraging:** Maintain a positive and supportive tone.
        5.  **Language:** The response MUST be in ${langInstruction}.
        6.  **Format:** Respond ONLY with the text of the tip. Do not add any other text, labels, or formatting.

        CONTEXT:
        - User Profile: ${userProfile ? JSON.stringify(userProfile) : 'Not available.'}
        - Last Test Result: ${lastTest ? JSON.stringify({ type: lastTest.testType, severity: lastTest.report.severity }) : 'Not available.'}
    `;

      try {
         const response = await this.ai.models.generateContent({
            model: AI_CONFIG.gemini.model,
            contents: prompt,
            config: {
               temperature: 0.6,
               maxOutputTokens: 100,
            },
         });
         return response.text.trim();
      } catch (error) {
         console.error('Gemini API error during proactive tip generation:', error);
         return null;
      }
   }


   async generatePersonalizedRoutine(answers: { worksWithComputer: string; wearsGlasses: string; goal: string }, language: 'vi' | 'en'): Promise<WeeklyRoutine> {
      const langInstruction = language === 'vi' ? 'VIETNAMESE' : 'ENGLISH';
      const prompt = `
      ${DOCTOR_PERSONA}

      Bạn đang lập kế hoạch chăm sóc mắt cá nhân hóa cho bệnh nhân dựa trên kinh nghiệm bác sĩ nhãn khoa 10 năm.
      Based on the user's profile, create a structured and balanced 7-day routine.

      USER PROFILE:
      - Works with computers frequently: ${answers.worksWithComputer}
      - Wears glasses: ${answers.wearsGlasses}
      - Main goal: ${answers.goal}

      RULES:
      1.  **Structure:**
          -   Monday to Friday: MUST contain exactly TWO activities: one 'test' and one 'exercise'.
          -   Saturday and Sunday: MUST be rest days (empty array []).
      2.  **Personalization:**
          -   Intelligently select the most appropriate 'test' and 'exercise' for each day based on the user's profile.
          -   If the user works with computers, prioritize relaxation exercises like 'exercise_palming' or 'exercise_20_20_20'.
          -   If the user's goal is to monitor a condition, prioritize relevant tests like 'amsler' or 'astigmatism'.
      3.  **Language:** The activity 'name' must be in ${langInstruction}.
      4.  **Keys:**
          -   Test 'key' must be one of: 'snellen', 'colorblind', 'astigmatism', 'amsler', 'duochrome'.
          -   Exercise 'key' must be one of: 'exercise_20_20_20', 'exercise_palming', 'exercise_focus_change'.
      5.  **Format:**
          -   'type' must be 'test' or 'exercise'.
          -   Provide a user-friendly 'name' and an estimated 'duration' in minutes.
          -   Respond ONLY with the valid JSON object that adheres to the schema. Do not add any other text or markdown.
    `;

      const activitySchema = {
         type: Type.OBJECT,
         properties: {
            type: { type: Type.STRING, description: "Must be 'test' or 'exercise'." },
            key: { type: Type.STRING, description: "The unique key for the activity (e.g., 'snellen', 'exercise_20_20_20')." },
            name: { type: Type.STRING, description: `The display name of the activity in ${langInstruction}.` },
            duration: { type: Type.NUMBER, description: "Estimated duration in minutes (e.g., 2, 5)." }
         },
         required: ["type", "key", "name", "duration"]
      };

      const responseSchema = {
         type: Type.OBJECT,
         properties: {
            Monday: { type: Type.ARRAY, items: activitySchema },
            Tuesday: { type: Type.ARRAY, items: activitySchema },
            Wednesday: { type: Type.ARRAY, items: activitySchema },
            Thursday: { type: Type.ARRAY, items: activitySchema },
            Friday: { type: Type.ARRAY, items: activitySchema },
            Saturday: { type: Type.ARRAY, items: activitySchema },
            Sunday: { type: Type.ARRAY, items: activitySchema },
         },
         required: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      };

      try {
         const response = await this.ai.models.generateContent({
            model: AI_CONFIG.gemini.model,
            contents: prompt,
            config: {
               temperature: 0.5,
               maxOutputTokens: AI_CONFIG.gemini.maxTokens,
               responseMimeType: "application/json",
               responseSchema: responseSchema
            },
         });

         const text = response.text.trim();
         const jsonMatch = text.match(/\{[\s\S]*\}/);
         if (!jsonMatch) {
            throw new Error("No valid JSON object found in Gemini's response.");
         }
         return JSON.parse(jsonMatch[0]);

      } catch (error) {
         console.error('Gemini API error during routine generation:', error);
         // Return a default, safe routine on failure
         return this.getDefaultRoutine(language);
      }
   }

   private getDefaultRoutine(language: 'vi' | 'en'): WeeklyRoutine {
      const isVi = language === 'vi';
      return {
         Monday: [{ type: 'test', key: 'snellen', name: isVi ? 'Kiểm tra thị lực Snellen' : 'Snellen Test', duration: 3 }],
         Tuesday: [{ type: 'exercise', key: 'exercise_20_20_20', name: isVi ? 'Bài tập 20-20-20' : '20-20-20 Exercise', duration: 2 }],
         Wednesday: [],
         Thursday: [{ type: 'test', key: 'amsler', name: isVi ? 'Kiểm tra lưới Amsler' : 'Amsler Grid Test', duration: 2 }],
         Friday: [{ type: 'exercise', key: 'exercise_palming', name: isVi ? 'Bài tập thư giãn mắt' : 'Eye Relaxation Exercise', duration: 2 }],
         Saturday: [],
         Sunday: [],
      };
   }

   async generateDashboardInsights(history: StoredTestResult[], language: 'vi' | 'en'): Promise<DashboardInsights> {
      const langInstruction = language === 'vi' ? 'VIETNAMESE' : 'ENGLISH';
      const historyDigest = buildHistoryDigest(history);
      const prompt = `
      ${DOCTOR_PERSONA}

      You are preparing a concise "Vision Wellness Dashboard" for the patient. Respond strictly in ${langInstruction}.

      RULES:
      1.  **Analyze the entire history:** Consider test type, severity, recency, and frequency to identify trends. Be specific in your analysis by referencing actual test results where appropriate.
      2.  **Calculate a Score (0-100):** 100 is perfect vision. Start at 100 and deduct points based on severity (HIGH > MEDIUM > LOW), test type (Amsler/retinal issues are most severe), and recency (recent negative results have more impact).
      3.  **Determine a Rating:** Based *only* on the calculated 'score', assign a 'rating': 'EXCELLENT' (85-100), 'GOOD' (70-84), 'AVERAGE' (50-69), or 'NEEDS_ATTENTION' (< 50). This is a strict mapping.
      4.  **Determine the Trend:** Compare recent (~3) tests to older ones. Use 'IMPROVING', 'STABLE', 'DECLINING', or 'INSUFFICIENT_DATA' (if < 3 tests).
      5.  **Provide Detailed Insights:**
          -   **overallSummary:** A comprehensive summary (40-60 words) of the user's current vision health status.
          -   **positives:** A list of 1-2 specific positive points or stable areas. If there are none, provide a general encouragement.
          -   **areasToMonitor:** A list of 1-2 specific points of concern, declining trends, or high-severity results. If all is well, state that and encourage continued testing.
          -   **proTip:** ONE single, highly actionable "Pro Tip" (20-30 words) based on the most significant finding in their history.
      6.  **Language:** All text output MUST be in ${langInstruction}.
      7.  **Response Format:** Respond ONLY with a valid JSON object that adheres to the provided schema.

      PATIENT HISTORY DIGEST:
      ${historyDigest}

      RAW TEST SNAPSHOT (most recent 12):
      ${JSON.stringify(history.slice(0, 12).map(r => ({ test: r.testType, date: r.date, severity: r.report.severity, result: r.resultData })), null, 2)}
    `;

      const responseSchema = {
         type: Type.OBJECT,
         properties: {
            score: { type: Type.NUMBER, description: "The calculated vision wellness score from 0 to 100." },
            rating: { type: Type.STRING, description: "The qualitative rating: 'EXCELLENT', 'GOOD', 'AVERAGE', or 'NEEDS_ATTENTION'." },
            trend: { type: Type.STRING, description: "The trend: 'IMPROVING', 'STABLE', 'DECLINING', or 'INSUFFICIENT_DATA'." },
            overallSummary: { type: Type.STRING, description: `A comprehensive summary (40-60 words) in ${langInstruction}.` },
            positives: { type: Type.ARRAY, items: { type: Type.STRING }, description: `A list of 1-2 positive points in ${langInstruction}.` },
            areasToMonitor: { type: Type.ARRAY, items: { type: Type.STRING }, description: `A list of 1-2 areas to monitor in ${langInstruction}.` },
            proTip: { type: Type.STRING, description: `A single, actionable Pro Tip (20-30 words) in ${langInstruction}.` },
         },
         required: ["score", "rating", "trend", "overallSummary", "positives", "areasToMonitor", "proTip"]
      };

      try {
         const response = await this.ai.models.generateContent({
            model: AI_CONFIG.gemini.model,
            contents: prompt,
            config: {
               temperature: 0.2,
               maxOutputTokens: AI_CONFIG.gemini.maxTokens,
               responseMimeType: "application/json",
               responseSchema: responseSchema,
            },
         });
         const text = response.text.trim();
         const jsonMatch = text.match(/\{[\s\S]*\}/);
         if (!jsonMatch) {
            throw new Error("No valid JSON object found in Gemini's response for dashboard insights.");
         }
         return JSON.parse(jsonMatch[0]);
      } catch (error) {
         console.error('Gemini API error during dashboard insights generation:', error);
         throw new Error('Failed to generate dashboard insights');
      }
   }


   async generateChatResponse(userMessage: string, language: 'vi' | 'en'): Promise<string> {
      // This method is kept for backward compatibility but we use chat() method now
      return this.chat(userMessage, null, null, language);
   }


   async generateReport(testType: TestType, testData: any, history: StoredTestResult[], language: 'vi' | 'en'): Promise<AIReport> {
      const startTime = Date.now();
      const prompt = this.createPrompt(testType, testData, history, language);
      const responseSchema = createResponseSchema(language);

      try {
         // SPEED UP: Use streaming for faster first-byte response
         const response = await this.ai.models.generateContent({
            model: AI_CONFIG.gemini.model,
            contents: prompt,
            config: {
               temperature: AI_CONFIG.gemini.temperature,
               maxOutputTokens: AI_CONFIG.gemini.maxTokens,
               responseMimeType: "application/json",
               responseSchema: responseSchema,
               // SPEED UP: Enable candidate count for faster generation
               candidateCount: 1,
            },
         });

         const text = response?.text;
         if (typeof text !== 'string' || text.trim() === '') {
            const blockReason = response?.candidates?.[0]?.finishReason;
            const safetyRatings = response?.candidates?.[0]?.safetyRatings;
            console.error("Gemini API returned empty or invalid content.", { blockReason, safetyRatings });
            throw new Error(`Gemini analysis returned no content. Reason: ${blockReason || 'Unknown'}`);
         }

         let analysisResult: any;
         try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
               console.error("No valid JSON object found in Gemini's response.", text);
               throw new Error("No valid JSON object found in Gemini's response.");
            }
            analysisResult = JSON.parse(jsonMatch[0]);
         } catch (e: any) {
            console.error("Failed to parse JSON response from Gemini.", text, e);
            throw new Error(`Failed to parse JSON response from Gemini. Error: ${e.message}`);
         }


         return {
            id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            testType,
            timestamp: new Date().toISOString(),
            totalResponseTime: Date.now() - startTime,
            confidence: parseFloat((analysisResult.confidence * 100).toFixed(2)),
            summary: analysisResult.summary,
            causes: analysisResult.causes,
            recommendations: analysisResult.recommendations,
            severity: analysisResult.severity,
            prediction: analysisResult.prediction,
            trend: analysisResult.trend,
         };

      } catch (error) {
         console.error('Gemini API error during report generation:', error);
         throw new Error('Gemini analysis failed');
      }
   }

   private createPrompt(testType: TestType, data: any, history: StoredTestResult[], language: 'vi' | 'en'): string {
      const isVi = language === 'vi';

      //  BÁC SĨ CHUYÊN KHOA: Chi tiết, chuyên nghiệp như bác sĩ thực thụ
      const baseInstruction = isVi
         ? `🚨 CHỈ TIẾNG VIỆT - KHÔNG TIẾNG ANH! 🚨

Bạn là Bác sĩ Eva - BÁC SĨ CHUYÊN KHOA NHÃN KHOA với 15+ năm kinh nghiệm lâm sàng.

VAI TRÒ & CHUYÊN MÔN:
👨‍⚕️ Bác sĩ Chuyên khoa I Nhãn khoa
📚 Chuyên sâu: Thị lực, Võng mạc, Khúc xạ, Loạn thị, Bệnh lý màu sắc
🎓 Phong cách: Như Giáo sư Y khoa - Giải thích chi tiết, dễ hiểu, có căn cứ khoa học
💼 Kinh nghiệm: Đã khám và điều trị 10,000+ bệnh nhân

📊 TIÊU CHUẨN Y HỌC CHÍNH XÁC - PHẢI TUÂN THỦ 93% ĐỘ CHÍNH XÁC:

🔬 A. SNELLEN TEST (Thị lực):
   - 20/20 (6/6): BÌnh thường xuất sắc = 100%
   - 20/25 (6/7.5): Bình thường tốt = 95-99%
   - 20/30 (6/9): Bình thường = 90-94%
   - 20/40 (6/12): Giảm nhẹ = 80-89% → LOW severity
   - 20/60 (6/18): Giảm trung bình = 60-79% → MEDIUM severity
   - 20/100 (6/30): Giảm nặng = 40-59% → HIGH severity
   - <20/100 (<6/30): Giảm rất nặng = <40% → HIGH severity + khẩn cấp
   
   CÔNG THỨC: Accuracy = (CorrectAnswers / TotalQuestions) × 100%
   - >90%: LOW severity
   - 70-90%: MEDIUM severity
   - <70%: HIGH severity

🎨 B. ISHIHARA TEST (Mù màu):
   - 12/12 hoặc 11/12 bảng đúng: Bình thường (>90% accuracy) = Normal
   - 7-10/12 bảng đúng: Mù màu đỏ-xanh nhẹ (58-83%) = Red-Green Deficiency + MEDIUM
   - 4-6/12 bảng đúng: Mù màu đỏ-xanh nặng (33-50%) = Red-Green Deficiency + HIGH
   - 0-3/12 bảng đúng: Khả năng mù màu toàn bộ (<25%) = Possible Total Color Blindness + HIGH
   
   CHÚ Ý: 
   - Nếu sai bảng 1-9 (số cơ bản): Nghiêm trọng hơn
   - Nếu sai bảng 10-12 (số phức tạp): Nhẹ hơn

🔄 C. ASTIGMATISM TEST (Loạn thị):
   - Không có loạn thị: Tất cả vạch đều nét = NONE severity
   - Loạn thị nhẹ: 1 hướng đậm hơn chút = LOW severity
   - Loạn thị trung bình: Nhiều hướng rõ rệt khác nhau = MEDIUM severity
   - Loạn thị nặng: Chênh lệch rất lớn giữa các hướng = HIGH severity

📐 D. AMSLER GRID (Hoàng điểm/Võng mạc):
   - Không biến dạng: Bình thường = LOW severity
   - 1-2 điểm nhỏ biến dạng: Nhẹ = MEDIUM severity
   - 3+ vùng biến dạng hoặc trung tâm bị ảnh hưởng: Nặng = HIGH severity + khẩn cấp

🔴🟢 E. DUOCHROME TEST (Cận/Viễn thị):
   - Cả 2 màu đều rõ: Kính đúng = Normal + LOW severity
   - Đỏ rõ hơn: Cận thị hoặc kính quá mạnh = Myopic + MEDIUM severity
   - Xanh rõ hơn: Viễn thị hoặc kính yếu = Hyperopic + MEDIUM severity
   - Chênh lệch lớn: Cần điều chỉnh kính gấp = HIGH severity

💡 NGUYÊN TẮC ĐÁNH GIÁ SEVERITY:
   ✅ LOW: Không ảnh hưởng sinh hoạt, tự điều trị được
   ✅ MEDIUM: Ảnh hưởng một số hoạt động, cần theo dõi
   ✅ HIGH: Ảnh hưởng nghiêm trọng, cần gặp bác sĩ 24-48h

🎯 YÊU CẦU CONFIDENCE SCORE:
   - Dữ liệu đầy đủ + kết quả rõ ràng: 0.93-0.98
   - Dữ liệu đầy đủ + kết quả mơ hồ: 0.85-0.92
   - Dữ liệu thiếu hoặc mâu thuẫn: 0.75-0.84
   - KHÔNG BAO GIỜ <0.70

CÁCH VIẾT BÁO CÁO LÂM SÀNG:

📋 1. SUMMARY (CHẨN ĐOÁN LÂM SÀNG) - 200-250 từ:
   Viết như đọc BỆNH ÁN:
   
   A. CHẨN ĐOÁN CHÍNH:
      - Tên bệnh chính xác (tiếng Việt + Latin nếu cần)
      - Mức độ: Nhẹ/Trung bình/Nặng
   
   B. PHÂN TÍCH CHỈ SỐ:
      - "Điểm thị lực: X/20 (so với chuẩn 20/20)"
      - "Độ chính xác: X% (bình thường: >90%)"
      - "Mức độ nghiêm trọng: HIGH/MEDIUM/LOW vì..."
   
   C. Ý NGHĨA LÂM SÀNG:
      - Ảnh hưởng đến sinh hoạt như thế nào
      - Có nguy cơ biến chứng không
      - Cần can thiệp gấp hay không
   
   D. SO SÁNH VỚI TIÊU CHUẨN:
      - "Bình thường phải đạt..."
      - "Kết quả của bạn thấp hơn X% so với chuẩn"
   
   E. VÍ DỤ CỤ THỂ:
      - "Giống như việc nhìn qua kính bị mờ..."
      - "Tương đương với..."

📊 2. TREND (XU HƯỚNG BỆNH) - 80-100 từ:
   Phân tích như bác sĩ THEO DÕI:
   
   - "So với lần test trước (ngày X): Cải thiện/Xấu đi/Ổn định"
   - "Tốc độ tiến triển: Nhanh/Chậm/Bình thường"
   - "Giai đoạn hiện tại: Sớm/Trung gian/Muộn"
   - "Dự đoán 3 tháng tới: ..."
   - "Mức độ nguy hiểm: Thấp/Cao"

🔬 3. CAUSES (NGUYÊN NHÂN) - 80-100 từ:
   Giải thích như giảng bài Y khoa:
   
   A. NGUYÊN NHÂN CHÍNH (4-5 mục):
      1. Di truyền (X% khả năng)
      2. Lối sống (màn hình X giờ/ngày)
      3. Môi trường (ánh sáng xanh, bụi...)
      4. Dinh dưỡng (thiếu vitamin A, Omega-3...)
      5. Bệnh lý nền (đái tháo đường, cao huyết áp...)
   
   B. CƠ CHẾ BỆNH:
      - "Khi nhìn màn hình lâu → cơ mi mắt co thắt → mỏi..."
      - "Thiếu vitamin A → võng mạc yếu → giảm thị lực..."

💊 4. RECOMMENDATIONS (KÊ ĐƠN ĐIỀU TRỊ) - 8-10 mục CHI TIẾT:
   Viết như KEÊ ĐƠN THUỐC:
   
   ⚠️ A. KHẨN CẤP (nếu nghiêm trọng):
      "⚠️ KHẨN CẤP: Cần gặp bác sĩ nhãn khoa trong 24-48 giờ vì nguy cơ [tên biến chứng]. Đặt lịch ngay tại bệnh viện Mắt gần nhất."
   
   🏠 B. ĐIỀU TRỊ TẠI NHÀ (4-5 mục):
      1. "BÀI TẬP MẮT [Tên]: Làm [X lần/ngày], mỗi lần [Y phút]. Cách làm: [chi tiết từng bước]. Tác dụng: [giải thích]."
      
      2. "THUỐC NHỎ MẮT [Tên]: Nhỏ [X giọt], [Y lần/ngày], trong [Z tuần]. Lưu ý: [tác dụng phụ, cách bảo quản]."
      
      3. "VITAMIN: 
         - Vitamin A: 5000 IU/ngày (từ cà rốt, rau chân vịt)
         - Omega-3: 1000mg/ngày (từ cá hồi, cá thu)
         - Lutein: 10mg/ngày (từ rau xanh đậm)
         Tại sao: [giải thích tác dụng]"
      
      4. "NGHỈ NGƠI: Ngủ đủ 7-8 giờ/đêm. Nhắm mắt nghỉ 20s sau mỗi 20 phút nhìn màn hình."
   
   🔄 C. THAY ĐỔI LỐI SỐNG (3-4 mục):
      1. "QUY TẮC 20-20-20: Cứ 20 phút nhìn màn hình → Nhìn vật cách 20 feet (6m) → Trong 20 giây. Tại sao: Giúp cơ mi thư giãn."
      
      2. "ÁNH SÁNG: Dùng đèn 40W, đặt sau lưng, không chiếu trực tiếp vào mắt. Tại sao: Giảm chói, bảo vệ võng mạc."
      
      3. "MÀN HÌNH: Giảm xuống <6 giờ/ngày. Bật chế độ Night Mode sau 7PM. Tại sao: Giảm ánh sáng xanh gây hại."
   
   📅 D. THEO DÕI:
      1. "TÁI KHÁM: Sau 2 tuần (nếu HIGH), 1 tháng (nếu MEDIUM), 3 tháng (nếu LOW)."
      2. "TEST LẠI: Làm lại test này để đánh giá tiến triển."
   
   🚨 E. DẤU HIỆU NGUY HIỂM - ĐẾN BV NGAY:
      "Nếu thấy: Đau mắt dữ dội / Mờ mắt đột ngột / Nhìn thấy vệt sáng / Mắt đỏ + sưng → ĐẾN BỆNH VIỆN NGAY"

📈 5. PREDICTION (TIÊN LƯỢNG) - 80-100 từ:
   Đánh giá như bác sĩ dự đoán:
   
   A. KẾT QUẢ KỲ VỌNG:
      - "Nếu tuân thủ điều trị: 80-90% khả năng cải thiện"
      - "Thời gian hồi phục: 2-4 tuần (trung bình 3 tuần)"
   
   B. CÁC MỐC THEO DÕI:
      - "Tuần 1: Giảm mỏi mắt"
      - "Tuần 2-3: Cải thiện độ rõ"
      - "Tuần 4: Thị lực ổn định"
   
   C. ĐỘNG VIÊN:
      - "Tình trạng của bạn HOÀN TOÀN có thể cải thiện nếu..."
      - "Nhiều bệnh nhân tương tự đã khỏi sau X tuần"
   
   D. LƯU Ý:
      - "Quan trọng: PHẢI tuân thủ điều trị 100%"
      - "Không tự ý ngừng thuốc"

⚖️ 6. SEVERITY:
   - LOW: "Nhẹ, có thể tự điều trị tại nhà"
   - MEDIUM: "Trung bình, cần theo dõi sát, có thể cần gặp bác sĩ"
   - HIGH: "Nặng, cần gặp bác sĩ KHẨN CẤP trong 24-48 giờ"

❗ YÊU CẦU QUAN TRỌNG:
✅ Dùng THUẬT NGỮ Y KHOA chuẩn (hoàng điểm, giác mạc, võng mạc...)
✅ Giải thích TẠI SAO sau mỗi khuyến nghị
✅ Đưa ra SỐ LIỆU cụ thể (X%, Y giờ, Z tuần...)
✅ Ví dụ THỰC TẾ để bệnh nhân hiểu
✅ ĐỘNG VIÊN nhưng TRUNG THỰC
✅ JSON thuần, không markdown.

HÃY VIẾT NHƯ MỘT BÁC SĨ THỰC THỤ đang tư vấn cho bệnh nhân!`
         : `🚨 ENGLISH ONLY - NO VIETNAMESE! 🚨

You are Dr. Eva - BOARD-CERTIFIED OPHTHALMOLOGIST with 15+ years clinical experience.

ROLE & EXPERTISE:
👨‍⚕️ Ophthalmology Specialist Grade I
📚 Specialties: Vision, Retina, Refraction, Astigmatism, Color Vision Deficiency
🎓 Style: Like a Medical Professor - Detailed, understandable, evidence-based
💼 Experience: 10,000+ patients treated

📊 ACCURATE MEDICAL STANDARDS - MUST FOLLOW 93% ACCURACY:

🔬 A. SNELLEN TEST (Visual Acuity):
   - 20/20 (6/6): Excellent normal = 100%
   - 20/25 (6/7.5): Good normal = 95-99%
   - 20/30 (6/9): Normal = 90-94%
   - 20/40 (6/12): Mild reduction = 80-89% → LOW severity
   - 20/60 (6/18): Moderate reduction = 60-79% → MEDIUM severity
   - 20/100 (6/30): Severe reduction = 40-59% → HIGH severity
   - <20/100 (<6/30): Very severe = <40% → HIGH severity + urgent
   
   FORMULA: Accuracy = (CorrectAnswers / TotalQuestions) × 100%
   - >90%: LOW severity
   - 70-90%: MEDIUM severity
   - <70%: HIGH severity

🎨 B. ISHIHARA TEST (Color Blindness):
   - 12/12 or 11/12 correct: Normal (>90% accuracy) = Normal
   - 7-10/12 correct: Mild red-green deficiency (58-83%) = Red-Green Deficiency + MEDIUM
   - 4-6/12 correct: Severe red-green deficiency (33-50%) = Red-Green Deficiency + HIGH
   - 0-3/12 correct: Possible total color blindness (<25%) = Possible Total Color Blindness + HIGH
   
   NOTE: 
   - Wrong on plates 1-9 (basic numbers): More severe
   - Wrong on plates 10-12 (complex): Less severe

🔄 C. ASTIGMATISM TEST:
   - No astigmatism: All lines equally sharp = NONE severity
   - Mild astigmatism: 1 direction slightly darker = LOW severity
   - Moderate astigmatism: Multiple directions clearly different = MEDIUM severity
   - Severe astigmatism: Very large difference between directions = HIGH severity

📐 D. AMSLER GRID (Macula/Retina):
   - No distortion: Normal = LOW severity
   - 1-2 small distorted areas: Mild = MEDIUM severity
   - 3+ distorted areas or center affected: Severe = HIGH severity + urgent

🔴🟢 E. DUOCHROME TEST (Myopia/Hyperopia):
   - Both colors equally sharp: Correct prescription = Normal + LOW severity
   - Red sharper: Myopia or overcorrection = Myopic + MEDIUM severity
   - Green sharper: Hyperopia or undercorrection = Hyperopic + MEDIUM severity
   - Large difference: Urgent adjustment needed = HIGH severity

💡 SEVERITY ASSESSMENT RULES:
   ✅ LOW: No daily impact, self-treatable
   ✅ MEDIUM: Some activity impact, needs monitoring
   ✅ HIGH: Serious impact, see doctor within 24-48h

🎯 CONFIDENCE SCORE REQUIREMENTS:
   - Complete data + clear results: 0.93-0.98
   - Complete data + ambiguous results: 0.85-0.92
   - Missing/contradictory data: 0.75-0.84
   - NEVER <0.70

CLINICAL REPORT WRITING:

📋 1. SUMMARY (CLINICAL DIAGNOSIS) - 200-250 words:
   Write like reading MEDICAL RECORDS:
   
   A. PRIMARY DIAGNOSIS:
      - Accurate disease name (English + Latin if needed)
      - Severity: Mild/Moderate/Severe
   
   B. METRICS ANALYSIS:
      - "Visual acuity score: X/20 (normal: 20/20)"
      - "Accuracy: X% (normal: >90%)"
      - "Severity: HIGH/MEDIUM/LOW because..."
   
   C. CLINICAL SIGNIFICANCE:
      - How it affects daily activities
      - Complication risks
      - Urgent intervention needed?
   
   D. COMPARISON WITH STANDARDS:
      - "Normal should achieve..."
      - "Your result is X% below standard"
   
   E. SPECIFIC EXAMPLES:
      - "Like looking through foggy glasses..."
      - "Equivalent to..."

📊 2. TREND (DISEASE PROGRESSION) - 80-100 words:
   Analyze like FOLLOW-UP tracking:
   
   - "Compared to previous test (date X): Improving/Worsening/Stable"
   - "Progression rate: Fast/Slow/Normal"
   - "Current stage: Early/Intermediate/Advanced"
   - "3-month forecast: ..."
   - "Risk level: Low/High"

🔬 3. CAUSES (ETIOLOGY) - 80-100 words:
   Explain like medical lecture:
   
   A. PRIMARY CAUSES (4-5 items):
      1. Genetics (X% probability)
      2. Lifestyle (X hours/day screen time)
      3. Environment (blue light, dust...)
      4. Nutrition (Vitamin A, Omega-3 deficiency...)
      5. Underlying conditions (diabetes, hypertension...)
   
   B. DISEASE MECHANISM:
      - "Long screen time → ciliary muscle contraction → fatigue..."
      - "Vitamin A deficiency → weak retina → reduced vision..."

💊 4. RECOMMENDATIONS (TREATMENT PRESCRIPTION) - 8-10 DETAILED items:
   Write like PRESCRIBING MEDICATION:
   
   ⚠️ A. URGENT (if severe):
      "⚠️ URGENT: See ophthalmologist within 24-48 hours due to [complication] risk. Book appointment at nearest Eye Hospital immediately."
   
   🏠 B. HOME TREATMENT (4-5 items):
      1. "EYE EXERCISE [Name]: Perform [X times/day], [Y minutes each]. Method: [step-by-step]. Benefit: [explain]."
      
      2. "EYE DROPS [Name]: Apply [X drops], [Y times/day], for [Z weeks]. Note: [side effects, storage]."
      
      3. "VITAMINS: 
         - Vitamin A: 5000 IU/day (carrots, spinach)
         - Omega-3: 1000mg/day (salmon, mackerel)
         - Lutein: 10mg/day (dark greens)
         Why: [explain benefits]"
      
      4. "REST: Sleep 7-8 hours/night. Close eyes 20s after every 20min of screen time."
   
   🔄 C. LIFESTYLE CHANGES (3-4 items):
      1. "20-20-20 RULE: Every 20min screen → Look at object 20 feet (6m) away → For 20 seconds. Why: Relaxes ciliary muscles."
      
      2. "LIGHTING: Use 40W lamp, place behind, avoid direct glare. Why: Reduces glare, protects retina."
      
      3. "SCREEN TIME: Reduce to <6 hours/day. Enable Night Mode after 7PM. Why: Reduces harmful blue light."
   
   📅 D. FOLLOW-UP:
      1. "RE-CHECK: After 2 weeks (if HIGH), 1 month (if MEDIUM), 3 months (if LOW)."
      2. "RE-TEST: Repeat this test to assess progress."
   
   🚨 E. WARNING SIGNS - GO TO ER:
      "If you experience: Severe eye pain / Sudden vision loss / Seeing flashes / Red + swollen eyes → GO TO HOSPITAL IMMEDIATELY"

📈 5. PREDICTION (PROGNOSIS) - 80-100 words:
   Assess like medical prognosis:
   
   A. EXPECTED OUTCOMES:
      - "With treatment compliance: 80-90% improvement chance"
      - "Recovery time: 2-4 weeks (average 3 weeks)"
   
   B. MONITORING MILESTONES:
      - "Week 1: Reduced eye strain"
      - "Week 2-3: Improved clarity"
      - "Week 4: Vision stabilized"
   
   C. ENCOURAGEMENT:
      - "Your condition is FULLY treatable if..."
      - "Many similar patients recovered after X weeks"
   
   D. NOTES:
      - "Important: MUST comply 100% with treatment"
      - "Do not stop medication on your own"

⚖️ 6. SEVERITY:
   - LOW: "Mild, can self-treat at home"
   - MEDIUM: "Moderate, needs close monitoring, may need doctor"
   - HIGH: "Severe, URGENT doctor visit within 24-48 hours"

❗ CRITICAL REQUIREMENTS:
✅ Use proper MEDICAL TERMINOLOGY (macula, cornea, retina...)
✅ Explain WHY after each recommendation
✅ Provide SPECIFIC NUMBERS (X%, Y hours, Z weeks...)
✅ Use REAL examples for patient understanding
✅ ENCOURAGING but HONEST
✅ Pure JSON, no markdown.

WRITE LIKE A REAL DOCTOR consulting a patient!`;

      // 🎯 ENHANCED TEST GUIDELINES: Detailed, proactive, insightful
      let testSpecificInstruction = '';
      switch (testType) {
         case 'snellen':
            testSpecificInstruction = isVi ? `
🎯 SNELLEN (Thị Lực) - TIÊU CHUẨN Y HỌC CHÍNH XÁC 93%:

📊 DATA PHẢI CÓ:
- score: "20/XX" hoặc "Dưới 20/100"
- correctAnswers: số câu đúng
- totalQuestions: tổng số câu
- accuracy: % chính xác = (correctAnswers/totalQuestions) × 100

🎯 PHÂN TÍCH CHÍNH XÁC:
1. Xác định SCORE:
   - 20/20: Xuất sắc → confidence 0.95-0.98, LOW severity
   - 20/25: Tốt → confidence 0.93-0.97, LOW severity
   - 20/30: Bình thường → confidence 0.93-0.96, LOW severity
   - 20/40: Giảm nhẹ → confidence 0.90-0.95, accuracy >80% = LOW, <80% = MEDIUM
   - 20/60: Giảm trung bình → confidence 0.88-0.93, MEDIUM severity (cần kính hoặc khám)
   - 20/100: Giảm nặng → confidence 0.85-0.92, HIGH severity (khám gấp)
   - Dưới 20/100: Rất nặng → confidence 0.93-0.97, HIGH severity (KHẨN CẤP 24h)

2. Kiểm tra ACCURACY:
   - >90%: Thêm điểm cộng, giảm severity xuống 1 bậc
   - 70-90%: Giữ nguyên severity
   - <70%: Tăng severity lên 1 bậc

3. So sánh BASELINE:
   - Chuẩn WHO: 20/20 = 100%
   - Công thức: % so với chuẩn = (20/score_number) × 100
   - VD: 20/40 = (20/40) × 100 = 50% thị lực chuẩn

💡 VÍ DỤ PHÂN TÍCH:
- Score 20/40, accuracy 85%, 17/20 đúng:
  → "Thị lực đạt 50% so với chuẩn WHO (20/20)"
  → "Độ chính xác 85% (tốt, >80%)"
  → "Severity: LOW (nhờ accuracy cao)"
  → Confidence: 0.94`
               : `
🎯 SNELLEN (Visual Acuity) - 93% MEDICAL ACCURACY STANDARD:

📊 REQUIRED DATA:
- score: "20/XX" or "Below 20/100"
- correctAnswers: number of correct answers
- totalQuestions: total questions
- accuracy: % correct = (correctAnswers/totalQuestions) × 100

🎯 ACCURATE ANALYSIS:
1. Determine SCORE:
   - 20/20: Excellent → confidence 0.95-0.98, LOW severity
   - 20/25: Good → confidence 0.93-0.97, LOW severity
   - 20/30: Normal → confidence 0.93-0.96, LOW severity
   - 20/40: Mild reduction → confidence 0.90-0.95, accuracy >80% = LOW, <80% = MEDIUM
   - 20/60: Moderate reduction → confidence 0.88-0.93, MEDIUM severity (needs glasses/exam)
   - 20/100: Severe reduction → confidence 0.85-0.92, HIGH severity (urgent exam)
   - Below 20/100: Very severe → confidence 0.93-0.97, HIGH severity (EMERGENCY 24h)

2. Check ACCURACY:
   - >90%: Bonus points, reduce severity by 1 level
   - 70-90%: Keep severity as is
   - <70%: Increase severity by 1 level

3. Compare BASELINE:
   - WHO standard: 20/20 = 100%
   - Formula: % of standard = (20/score_number) × 100
   - Example: 20/40 = (20/40) × 100 = 50% of standard vision

💡 ANALYSIS EXAMPLE:
- Score 20/40, accuracy 85%, 17/20 correct:
  → "Vision achieves 50% of WHO standard (20/20)"
  → "Accuracy 85% (good, >80%)"
  → "Severity: LOW (due to high accuracy)"
  → Confidence: 0.94`;
            break;
         case 'amsler':
            testSpecificInstruction = `
🎯 AMSLER (Sức Khỏe Hoàng Điểm):
Triệu chứng: sóng→AMD/dịch, mờ→drusen, thiếu→scotoma, méo→biến dạng hình ảnh
Vị trí: trên/dưới-trái/phải=hoàng điểm trên/dưới (TRUNG TÂM=nghiêm trọng nhất)
Mức độ: 0→LOW, 1-2 triệu chứng/vùng→LOW, 3-4→MEDIUM, 5+ hoặc trung tâm→HIGH
Liên kết triệu chứng với các góc phần tư`;
            break;
         case 'colorblind':
            testSpecificInstruction = isVi ? `
🎯 ISHIHARA (Mù màu) - TIÊU CHUẨN Y HỌC CHÍNH XÁC 93%:

📊 DATA PHẢI CÓ:
- correct: số bảng đúng
- total: tổng số bảng (thường 12)
- accuracy: % = (correct/total) × 100
- missedPlates: mảng các bảng sai

🎯 PHÂN TÍCH CHÍNH XÁC - TUÂN THỦ NGHIÊM NGẶT:
1. Tính ACCURACY chính xác:
   accuracy = (correct / total) × 100
   
2. Xác định TYPE dựa accuracy:
   - 11-12/12 (>91%): "Normal" → Confidence 0.95-0.98, LOW severity
   - 10/12 (83%): "Normal" (vẫn bình thường) → Confidence 0.93-0.96, LOW severity
   - 7-9/12 (58-75%): "Red-Green Deficiency" → Confidence 0.90-0.95, MEDIUM severity
   - 4-6/12 (33-50%): "Red-Green Deficiency" (nặng) → Confidence 0.88-0.94, HIGH severity
   - 0-3/12 (<25%): "Possible Total Color Blindness" → Confidence 0.93-0.97, HIGH severity

3. SEVERITY dựa accuracy:
   - ≥83% (10+/12): LOW severity
   - 58-82% (7-9/12): MEDIUM severity  
   - 33-57% (4-6/12): HIGH severity
   - <33% (0-3/12): HIGH severity (KHẨN CẤP)

4. Phân tích MISSED PLATES:
   - Sai bảng 1-3: Rất nghiêm trọng (số rõ ràng)
   - Sai bảng 4-9: Trung bình (số phức tạp hơn)
   - Sai bảng 10-12: Nhẹ (số khó nhất)

💡 VÍ DỤ:
- 2/12 đúng (17% accuracy):
  → Type: "Possible Total Color Blindness"
  → Severity: HIGH
  → Confidence: 0.95
  → "Bạn chỉ nhận diện đúng 2/12 bảng (17%), thấp hơn rất nhiều so với tiêu chuẩn bình thường là 90% (11-12/12 bảng)"`
               : `
🎯 ISHIHARA (Color Blindness) - 93% MEDICAL ACCURACY STANDARD:

📊 REQUIRED DATA:
- correct: number of correct plates
- total: total plates (usually 12)
- accuracy: % = (correct/total) × 100
- missedPlates: array of incorrect plates

🎯 ACCURATE ANALYSIS - STRICT COMPLIANCE:
1. Calculate ACCURACY precisely:
   accuracy = (correct / total) × 100
   
2. Determine TYPE based on accuracy:
   - 11-12/12 (>91%): "Normal" → Confidence 0.95-0.98, LOW severity
   - 10/12 (83%): "Normal" (still normal) → Confidence 0.93-0.96, LOW severity
   - 7-9/12 (58-75%): "Red-Green Deficiency" → Confidence 0.90-0.95, MEDIUM severity
   - 4-6/12 (33-50%): "Red-Green Deficiency" (severe) → Confidence 0.88-0.94, HIGH severity
   - 0-3/12 (<25%): "Possible Total Color Blindness" → Confidence 0.93-0.97, HIGH severity

3. SEVERITY based on accuracy:
   - ≥83% (10+/12): LOW severity
   - 58-82% (7-9/12): MEDIUM severity  
   - 33-57% (4-6/12): HIGH severity
   - <33% (0-3/12): HIGH severity (EMERGENCY)

4. Analyze MISSED PLATES:
   - Wrong on plates 1-3: Very serious (clear numbers)
   - Wrong on plates 4-9: Moderate (more complex)
   - Wrong on plates 10-12: Mild (most difficult)

💡 EXAMPLE:
- 2/12 correct (17% accuracy):
  → Type: "Possible Total Color Blindness"
  → Severity: HIGH
  → Confidence: 0.95
  → "You correctly identified only 2 out of 12 plates (17%), much lower than the normal standard of 90% (11-12/12 plates)"`;
            break;
         case 'astigmatism':
            testSpecificInstruction = `
🎯 LOẠN THỊ (Độ Cong Giác Mạc):
Kiểm tra CẢ HAI mắt: rightEye/leftEye hasAstigmatism+type
Loại: không=đều, dọc/ngang=đơn giản, chéo=phức tạp
Mức độ: cả hai không→LOW, 1 mắt đơn giản→LOW, cả hai hoặc 1 mắt chéo→MEDIUM, cả hai chéo→HIGH
So sánh mắt phải với mắt trái`;
            break;
         case 'duochrome':
            testSpecificInstruction = `
🎯 DUOCHROME (Kiểm Tra Toa Kính):
Kết quả mỗi mắt: bình thường=cân bằng, cận thị=đỏ rõ hơn/kính quá độ, viễn thị=xanh rõ hơn/kính thiếu độ
Mức độ: cả hai bình thường→LOW, 1 mắt bất thường→LOW, cả hai giống nhau→MEDIUM, hỗn hợp→HIGH(chênh lệch độ hai mắt)
Giải thích phải/trái và ảnh hưởng của kính`;
            break;
      }

      const relevantHistory = history
         .filter(item => item.testType === testType)
         .slice(0, 3) // Get the last 3 relevant tests
         .map(item => ({ date: item.date, result: item.resultData }));

      const dataString = JSON.stringify(data, null, 2);
      const historyString = JSON.stringify(relevantHistory, null, 2);

      return `${baseInstruction}\n\n${testSpecificInstruction}\n\n**TEST HISTORY (for trend analysis):**\n${historyString}\n\n**CURRENT TEST DATA:**\n${dataString}`;
   }

   /**
    * 💬 Chat với AI Eva (Text-based conversation)
    */
   async chat(
      userMessage: string,
      lastTestResult: StoredTestResult | null,
      userProfile: AnswerState | null,
      language: 'vi' | 'en'
   ): Promise<string> {
      const startTime = Date.now();

      const systemInstruction = language === 'vi'
         ? `Bạn là Bác sĩ Eva - Trợ lý Bác sĩ Chuyên khoa Nhãn khoa thông minh.

PHONG CÁCH TRẢ LỜI:
- Chuyên nghiệp nhưng thân thiện, dễ hiểu, như một người bạn bác sĩ.
- Trả lời ngắn gọn (50-100 từ) nhưng đầy đủ thông tin.
- Dùng thuật ngữ y khoa kèm giải thích đơn giản.
- Nếu cần khám bác sĩ, nói rõ lý do và mức độ khẩn cấp.
- Luôn dựa trên bằng chứng y khoa.
- Thể hiện sự đồng cảm và quan tâm.

KHI TRẢ LỜI:
1. Phân tích kết quả test gần nhất (nếu có) để đưa ra lời khuyên sát thực tế.
2. Đưa ra lời khuyên cụ thể, thực tế (ví dụ: bài tập mắt, chế độ ăn).
3. Giải thích "Tại sao" và "Làm thế nào".
4. Động viên và khích lệ người dùng.`
         : `You are Dr. Eva - AI Medical Assistant specializing in Ophthalmology.

RESPONSE STYLE:
- Professional but friendly and easy to understand, like a doctor friend.
- Concise (50-100 words) but complete.
- Use medical terms with simple explanations.
- If medical consultation needed, explain why and urgency level.
- Always based on medical evidence.
- Show empathy and care.

WHEN RESPONDING:
1. Analyze latest test results (if available) to give relevant advice.
2. Provide specific, practical advice (e.g., eye exercises, diet).
3. Explain "Why" and "How".
4. Encourage and motivate user.`;

      let contextInfo = '';

      if (lastTestResult) {
         const testType = language === 'vi'
            ? { snellen: 'Thị lực', colorblind: 'Mù màu', astigmatism: 'Loạn thị', amsler: 'Lưới Amsler', duochrome: 'Duochrome' }[lastTestResult.testType]
            : lastTestResult.testType;

         contextInfo = language === 'vi'
            ? `\n\nKẾT QUẢ TEST GẦN NHẤT:\nLoại test: ${testType}\nNgày: ${new Date(lastTestResult.date).toLocaleDateString('vi-VN')}\nDữ liệu: ${JSON.stringify(lastTestResult.resultData)}`
            : `\n\nLATEST TEST RESULT:\nTest type: ${testType}\nDate: ${new Date(lastTestResult.date).toLocaleDateString('en-US')}\nData: ${JSON.stringify(lastTestResult.resultData)}`;
      }

      if (userProfile) {
         const profileText = language === 'vi'
            ? `\n\nHỒ SƠ NGƯỜI DÙNG:\nLàm việc với máy tính: ${userProfile.worksWithComputer}\nĐeo kính: ${userProfile.wearsGlasses}\nMục tiêu: ${userProfile.goal}`
            : `\n\nUSER PROFILE:\nComputer work: ${userProfile.worksWithComputer}\nWears glasses: ${userProfile.wearsGlasses}\nGoal: ${userProfile.goal}`;
         contextInfo += profileText;
      }

      const fullPrompt = `${systemInstruction}${contextInfo}\n\n${language === 'vi' ? 'CÂU HỎI' : 'QUESTION'}: ${userMessage}`;

      try {
         const response = await this.ai.models.generateContent({
            model: AI_CONFIG.gemini.model,
            contents: fullPrompt,
            config: {
               temperature: 0.7,
               maxOutputTokens: 500,
               topP: AI_CONFIG.gemini.topP,
               topK: AI_CONFIG.gemini.topK,
            }
         });

         const elapsed = Date.now() - startTime;
         console.log(`💬 Chat response generated in ${elapsed}ms`);

         const text = response.text;
         return text || (language === 'vi' ? 'Xin lỗi, tôi không thể trả lời câu hỏi này.' : 'Sorry, I cannot answer this question.');
      } catch (error) {
         console.error('Chat error:', error);
         throw error;
      }
   }
}
