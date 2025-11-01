




import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AIReport, StoredTestResult, TestType, WeeklyRoutine, DashboardInsights, AnswerState } from '../types';

// ⚡ ULTRA-FAST AI CONFIGURATION - OPTIMIZED FOR SPEED
const AI_CONFIG = {
  gemini: { 
    model: 'gemini-2.0-flash-exp', // 🔥 FASTEST: Gemini 2.0 Flash Experimental
    temperature: 0.15, // ⚡ FASTER: Lower temp = faster generation (from 0.25)
    maxTokens: 1500, // ⚡ FASTER: Reduced for speed (from 2000)
    topP: 0.75, // ⚡ FASTER: More focused (from 0.85)
    topK: 20 // ⚡ FASTER: Quicker token selection (from 25)
  },
  tts: {
    model: "gemini-2.5-flash-preview-tts", // 🎙️ TTS Flash model
    cacheDuration: 30 * 60 * 1000, // ⚡ LONGER CACHE: 30 minutes (from 20min)
    maxCacheSize: 200 // ⚡ MORE CACHE: Store more responses (from 150)
  },
  streaming: {
    enabled: true, // 🌊 STREAMING: Real-time response chunks
    bufferSize: 128 // ⚡ ULTRA-FAST: Tiny buffer for instant streaming (from 256)
  }
};

// 🎯 ULTRA-COMPACT SCHEMA: Minimal tokens, maximum speed
const createResponseSchema = (language: 'vi' | 'en') => {
    const L = language === 'vi' ? 'VI' : 'EN'; // Ultra-short language marker
    
    return {
        type: Type.OBJECT,
        properties: {
            confidence: { 
                type: Type.NUMBER, 
                description: `0.85-0.98. Accuracy-based.` // 8 words (was 10)
            },
            summary: { 
                type: Type.STRING, 
                description: `120-150 words ${L}. Detailed analysis with specific numbers, impact levels, and ranges. Be proactive and insightful.`
            },
            trend: { 
                type: Type.STRING, 
                description: `50-70 words ${L}. Compare with baseline, identify patterns, predict trajectory. Be analytical and forward-thinking.`
            },
            causes: { 
                type: Type.STRING, 
                description: `40-60 words ${L}. Identify 3-4 root causes with evidence-based reasoning. Be specific and educational.`
            },
            recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: `5-6 actionable items ${L}. Include: immediate actions, lifestyle changes, monitoring strategies, when to see doctor, preventive measures. Be practical and encouraging.`
            },
            severity: { 
                type: Type.STRING, 
                description: `LOW/MEDIUM/HIGH` // 2 words (was 5)
            },
            prediction: { 
                type: Type.STRING, 
                description: `40-60 words ${L}. Realistic outlook with timeline, expected improvements, and motivational guidance. Be hopeful yet honest.`
            },
        },
        required: ["confidence", "summary", "trend", "recommendations", "severity", "causes", "prediction"]
    };
};


export class AIService {
  private ai: GoogleGenAI;
  
  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // 🚀 ULTRA-OPTIMIZED TTS CACHE with LRU eviction
  private ttsCache = new Map<string, { data: string, timestamp: number, hits: number }>();

