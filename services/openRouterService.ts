/**
 * ============================================================
 * 🤖 OpenRouter Service - Direct API Calls from Frontend
 * ============================================================
 * 
 * Gọi trực tiếp OpenRouter API từ frontend
 * Model: amazon/nova-2-lite-v1:free
 * 
 * ⚠️ API Key được expose trên frontend (đã chấp nhận)
 */

import { AIReport, StoredTestResult, WeeklyRoutine, DashboardInsights, AnswerState } from '../types';
import { getOpenRouterKey, hasOpenRouterKey, ENV_CONFIG } from '../utils/envConfig';

// ⚡ API Configuration
const MODEL = ENV_CONFIG.OPENROUTER_MODEL || 'amazon/nova-2-lite-v1:free';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// System prompts
const getSystemPrompt = (language: 'vi' | 'en') => {
    return language === 'vi'
        ? `Bạn là Bác sĩ Eva - chuyên gia nhãn khoa với 30 năm kinh nghiệm tại Bệnh viện Mắt Trung ương.

KIẾN THỨC CHUYÊN MÔN:
- Các bài test thị lực: Snellen (đo thị lực), Ishihara (mù màu), Amsler Grid (thoái hóa điểm vàng), Astigmatism (loạn thị), Duochrome (cận/viễn thị)
- Các vấn đề mắt phổ biến: Cận thị, viễn thị, loạn thị, lão thị, khô mắt, mỏi mắt số hóa, đục thủy tinh thể, tăng nhãn áp
- Quy tắc 20-20-20: Mỗi 20 phút, nhìn xa 20 feet (6m) trong 20 giây
- Chế độ ăn tốt cho mắt: Vitamin A, Lutein, Omega-3, rau xanh, cà rốt

PHONG CÁCH TRẢ LỜI:
- Thân thiện, dễ hiểu, như đang nói chuyện với bệnh nhân
- Ngắn gọn (50-80 từ) nhưng đầy đủ thông tin quan trọng
- Luôn đưa ra lời khuyên thiết thực
- Nếu triệu chứng nghiêm trọng (đau dữ dội, mất thị lực đột ngột, nhìn đôi), khuyên đi khám ngay
- Sử dụng emoji phù hợp để thân thiện hơn 👁️👓💪

Hãy trả lời bằng tiếng Việt.`
        : `You are Dr. Eva - an ophthalmologist with 30 years of experience at Central Eye Hospital.

PROFESSIONAL KNOWLEDGE:
- Vision tests: Snellen (visual acuity), Ishihara (color blindness), Amsler Grid (macular degeneration), Astigmatism, Duochrome (myopia/hyperopia)
- Common eye issues: Myopia, hyperopia, astigmatism, presbyopia, dry eyes, digital eye strain, cataracts, glaucoma
- 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds
- Eye-healthy diet: Vitamin A, Lutein, Omega-3, leafy greens, carrots

RESPONSE STYLE:
- Friendly, easy to understand, like talking to a patient
- Concise (50-80 words) but with important information
- Always give practical advice
- For serious symptoms (severe pain, sudden vision loss, double vision), advise immediate medical attention
- Use appropriate emojis for friendliness 👁️👓💪

Answer in English.`;
};

