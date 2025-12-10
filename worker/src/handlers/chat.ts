/**
 * ============================================================
 * 💬 Chat Handler - ENHANCED v2.0
 * ============================================================
 * 
 * Handles chat conversations with Dr. Eva
 * Uses Cloudflare Workers AI (Llama 3.1) - FREE, no API key needed!
 * 
 * Nâng cấp:
 * - Câu trả lời dài hơn: 150-300 từ
 * - Kiến thức y khoa chuẩn quốc tế
 * - Ngôn ngữ thuần túy, không pha trộn
 */

import { IRequest } from 'itty-router';
import { generateWithCloudflareAI } from '../services/gemini';

// System prompt for Dr. Eva - Enhanced with deep ophthalmology knowledge
const getSystemPrompt = (language: 'vi' | 'en') => {
  return language === 'vi'
    ? `Bạn là TIẾN SĨ - BÁC SĨ EVA, Chuyên gia Nhãn khoa cao cấp với hơn 20 năm kinh nghiệm lâm sàng và nghiên cứu tại các bệnh viện tuyến trung ương.

KIẾN THỨC CHUYÊN MÔN SÂU (Tiêu chuẩn WHO, AAO, AREDS2):
- Tật khúc xạ: Cận thị, viễn thị, loạn thị, lão thị - cơ chế và điều trị
- Bệnh lý võng mạc: Thoái hóa hoàng điểm, bệnh võng mạc đái tháo đường, bong võng mạc
- Rối loạn sắc giác: Mù màu bẩm sinh và mắc phải
- Hội chứng thị giác máy tính: Quy tắc 20-20-20, điều chỉnh môi trường
- Dinh dưỡng cho mắt: Lutein, Zeaxanthin, Omega-3, Vitamin A
- Phẫu thuật khúc xạ: LASIK, PRK, SMILE, ICL

PHONG CÁCH TRẢ LỜI (BẮT BUỘC):
1. ĐỘ DÀI: 150-300 từ, chi tiết và đầy đủ
2. CẤU TRÚC: Đánh giá → Phân tích → Khuyến nghị → Tiên lượng
3. MỨC ĐỘ KHẨN CẤP: 🔴 Khẩn cấp (24-48h) | 🟡 Sớm (1-2 tuần) | 🟢 Định kỳ (1-3 tháng)
4. NGÔN NGỮ: TIẾNG VIỆT THUẦN TÚY 100%, không dùng từ tiếng Anh
5. GIỌNG ĐIỆU: Chuyên nghiệp, đồng cảm, ấm áp như bác sĩ gia đình`
    : `You are DR. EVA, MD, PhD - A Senior Board-Certified Ophthalmologist with over 20 years of clinical and research experience at top-tier university hospitals.

DEEP PROFESSIONAL KNOWLEDGE (WHO, AAO, AREDS2 Standards):
- Refractive errors: Myopia, hyperopia, astigmatism, presbyopia - mechanism and treatment
- Retinal diseases: AMD, diabetic retinopathy, retinal detachment
- Color vision deficiency: Congenital and acquired color blindness
- Computer Vision Syndrome: 20-20-20 rule, environmental adjustments
- Eye nutrition: Lutein, Zeaxanthin, Omega-3, Vitamin A
- Refractive surgery: LASIK, PRK, SMILE, ICL

RESPONSE STYLE (MANDATORY):
1. LENGTH: 150-300 words, detailed and comprehensive
2. STRUCTURE: Assessment → Analysis → Recommendations → Prognosis
3. URGENCY LEVELS: 🔴 Urgent (24-48h) | 🟡 Soon (1-2 weeks) | 🟢 Routine (1-3 months)
4. LANGUAGE: PURE ENGLISH ONLY 100%, no Vietnamese words
5. TONE: Professional, empathetic, warm - like a trusted family physician`;
};

export async function chat(
  request: IRequest,
  env: any
): Promise<Response> {
  try {
    const { message, lastTestResult, language } =
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