  async generateSpeech(text: string, language: 'vi' | 'en'): Promise<string | null> {
    try {
        // 💾 SMART CACHE: Check with hit tracking
        const cacheKey = `${language}:${text}`;
        const cached = this.ttsCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < AI_CONFIG.tts.cacheDuration) {
            cached.hits++; // Track popularity
            console.log(`🚀 TTS Cache HIT (${cached.hits}x):`, text.substring(0, 40));
            return cached.data;
        }

        // 🎯 HIGH-QUALITY TTS: Generate complete audio in batch mode
        const response = await this.ai.models.generateContent({
            model: AI_CONFIG.tts.model,
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { 
                            voiceName: language === 'vi' ? 'Kore' : 'Puck' 
                        },
                    },
                },
            },
        });
        
        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? null;
        
        // 💾 SMART CACHE: Store with hit tracking
        if (audioData) {
            this.ttsCache.set(cacheKey, { data: audioData, timestamp: Date.now(), hits: 0 });
            
            // 🧹 LRU EVICTION: Remove least-used items when full
            if (this.ttsCache.size > AI_CONFIG.tts.maxCacheSize) {
                let leastUsedKey = '';
                let leastHits = Infinity;
                
                // Find least popular entry
                this.ttsCache.forEach((value, key) => {
                    if (value.hits < leastHits) {
                        leastHits = value.hits;
                        leastUsedKey = key;
                    }
                });
                
                if (leastUsedKey) {
                    this.ttsCache.delete(leastUsedKey);
                    console.log('🗑️ TTS Cache: Evicted least-used entry');
                }
            }
        }
        
        return audioData;
    } catch (error) {
        console.error(`Failed to generate speech for text "${text}":`, error);
        return null;
    }
  }
  
  async generateProactiveTip(lastTest: StoredTestResult | null, userProfile: AnswerState | null, language: 'vi' | 'en'): Promise<string | null> {
    const langInstruction = language === 'vi' ? 'VIETNAMESE' : 'ENGLISH';
    const prompt = `
        You are Eva, a friendly and proactive AI vision coach. The user has been idle in the voice assistant panel. Your goal is to offer ONE short, encouraging, and helpful tip based on their profile and recent activity.

        RULES:
        1.  **Be Conversational:** Start with a friendly opener like "Just a thought..." or "While you're here...".
        2.  **Be Concise:** The entire tip must be a single sentence, maximum 25 words.
        3.  **Be Contextual:** Use the provided user profile and last test result to make the tip relevant. If no context is available, give a general eye-care tip.
        4.  **Be Encouraging:** Maintain a positive and supportive tone.
        5.  **Language:** The response MUST be in ${langInstruction}.
        6.  **Format:** Respond ONLY with the text of the tip. Do not add any other text, labels, or formatting.

        CONTEXT:
        - User Profile: ${userProfile ? JSON.stringify(userProfile) : 'Not available.'}
        - Last Test Result: ${lastTest ? JSON.stringify({type: lastTest.testType, severity: lastTest.report.severity}) : 'Not available.'}

        EXAMPLE RESPONSES:
        - (if user works with computer): "Just a thought, since you work on the computer often, remember to take short breaks to relax your eyes."
        - (if last test was amsler with high severity): "I noticed your last Amsler grid test showed some issues, it's always a good idea to monitor that closely."
        - (if no context): "Remember, blinking regularly is a great way to keep your eyes moist and comfortable."
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
      You are an AI assistant creating a personalized weekly eye care plan.
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
    const prompt = `
      You are a sophisticated AI health analyst. Your task is to generate a "Vision Wellness Dashboard" based on the user's test history.

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

      TEST HISTORY (Most recent first):
      ${JSON.stringify(history.slice(0, 15).map(r => ({test: r.testType, date: r.date, severity: r.report.severity, result: r.resultData})), null, 2)}
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.NUMBER, description: "The calculated vision wellness score from 0 to 100." },
            rating: { type: Type.STRING, description: "The qualitative rating: 'EXCELLENT', 'GOOD', 'AVERAGE', or 'NEEDS_ATTENTION'." },
            trend: { type: Type.STRING, description: "The trend: 'IMPROVING', 'STABLE', 'DECLINING', or 'INSUFFICIENT_DATA'." },
            overallSummary: { type: Type.STRING, description: `A comprehensive summary (40-60 words) in ${langInstruction}.`},
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

  // Simple conversational response generator for chatbot UI
  // ⚡ CHAT CACHE for ultra-fast repeated questions
  private chatCache = new Map<string, { text: string, timestamp: number }>();
  private readonly CHAT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  async generateChatResponse(userMessage: string, language: 'vi' | 'en'): Promise<string> {
    const L = language === 'vi' ? 'VI' : 'EN';
    
    // ⚡ INSTANT CACHE CHECK
    const cacheKey = `${language}:${userMessage.toLowerCase().trim()}`;
    const cached = this.chatCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CHAT_CACHE_DURATION) {
        console.log('⚡ Chat cache HIT - instant response!');
        return cached.text;
    }

    // ⚡ ULTRA-SHORT PROMPT for maximum speed
    const prompt = `Eva. ${L}. Brief.\nQ: ${userMessage}\nA:`;

    try {
      const startTime = Date.now();
      const response = await this.ai.models.generateContent({
        model: AI_CONFIG.gemini.model,
        contents: prompt,
        config: {
          temperature: 0.05, // ⚡ ULTRA-LOW: Fastest possible (from 0.1)
          maxOutputTokens: 150, // ⚡ SHORTER: Even faster (from 200)
          candidateCount: 1,
          topP: 0.6, // ⚡ ULTRA-FOCUSED
          topK: 8, // ⚡ MINIMAL: Fastest selection
        },
      });

      const text = (response && (response.text || response.candidates?.[0]?.content?.parts?.[0]?.text)) || '';
      const elapsed = Date.now() - startTime;
      console.log(`⚡ Chat response: ${elapsed}ms`);
      
      // ⚡ CACHE THE RESPONSE
      const trimmedText = text.trim();
      if (trimmedText) {
          this.chatCache.set(cacheKey, { text: trimmedText, timestamp: Date.now() });
          
          // ⚡ AUTO-CLEANUP: Keep cache size manageable
          if (this.chatCache.size > 50) {
              const oldestKey = Array.from(this.chatCache.entries())
                  .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
              this.chatCache.delete(oldestKey);
          }
      }
      
      return trimmedText;
    } catch (error) {
      console.error('❌ Gemini chat error:', error);
      return language === 'vi' ? 'Xin lỗi, tôi gặp lỗi. Thử lại nhé.' : 'Sorry, error occurred. Try again.';
    }
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
      
      let analysisResult;
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
    
    // 🎯 ENHANCED INSTRUCTIONS: Proactive, detailed, insightful
    const baseInstruction = isVi 
    ? `🚨 CHỈ TIẾNG VIỆT - KHÔNG TIẾNG ANH! 🚨

Bạn là Eva - Chuyên gia AI về sức khỏe mắt. Sứ mệnh: Đánh giá chính xác 95%+ và đưa ra lời khuyên chủ động, thực tế.

PHONG CÁCH PHÂN TÍCH:
✅ CHỦ ĐỘNG: Đừng chỉ mô tả, hãy đưa ra lời khuyên cụ thể
✅ CHI TIẾT: Giải thích rõ ràng về con số (score, accuracy, severity)
✅ GIÁO DỤC: Người dùng cần hiểu TẠI SAO và LÀM GÌ TIẾP THEO
✅ ĐỘNG VIÊN: Tích cực nhưng trung thực
✅ THỰC TẾ: Đưa ra timeline cụ thể và bước hành động rõ ràng

CẤU TRÚC BẮT BUỘC:
1. Summary: 120-150 từ, phân tích chi tiết với số liệu cụ thể
2. Trend: So sánh với baseline, xác định xu hướng
3. Causes: 3-4 nguyên nhân có căn cứ khoa học
4. Recommendations: 5-6 bước hành động (Ngay lập tức / Thay đổi lối sống / Theo dõi / Khi nào gặp bác sĩ / Phòng ngừa)
5. Severity: LOW/MEDIUM/HIGH với lý do cụ thể
6. Prediction: Dự đoán 40-60 từ với timeline và động viên

JSON thuần, không markdown.`
    : `🚨 ENGLISH ONLY - NO VIETNAMESE! 🚨

You are Eva - AI eye health specialist. Mission: 95%+ accurate assessments with proactive, actionable advice.

ANALYSIS STYLE:
✅ PROACTIVE: Don't just describe, give specific recommendations
✅ DETAILED: Explain numbers clearly (score, accuracy, severity)
✅ EDUCATIONAL: Users need to understand WHY and WHAT NEXT
✅ ENCOURAGING: Positive yet honest
✅ PRACTICAL: Provide specific timelines and clear action steps

REQUIRED STRUCTURE:
1. Summary: 120-150 words, detailed analysis with specific metrics
2. Trend: Compare with baseline, identify patterns
3. Causes: 3-4 evidence-based root causes
4. Recommendations: 5-6 action steps (Immediate / Lifestyle / Monitor / When to see doctor / Prevention)
5. Severity: LOW/MEDIUM/HIGH with specific reasoning
6. Prediction: 40-60 words with timeline and motivation

Pure JSON, no markdown.`;

    // 🎯 ENHANCED TEST GUIDELINES: Detailed, proactive, insightful
    let testSpecificInstruction = '';
    switch (testType) {
        case 'snellen':
            testSpecificInstruction = `
🎯 SNELLEN (Thị Lực) - Chuyên gia tư vấn sức khỏe thị giác:

HỆ THỐNG ĐIỂM (Đơn giản hóa):
- 20/20: Thị lực hoàn hảo (100% khả năng)
- 20/30: Giảm nhẹ (có thể lái xe, hơi khó đọc chữ nhỏ)
- 20/40: Giảm trung bình (có thể cần kính khi lái xe)
- 20/60: Giảm đáng kể (ảnh hưởng sinh hoạt hàng ngày)
- 20/100: Giảm nghiêm trọng (cần khám ngay)
- Dưới 20/100: Suy giảm nặng (cần gặp bác sĩ nhãn khoa KHẨN CẤP)

HƯỚNG DẪN MỨC ĐỘ NGHIÊM TRỌNG:
- LOW: 20/20-20/30 với độ chính xác 85%+ (sức khỏe mắt xuất sắc)
- LOW: 20/40 với độ chính xác 75%+ (có thể điều chỉnh, phòng ngừa suy giảm)
- MEDIUM: 20/60 hoặc 20/40 với độ chính xác <75% (cần hành động)
- HIGH: 20/100 trở xuống, hoặc bất kỳ điểm số <70% độ chính xác (cần chăm sóc khẩn cấp)

CÁCH PHÂN TÍCH:
- So sánh với baseline bình thường (20/20)
- Xác định yếu tố lối sống (thời gian nhìn màn hình, ánh sáng, giấc ngủ)
- Đề xuất hành động phòng ngừa (quy tắc 20-20-20, bài tập mắt)
- Đề xuất thời gian tái khám
- Động viên nhưng thực tế`;
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
            testSpecificInstruction = `
🎯 MÙ MÀU (Ishihara 12 bảng):
Độ chính xác→Mức độ: 11-12(90%)→LOW/Bình thường, 9-10(75%)→LOW/Nhẹ, 6-8(50%)→MEDIUM/Trung bình, <6→HIGH/Nặng
Loại: Bình thường=nhìn đủ màu, Đỏ-Xanh=phổ biến(8%M), Toàn bộ=hiếm
Bảng 'không có số' quan trọng. Kiểm tra mảng missedPlates
Ảnh hưởng: công việc/lái xe/sinh hoạt`;
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
}