const getReportPrompt = (language: 'vi' | 'en') => {
    return language === 'vi'
        ? `Bạn là Bác sĩ Eva - chuyên gia nhãn khoa. Phân tích dữ liệu bài test và tạo báo cáo CHUẨN Y KHOA, NGẮN GỌN, CÓ CẤU TRÚC.

YÊU CẦU NGHIÊM NGẶT:
- Chỉ trả về 1 JSON object hợp lệ theo SCHEMA dưới đây
- Không được kèm text thừa, không markdown, không giải thích
- severity chỉ nhận 1 trong: LOW, MEDIUM, HIGH (nếu testData.severity là NONE thì coi là LOW)
- recommendations phải là MẢNG có ÍT NHẤT 3 mục, ngắn gọn, hành động cụ thể
- Nếu history có kết quả gần đây, hãy so sánh ngắn gọn ở field trend

SCHEMA:
{
  "summary": "Tóm tắt kết quả (100-150 từ)",
  "causes": "Nguyên nhân có thể (50-100 từ)",
  "recommendations": ["Khuyến nghị 1", "Khuyến nghị 2", "Khuyến nghị 3"],
  "severity": "LOW|MEDIUM|HIGH",
  "prediction": "Dự đoán nếu không điều trị (≤ 60 từ)",
  "trend": "Xu hướng so với lịch sử (nếu có)",
  "confidence": 0.85
}

CHỈ TRẢ VỀ JSON hợp lệ.`
        : `You are Dr. Eva - ophthalmology expert. Analyze the test data and produce a STRUCTURED, CLINICALLY SOUND report.

STRICT REQUIREMENTS:
- Return ONLY a valid JSON object (no extra text, no markdown)
- severity MUST be one of: LOW, MEDIUM, HIGH (if testData.severity is NONE, coerce to LOW)
- recommendations MUST be an array with AT LEAST 3 concrete, actionable items
- If history exists, briefly compare in the trend field

SCHEMA:
{
  "summary": "Result summary (100-150 words)",
  "causes": "Possible causes (50-100 words)",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "severity": "LOW|MEDIUM|HIGH",
  "prediction": "Prediction if untreated (≤ 60 words)",
  "trend": "Trend compared to history (if available)",
  "confidence": 0.85
}

RETURN ONLY VALID JSON.`;
};

