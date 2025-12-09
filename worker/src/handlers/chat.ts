/**
 * ============================================================
 * 💬 Chat Handler
 * ============================================================
 * 
 * Handles chat conversations with Dr. Eva
 * Uses Cloudflare Workers AI (Llama 3.1) - FREE, no API key needed!
 */

import { IRequest } from 'itty-router';
import { generateWithCloudflareAI } from '../services/gemini';

// System prompt for Dr. Eva - Enhanced with ophthalmology knowledge
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

export async function chat(
  request: IRequest,
  env: any
): Promise<Response> {
  try {
    const { message, lastTestResult, userProfile, language } =
      (await request.json()) as any;

    // Validate input
    if (!message || !language) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          required: ['message', 'language'],
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['vi', 'en'].includes(language)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid language',
          supported: ['vi', 'en'],
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if Cloudflare AI is available
    if (!env.AI) {
      return new Response(
        JSON.stringify({
          error: 'AI service not configured',
          message: 'Cloudflare Workers AI binding not found',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build user prompt with context
    let userPrompt = message;
    if (lastTestResult) {
      userPrompt += `\n\nKết quả test gần nhất: ${JSON.stringify(lastTestResult)}`;
    }

    // Generate response using Cloudflare AI (Llama 3.1) - FREE!
    const response = await generateWithCloudflareAI(
      env.AI,
      userPrompt,
      getSystemPrompt(language)
    );

    return new Response(
      JSON.stringify({
        message: response,
        timestamp: new Date().toISOString(),
        language,
        model: 'llama-3.1-8b-instruct',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat',
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

