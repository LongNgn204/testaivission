import { logger } from './loggingService';
import { AIReport, StoredTestResult, TestType, WeeklyRoutine, DashboardInsights, AnswerState } from '../types';

// Lưu ý: Để giảm initial JS, SDK @google/genai được import động trong ensureAI()
// Các schema dùng kiểu chuỗi thuần thay vì hằng số Type để không cần import sớm.

// ⚡ ULTRA-FAST AI CONFIGURATION - OPTIMIZED FOR SPEED & POWER
const AI_CONFIG = {
  gemini: {
    models: {
      pro: (import.meta as any).env?.VITE_GEMINI_MODEL_PRO || 'gemini-2.5-pro',
      flash: (import.meta as any).env?.VITE_GEMINI_MODEL_FLASH || 'gemini-2.5-flash',
    },
    temperature: 0.2,
    maxTokens: 2048,
    topP: 0.8,
    topK: 30,
  },
  tts: {
    cacheDuration: 60 * 60 * 1000,
    maxCacheSize: 500,
    voice: { vi: 'vi-VN', en: 'en-US' },
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  },
  streaming: { enabled: true, bufferSize: 128 },
};

const E2E_MODE = (import.meta as any).env?.VITE_E2E_MODE === 'true';

// Determine if we're in production (Cloudflare Pages)
const IS_PRODUCTION = typeof window !== 'undefined' && 
  (window.location.hostname.includes('pages.dev') || 
   window.location.hostname.includes('cloudflare') ||
   (import.meta as any).env?.VITE_USE_PROXY === 'true');

export class AIService {
  private ai: any | null = null; // GoogleGenAI instance (dynamic)
  private voicesLoaded = false;
  private readonly geminiApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
  private enabled = true;
  private useProxy = IS_PRODUCTION;