// Generic API call helper
async function callOpenRouter(
    systemPrompt: string,
    userMessage: string,
    options: { maxTokens?: number; temperature?: number; forceJson?: boolean; seed?: number; retries?: number } = {}
): Promise<string> {
    const { maxTokens = 1024, temperature = ENV_CONFIG.OPENROUTER_TEMPERATURE ?? 0.3, seed = 42, retries = 0 } = options;

    let apiKey: string;
    try {
        apiKey = getOpenRouterKey();
    } catch (error) {
        console.error('❌ OpenRouter API key not found in environment');
        throw error;
    }

    console.log(`🤖 Calling OpenRouter API...`);
    console.log(`   Model: ${MODEL}`);
    console.log(`   API Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`);

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Vision Coach - Eye Health App',
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            max_tokens: maxTokens,
            temperature,
            top_p: 0.1,
            frequency_penalty: 0,
            presence_penalty: 0,
            seed,
            ...(options.forceJson ? { response_format: { type: 'json_object' } } : {}),
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('❌ OpenRouter API error:', error);
        throw new Error((error as any)?.error?.message || `OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    let content: any = data.choices?.[0]?.message?.content ?? '';

    // Some providers return content as an array of parts
    if (Array.isArray(content)) {
        try {
            content = content.map((p: any) => p?.text ?? p?.content ?? '').join('');
        } catch {
            content = String(content);
        }
    }
    content = typeof content === 'string' ? content : JSON.stringify(content);

    console.log(`✅ OpenRouter response received (${content.length} chars)`);
    console.log(`   Raw response preview:`, content.slice(0, 200));

    // Retry once if content is empty
    if (!content || String(content).trim().length === 0) {
        if (retries < 2) {
            console.warn('⚠️ Empty content from model, retrying with safer params...');
            return await callOpenRouter(systemPrompt, userMessage, {
                ...options,
                temperature: Math.max(0.1, (options.temperature ?? ENV_CONFIG.OPENROUTER_TEMPERATURE ?? 0.3) - 0.1),
                seed: (seed ?? 42) + 1,
                retries: retries + 1,
            });
        }
    }

    return content as string;
}

// Parse JSON from AI response (handles markdown code blocks and DeepSeek thinking)
function wordCount(text: string): number {
    return (text || '').trim().split(/\s+/).filter(Boolean).length;
}

function parseJsonResponse<T>(text: string): T {
    let cleaned = text.trim();

    // DeepSeek models often include <think>...</think> tags - remove them
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // Try to find JSON in the response - look for first { and last }
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
    } else {
        // Try array format
        const arrStart = cleaned.indexOf('[');
        const arrEnd = cleaned.lastIndexOf(']');
        if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
            cleaned = cleaned.slice(arrStart, arrEnd + 1);
        }
    }

    // Remove markdown code blocks if still present
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    return JSON.parse(cleaned) as T;
}

/**
 * 💬 Chat with Dr. Eva
 */
export async function openRouterChat(
    message: string,
    context: StoredTestResult | null,
    userProfile: AnswerState | null,
    language: 'vi' | 'en'
): Promise<string> {
    let userMessage = message;

    if (context) {
        const contextInfo = language === 'vi'
            ? `\n\n[Kết quả test gần nhất: ${context.testType}, ngày ${context.date}, mức độ: ${context.report?.severity || 'N/A'}]`
            : `\n\n[Latest test: ${context.testType}, date ${context.date}, severity: ${context.report?.severity || 'N/A'}]`;
        userMessage += contextInfo;
    }

    const response = await callOpenRouter(getSystemPrompt(language), userMessage, {
        maxTokens: 512,
        temperature: 0.7,
    });

    return response || (language === 'vi'
        ? 'Xin lỗi, tôi không thể trả lời lúc này.'
        : 'Sorry, I cannot respond at this time.');
}

/**
 * 📋 Generate AI Report
 */
export async function openRouterReport(
    testType: string,
    testData: any,
    history: StoredTestResult[],
    language: 'vi' | 'en'
): Promise<AIReport> {
    const normalizedTest = { ...testData, severity: testData?.severity === 'NONE' ? 'LOW' : testData?.severity } as any;
    const historyBrief = history.slice(0, 5).map(h => ({ type: h.testType, date: h.date, severity: h.report?.severity }));
    const userMessage = language === 'vi'
        ? `Phân tích kết quả test ${testType}:
Dữ liệu test: ${JSON.stringify(normalizedTest)}
Lịch sử (${history.length} tests gần đây): ${JSON.stringify(history.slice(0, 5).map(h => ({
            type: h.testType,
            date: h.date,
            severity: h.report?.severity
        })))}`
        : `Analyze ${testType} test results:
Test data: ${JSON.stringify(testData)}
History (${history.length} recent tests): ${JSON.stringify(history.slice(0, 5).map(h => ({
            type: h.testType,
            date: h.date,
            severity: h.report?.severity
        })))}`;

    const response = await callOpenRouter(getReportPrompt(language), userMessage, {
        maxTokens: 1024,
        temperature: 0.5,
        forceJson: true,
    });

    try {
        const parsed = parseJsonResponse<any>(response);
        return {
            id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            testType: testType as any,
            timestamp: new Date().toISOString(),
            totalResponseTime: 0,
            confidence: (parsed.confidence || 0.85) * 100,
            summary: parsed.summary || '',
            causes: parsed.causes || '',
            recommendations: parsed.recommendations || [],
            severity: parsed.severity || 'LOW',
            prediction: parsed.prediction || '',
            trend: parsed.trend || '',
        };
    } catch (e) {
        console.error('Failed to parse report JSON:', e);
        // Fallback: return text as summary
        return {
            id: `report_${Date.now()}`,
            testType: testType as any,
            timestamp: new Date().toISOString(),
            totalResponseTime: 0,
            confidence: 75,
            summary: response,
            causes: '',
            recommendations: [],
            severity: 'LOW',
            prediction: '',
            trend: '',
        };
    }
}

/**
 * 📊 Generate Dashboard Insights
 */
export async function openRouterDashboard(
    history: StoredTestResult[],
    language: 'vi' | 'en'
): Promise<DashboardInsights> {
    const systemPrompt = language === 'vi'
        ? `Phân tích lịch sử test mắt và tạo insights. Trả về JSON:
{
  "score": 75,
  "rating": "GOOD|EXCELLENT|AVERAGE|NEEDS_ATTENTION",
  "trend": "IMPROVING|STABLE|DECLINING|INSUFFICIENT_DATA",
  "overallSummary": "Tóm tắt sức khỏe mắt (50 từ)",
  "positives": ["Điểm tích cực 1", "Điểm tích cực 2"],
  "areasToMonitor": ["Vấn đề cần theo dõi 1"],
  "proTip": "Mẹo chuyên gia"
}
CHỈ TRẢ VỀ JSON.`
        : `Analyze eye test history and create insights. Return JSON:
{
  "score": 75,
  "rating": "GOOD|EXCELLENT|AVERAGE|NEEDS_ATTENTION",
  "trend": "IMPROVING|STABLE|DECLINING|INSUFFICIENT_DATA",
  "overallSummary": "Eye health summary (50 words)",
  "positives": ["Positive 1", "Positive 2"],
  "areasToMonitor": ["Area to monitor 1"],
  "proTip": "Expert tip"
}
RETURN ONLY JSON.`;

    const userMessage = `Test history: ${JSON.stringify(history.slice(0, 10).map(h => ({
        type: h.testType,
        date: h.date,
        severity: h.report?.severity
    })))}`;

    const response = await callOpenRouter(systemPrompt, userMessage, {
        maxTokens: 512,
        temperature: 0.5,
        forceJson: true,
    });

    try {
        return parseJsonResponse<DashboardInsights>(response);
    } catch (e) {
        console.error('Failed to parse dashboard JSON:', e);
        return {
            score: 70,
            rating: 'AVERAGE',
            trend: 'INSUFFICIENT_DATA',
            overallSummary: response || (language === 'vi' ? 'Chưa đủ dữ liệu để phân tích' : 'Not enough data for analysis'),
            positives: [],
            areasToMonitor: [],
            proTip: language === 'vi' ? 'Hãy làm thêm bài test để có đánh giá chính xác hơn' : 'Complete more tests for accurate assessment',
        };
    }
}

/**
 * 📅 Generate Weekly Routine
 */
export async function openRouterRoutine(
    answers: { worksWithComputer: string; wearsGlasses: string; goal: string },
    language: 'vi' | 'en'
): Promise<WeeklyRoutine> {
    const systemPrompt = language === 'vi'
        ? `Tạo lịch tập mắt hàng tuần. Trả về JSON với format:
{
  "Monday": [{"type": "test|exercise", "key": "snellen", "name": "Tên", "duration": 3}],
  "Tuesday": [...],
  "Wednesday": [...],
  "Thursday": [...],
  "Friday": [...],
  "Saturday": [],
  "Sunday": []
}
Tests: snellen, colorblind, astigmatism, amsler, duochrome
Exercises: exercise_20_20_20, exercise_palming, exercise_focus_change
CHỈ TRẢ VỀ JSON.`
        : `Create weekly eye exercise routine. Return JSON:
{
  "Monday": [{"type": "test|exercise", "key": "snellen", "name": "Name", "duration": 3}],
  ...
}
RETURN ONLY JSON.`;

    const userMessage = `User profile: ${JSON.stringify(answers)}`;

    const response = await callOpenRouter(systemPrompt, userMessage, {
        maxTokens: 1024,
        temperature: 0.6,
    });

    try {
        return parseJsonResponse<WeeklyRoutine>(response);
    } catch (e) {
        console.error('Failed to parse routine JSON:', e);
        // Return default routine
        return getDefaultRoutine(language);
    }
}

/**
 * 💡 Generate Proactive Tip
 */
export async function openRouterProactiveTip(
    lastTest: StoredTestResult | null,
    userProfile: AnswerState | null,
    language: 'vi' | 'en'
): Promise<string | null> {
    const systemPrompt = language === 'vi'
        ? 'Đưa ra 1 mẹo hữu ích ngắn gọn (20-30 từ) về chăm sóc mắt. Thân thiện, có emoji.'
        : 'Give 1 short helpful tip (20-30 words) about eye care. Friendly, with emoji.';

    const userMessage = lastTest
        ? `Last test: ${lastTest.testType}, severity: ${lastTest.report?.severity || 'N/A'}`
        : 'No recent tests';

    try {
        const response = await callOpenRouter(systemPrompt, userMessage, {
            maxTokens: 100,
            temperature: 0.8,
        });
        return response || null;
    } catch {
        return null;
    }
}

// Default routine fallback
function getDefaultRoutine(language: 'vi' | 'en'): WeeklyRoutine {
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

// Export for checking API key availability (re-export from envConfig)
export { hasOpenRouterKey } from '../utils/envConfig';