  constructor() {
    // In production, we use Cloudflare Pages Functions proxy
    // In development, we use direct API calls
    if (this.useProxy) {
      console.log('🔐 Using Cloudflare Pages Functions proxy for AI');
      this.enabled = true; // Always enabled when using proxy
    } else {
      if (!this.geminiApiKey) {
        console.warn('Gemini API key missing. AI features are disabled.');
        this.enabled = false;
      }
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.voicesLoaded = true;
        console.log('🎙️ TTS Voices loaded:', window.speechSynthesis.getVoices().length);
      };
      window.speechSynthesis.getVoices();
    }
  }

  private async ensureAI() {
    if (!this.enabled) return;
    if (this.useProxy) return; // No need to import SDK when using proxy
    if (this.ai) return;
    try {
      const mod: any = await import('@google/genai');
      const GoogleGenAI = mod.GoogleGenAI || (mod as any).default?.GoogleGenAI || mod;
      this.ai = new GoogleGenAI({ apiKey: this.geminiApiKey });
    } catch (error) {
      const err = this.toError(error);
      logger.error('Failed to dynamically import @google/genai', err);
      this.enabled = false;
    }
  }

  private getModel(kind: 'pro' | 'flash'): string {
    const m = AI_CONFIG.gemini.models;
    return kind === 'flash' ? (m.flash || m.pro) : (m.pro || m.flash);
  }

  private async callGeminiAPI(model: string, contents: string, config: any = {}) {
    if (this.useProxy) {
      // Use Cloudflare Pages Functions proxy
      const response = await fetch('/api/generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, contents, config }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `API error: ${response.status}`);
      }

      return await response.json();
    } else {
      // Direct API call (development)
      if (!this.ai) throw new Error('AI not initialized');
      return await this.ai.models.generateContent({
        model,
        contents,
        config,
      });
    }
  }

  private async callGeminiStreamAPI(model: string, contents: string, config: any = {}) {
    if (this.useProxy) {
      // Use Cloudflare Pages Functions proxy with streaming
      const response = await fetch('/api/generateContentStream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, contents, config }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `API error: ${response.status}`);
      }

      return response.body?.getReader();
    } else {
      // Direct streaming (development)
      if (!this.ai) throw new Error('AI not initialized');
      return await this.ai.models.generateContentStream({
        model,
        contents,
        config,
      });
    }
  }

  // ==== Utilities ====
  private toError(error: unknown): Error {
    if (error instanceof Error) return error;
    if (typeof error === 'string') return new Error(error);
    try { return new Error(JSON.stringify(error)); } catch { return new Error('Unknown error'); }
  }

  private getErrorContext(error: unknown): Record<string, unknown> {
    if (!error || typeof error !== 'object') return {};
    const errObj = error as Record<string, any>;
    return {
      status: errObj.status ?? errObj.statusCode ?? errObj.response?.status,
      statusText: errObj.statusText ?? errObj.response?.statusText,
      cause: errObj.cause,
      data: errObj.response?.data ?? errObj.response?.body,
    };
  }

  // ==== TTS Cache ====
  private utteranceCache = new Map<string, { utterance: SpeechSynthesisUtterance; timestamp: number; hits: number }>();

  private async waitForVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) return resolve(voices);
      window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices());
    });
  }

  // ==== TTS ====
  async generateSpeech(text: string, language: 'vi' | 'en'): Promise<string | null> {
    try {
      if (!('speechSynthesis' in window)) {
        logger.warn('Web Speech API not supported for speech synthesis', { feature: 'speechSynthesis' });
        return null;
      }

      const cacheKey = `${language}:${text}`;
      const cached = this.utteranceCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < AI_CONFIG.tts.cacheDuration) {
        cached.hits++;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(cached.utterance);
        return cacheKey;
      }

      const voices = await this.waitForVoices();
      let selectedVoice: SpeechSynthesisVoice | null = null;
      selectedVoice = voices.find(v => v.lang === (language === 'vi' ? 'vi-VN' : 'en-US') && v.name.includes('Google'))
        || voices.find(v => v.lang === (language === 'vi' ? 'vi-VN' : 'en-US'))
        || null;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = AI_CONFIG.tts.voice[language];
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = AI_CONFIG.tts.rate;
      utterance.pitch = AI_CONFIG.tts.pitch;
      utterance.volume = AI_CONFIG.tts.volume;

      this.utteranceCache.set(cacheKey, { utterance, timestamp: Date.now(), hits: 0 });
      if (this.utteranceCache.size > AI_CONFIG.tts.maxCacheSize) {
        let lruKey = '';
        let oldest = Infinity;
        for (const [k, v] of this.utteranceCache) {
          if (v.timestamp < oldest) { oldest = v.timestamp; lruKey = k; }
        }
        if (lruKey) this.utteranceCache.delete(lruKey);
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      return cacheKey;
    } catch (error) {
      const err = this.toError(error);
      logger.error(`Failed to generate speech`, err, this.getErrorContext(error));
      return null;
    }
  }

  // ==== AI Helpers ====
  private createResponseSchema(language: 'vi' | 'en') {
    return {
      type: 'object',
      properties: {
        confidence: { type: 'number' },
        summary: { type: 'string' },
        trend: { type: 'string' },
        causes: { type: 'string' },
        recommendations: { type: 'array', items: { type: 'string' } },
        severity: { type: 'string' },
        prediction: { type: 'string' },
      },
      required: ['confidence', 'summary', 'trend', 'recommendations', 'severity', 'causes', 'prediction'],
    } as const;
  }

  private createRoutineSchema() {
    const activity = { type: 'object', properties: { type: { type: 'string' }, key: { type: 'string' }, name: { type: 'string' }, duration: { type: 'number' } }, required: ['type', 'key', 'name', 'duration'] };
    return {
      type: 'object',
      properties: {
        Monday: { type: 'array', items: activity },
        Tuesday: { type: 'array', items: activity },
        Wednesday: { type: 'array', items: activity },
        Thursday: { type: 'array', items: activity },
        Friday: { type: 'array', items: activity },
        Saturday: { type: 'array', items: activity },
        Sunday: { type: 'array', items: activity },
      },
      required: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    } as const;
  }

  async generateProactiveTip(lastTest: StoredTestResult | null, userProfile: AnswerState | null, language: 'vi' | 'en'): Promise<string | null> {
    if (!this.enabled) return null;
    await this.ensureAI();

    const langInstruction = language === 'vi' ? 'VIETNAMESE' : 'ENGLISH';
    const prompt = `You are Eva, a friendly AI vision coach. Offer ONE short, encouraging, helpful tip (max 25 words) in ${langInstruction} based on context. Respond ONLY with the tip.\n\nCONTEXT:\n- User Profile: ${userProfile ? JSON.stringify(userProfile) : 'Not available.'}\n- Last Test: ${lastTest ? JSON.stringify({ type: lastTest.testType, severity: lastTest.report.severity }) : 'Not available.'}`;

    try {
      const response = await this.callGeminiAPI(this.getModel('flash'), prompt, {
        temperature: 0.6,
        maxOutputTokens: 100,
      });
      return response.text?.trim() || null;
    } catch (error) {
      const err = this.toError(error);
      logger.error('Gemini proactive tip error', err, this.getErrorContext(error));
      return null;
    }
  }

  async generatePersonalizedRoutine(answers: { worksWithComputer: string; wearsGlasses: string; goal: string }, language: 'vi' | 'en'): Promise<WeeklyRoutine> {
    if (!this.enabled) return this.getDefaultRoutine(language);
    await this.ensureAI();

    const langInstruction = language === 'vi' ? 'VIETNAMESE' : 'ENGLISH';
    const prompt = `AI, create a personalized 7-day eye care plan based on profile. Mon-Fri: 1 test & 1 exercise. Sat-Sun: rest ([]). Names in ${langInstruction}. Keys: 'snellen','colorblind','astigmatism','amsler','duochrome' tests; 'exercise_20_20_20','exercise_palming','exercise_focus_change' exercises. Respond ONLY valid JSON.`;

    const responseSchema = this.createRoutineSchema();

    return this.withRetry(async () => {
      logger.info('Generating personalized routine...', { answers });
      const response = await this.callGeminiAPI(this.getModel('pro'), `${prompt}\nUSER PROFILE:\n${JSON.stringify(answers)}`, {
        temperature: 0.5,
        maxOutputTokens: AI_CONFIG.gemini.maxTokens,
        responseMimeType: 'application/json',
        responseSchema,
      });
      const routine = JSON.parse(response.text.trim());
      logger.info('Generated routine');
      return routine;
    }).catch((error) => {
      logger.error('Routine generation failed, fallback to default', error as Error, { answers });
      return this.getDefaultRoutine(language);
    });
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
    if (!this.enabled) {
      // Fallback very light insights when AI disabled
      return { score: 70, rating: 'GOOD', trend: history.length >= 3 ? 'STABLE' : 'INSUFFICIENT_DATA', overallSummary: language === 'vi' ? 'Chưa bật AI. Điểm mặc định tham khảo.' : 'AI disabled. Showing placeholder insights.', positives: [], areasToMonitor: [], proTip: language === 'vi' ? 'Bật AI để nhận phân tích chi tiết.' : 'Enable AI for detailed insights.' } as DashboardInsights;
    }
    await this.ensureAI();

    const langInstruction = language === 'vi' ? 'VIETNAMESE' : 'ENGLISH';
    const prompt = `AI Health Analyst, generate a "Vision Wellness Dashboard" JSON in ${langInstruction}. Follow constraints, respond ONLY valid JSON.`;
    const responseSchema = {
      type: 'object',
      properties: {
        score: { type: 'number' },
        rating: { type: 'string' },
        trend: { type: 'string' },
        overallSummary: { type: 'string' },
        positives: { type: 'array', items: { type: 'string' } },
        areasToMonitor: { type: 'array', items: { type: 'string' } },
        proTip: { type: 'string' },
      },
      required: ['score', 'rating', 'trend', 'overallSummary', 'positives', 'areasToMonitor', 'proTip'],
    } as const;

    return this.withRetry(async () => {
      logger.info('Generating dashboard insights...', { historyCount: history.length });
      const response = await this.callGeminiAPI(this.getModel('pro'), `${prompt}\nTEST HISTORY (latest first, max 15):\n${JSON.stringify(history.slice(0, 15).map(r => ({ test: r.testType, date: r.date, severity: r.report.severity })), null, 2)}`, {
        temperature: 0.2,
        maxOutputTokens: AI_CONFIG.gemini.maxTokens,
        responseMimeType: 'application/json',
        responseSchema,
      });
      const result = JSON.parse(response.text.trim());
      logger.info('Dashboard insights generated', { score: result.score, trend: result.trend });
      return result;
    });
  }

  // ==== Chat streaming ====
  private lastChatAt = 0;
  private minChatIntervalMs = 800;
  private chatInFlight = false;

  async generateChatResponse(userMessage: string, language: 'vi' | 'en', onUpdate: (chunk: string) => void): Promise<void> {
    if (!this.enabled) {
      onUpdate(language === 'vi' ? 'AI đang tắt. Vui lòng thêm API key.' : 'AI disabled. Please add API key.');
      return;
    }
    await this.ensureAI();

    const now = Date.now();
    if (this.chatInFlight) {
      onUpdate(language === 'vi' ? '⏳ Đang xử lý câu trước...' : '⏳ Processing previous message...');
      return;
    }
    if (now - this.lastChatAt < this.minChatIntervalMs) {
      onUpdate(language === 'vi' ? '⏱️ Vui lòng đợi một chút rồi thử lại.' : '⏱️ Please wait a moment and try again.');
      return;
    }
    this.chatInFlight = true;

    const prompt = `As Eva (a friendly AI eye doctor), give a brief, helpful answer in ${language === 'vi' ? 'VIETNAMESE' : 'ENGLISH'} to the user's question. Question: "${userMessage}"`;

    try {
      if (this.useProxy) {
        // Use proxy streaming
        const reader = await this.callGeminiStreamAPI(this.getModel('flash'), prompt, {
          temperature: 0.1,
          maxOutputTokens: 150,
        });

        if (reader) {
          const decoder = new TextDecoder();
          let done = false;
          while (!done) {
            const { value, done: streamDone } = await reader.read();
            done = streamDone;
            if (value) {
              const chunk = decoder.decode(value);
              // Parse streaming response
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) onUpdate(text);
                  } catch (e) {
                    // Ignore parse errors
                  }
                }
              }
            }
          }
        }
      } else {
        // Direct streaming
        const stream = await this.ai.models.generateContentStream({
          model: this.getModel('flash'),
          contents: prompt,
          config: { temperature: 0.1, maxOutputTokens: 150 },
        });

        for await (const chunk of stream) {
          const chunkText = (chunk as any).text;
          if (chunkText) onUpdate(chunkText);
        }
      }
    } catch (error) {
      const err = this.toError(error);
      logger.error('Gemini chat streaming error', err, this.getErrorContext(error));
      onUpdate(language === 'vi' ? 'Xin lỗi, tôi gặp lỗi. Thử lại nhé.' : 'Sorry, an error occurred. Please try again.');
    } finally {
      this.chatInFlight = false;
      this.lastChatAt = Date.now();
    }
  }

  // ==== Retry helper ====
  private async withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i < retries; i++) {
      try { return await fn(); } catch (error: any) {
        lastError = error;
        if (i < retries - 1) {
          logger.warn(`API call failed. Retrying in ${delay}ms...`, { attempt: i + 1, maxRetries: retries, error: error.message });
          await new Promise(res => setTimeout(res, delay));
          delay *= 2;
        }
      }
    }
    logger.error('API call failed after all retries.', lastError as Error, { function: fn.name });
    throw lastError;
  }

  // ==== Report generation ====
  private createPrompt(testType: TestType, data: any, history: StoredTestResult[], language: 'vi' | 'en'): string {
    const isVi = language === 'vi';
    const baseInstruction = isVi
      ? 'BẠN LÀ BÁC SĨ EVA - CHUYÊN GIA NHÃN KHOA. Phân tích dữ liệu test, đưa ra chẩn đoán chi tiết, chuyên nghiệp bằng TIẾNG VIỆT theo JSON.'
      : 'YOU ARE DR. EVA - OPHTHALMOLOGY EXPERT. Analyze the test data and provide a detailed, professional diagnosis in ENGLISH using JSON.';

    const guidelines: Record<TestType, string> = {
      snellen: isVi ? 'Snellen: Đánh giá thị lực (20/20 là chuẩn)...' : 'Snellen: Assess visual acuity (20/20 is standard)...',
      colorblind: isVi ? 'Ishihara: Đánh giá mù màu...' : 'Ishihara: Assess color blindness...',
      amsler: isVi ? 'Amsler: Sàng lọc bệnh lý hoàng điểm...' : 'Amsler: Screen for macular disease...',
      astigmatism: isVi ? 'Astigmatism: Kiểm tra loạn thị...' : 'Astigmatism: Check for astigmatism...',
      duochrome: isVi ? 'Duochrome: Kiểm tra độ chính xác của kính...' : 'Duochrome: Check prescription accuracy...',
    } as any;

    const relevant = history.filter(h => h.testType === testType).slice(0, 3).map(h => ({ date: h.date, result: h.resultData, severity: h.report.severity }));

    return `${baseInstruction}\n\nGUIDELINE FOR ${String(testType).toUpperCase()}:\n${guidelines[testType]}\n\nHISTORY:\n${relevant.length ? JSON.stringify(relevant, null, 2) : 'No relevant history.'}\n\nDATA:\n${JSON.stringify(data, null, 2)}`;
  }

  async generateReport(testType: TestType, testData: any, history: StoredTestResult[], language: 'vi' | 'en'): Promise<AIReport> {
    if (!this.enabled) throw new Error('AI disabled');
    await this.ensureAI();

    const startTime = Date.now();
    const prompt = this.createPrompt(testType, testData, history, language);
    const responseSchema = this.createResponseSchema(language);

    return this.withRetry(async () => {
      const response = await this.callGeminiAPI(this.getModel('pro'), prompt, {
        temperature: AI_CONFIG.gemini.temperature,
        maxOutputTokens: AI_CONFIG.gemini.maxTokens,
        responseMimeType: 'application/json',
        responseSchema,
      });

      const text = response?.text;
      if (!text) {
        const blockReason = (response as any)?.candidates?.[0]?.finishReason;
        throw new Error(`Gemini returned no content. Reason: ${blockReason || 'Unknown'}`);
      }

      const analysis = JSON.parse(text);
      const report: AIReport = {
        id: `report_${Date.now()}`,
        testType,
        timestamp: new Date().toISOString(),
        totalResponseTime: Date.now() - startTime,
        confidence: parseFloat((analysis.confidence * 100).toFixed(2)),
        summary: analysis.summary,
        causes: analysis.causes,
        recommendations: analysis.recommendations,
        severity: analysis.severity,
        prediction: analysis.prediction,
        trend: analysis.trend,
      } as AIReport;

      logger.info(`Report generated for ${testType}`, { severity: report.severity, confidence: report.confidence });
      return report;
    });
  }
}
