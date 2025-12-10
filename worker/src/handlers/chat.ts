/**
 * ============================================================
 * 💬 Chat Handler - ENHANCED v3.0 (Context + Safety + Circuit Breaker)
 * ============================================================
 * - KV-based per-user context (last 8 turns)
 * - Content safety heuristics (emergency/self-harm/violence/illegal/sexual)
 * - Circuit breaker around Cloudflare AI to avoid cascading failures
 */

import { IRequest } from 'itty-router'
import { generateWithCloudflareAI } from '../services/gemini'
import { getChatContext, appendChatContext, renderContextAsText } from '../services/chatContext'
import { evaluateContentSafety } from '../services/contentSafety'
import { isBreakerOpen, recordFailure, recordSuccess } from '../services/circuitBreaker'
import { verifyJWT } from './auth'

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
1. ĐỘ DÀI: 120-180 từ, súc tích, dễ hiểu
2. CẤU TRÚC: Đánh giá → Phân tích → Khuyến nghị → Tiên lượng
3. MỨC ĐỘ KHẨN CẤP: 🔴 Khẩn cấp (24-48h) | 🟡 Sớm (1-2 tuần) | 🟢 Định kỳ (1-3 tháng)
4. NGÔN NGỮ: TIẾNG VIỆT THUẦN TÚY 100%, KHÔNG dùng markdown, KHÔNG in đậm, KHÔNG danh sách dài; trả về plain text
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
1. LENGTH: 120-180 words, concise and clear
2. STRUCTURE: Assessment → Analysis → Recommendations → Prognosis
3. URGENCY LEVELS: 🔴 Urgent (24-48h) | 🟡 Soon (1-2 weeks) | 🟢 Routine (1-3 months)
4. LANGUAGE: PURE ENGLISH ONLY 100%, NO markdown, NO bold, NO long bullet lists; plain text only
5. TONE: Professional, empathetic, warm - like a trusted family physician`;
};

function sanitize(input: string): string {
  return (input || '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, 1000);
}

function disclaimer(lang: 'vi' | 'en'): string {
  return lang === 'vi'
    ? 'Lưu ý: Eva là trợ lý AI hỗ trợ sức khỏe mắt và KHÔNG thay thế chẩn đoán của bác sĩ. Nếu có triệu chứng khẩn cấp (mất thị lực đột ngột, đau mắt dữ dội, chấn thương mắt), hãy đến cơ sở y tế gần nhất hoặc gọi cấp cứu.'
    : 'Note: Eva is an AI eye health assistant and does NOT replace professional medical diagnosis. If you have emergency symptoms (sudden vision loss, severe eye pain, eye trauma), seek urgent care or call emergency services.';
}

async function resolveContextId(request: Request, env: any): Promise<{ id: string; source: 'user' | 'ip' }>{
  try {
    const auth = request.headers.get('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (token && env.JWT_SECRET) {
      const decoded: any = await verifyJWT(token, env.JWT_SECRET)
      if (decoded?.userId) {
        return { id: `user:${decoded.userId}`, source: 'user' }
      }
    }
  } catch {}
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'anonymous'
  return { id: `ip:${ip}`, source: 'ip' }
}

export async function chat(
  request: IRequest,
  env: any
): Promise<Response> {
  const req = request as unknown as Request
  try {
    const { message, lastTestResult, language } = (await req.json()) as any

    // Validate input
    if (!message || !language || !['vi', 'en'].includes(language)) {
      return new Response(JSON.stringify({ error: 'Bad request', required: ['message', 'language in vi|en'] }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Content safety
    const safety = evaluateContentSafety(String(message), language)
    if (!safety.allowed) {
      const safeMsg = `${disclaimer(language)}\n\n${safety.message || (language === 'vi' ? 'Nội dung không được phép.' : 'Content not allowed.')}`
      return new Response(JSON.stringify({ message: safeMsg, timestamp: new Date().toISOString(), language }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // Check AI availability
    if (!env.AI) {
      const msg = language === 'vi' ? 'Dịch vụ AI chưa được cấu hình.' : 'AI service not configured.'
      return new Response(JSON.stringify({ message: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    // Circuit breaker
    if (await isBreakerOpen(env.CACHE)) {
      const msg = language === 'vi' ? 'Hệ thống đang bận. Vui lòng thử lại sau ít phút.' : 'System is busy. Please try again in a few minutes.'
      const safeMsg = `${disclaimer(language)}\n\n${msg}`
      return new Response(JSON.stringify({ message: safeMsg, timestamp: new Date().toISOString(), language }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // Resolve context id
    const identity = await resolveContextId(req, env)

    // Context + prompt build
    const ctxTurns = await getChatContext(env.CACHE, identity.id)
    const ctxText = renderContextAsText(ctxTurns, language)
    const sanitized = sanitize(String(message))

    let userPrompt = ''
    if (ctxText) userPrompt += `${ctxText}\n\n---\n`
    userPrompt += sanitized
    if (lastTestResult) userPrompt += `\n\nKết quả test gần nhất: ${JSON.stringify(lastTestResult)}`

    // AI call
    let assistantCore = ''
    try {
      const aiText = await generateWithCloudflareAI(env.AI, userPrompt, getSystemPrompt(language))
      await recordSuccess(env.CACHE)
      assistantCore = aiText
    } catch (e) {
      await recordFailure(env.CACHE)
      const msg = language === 'vi' ? 'Xin lỗi, AI đang bận. Vui lòng thử lại sau.' : 'Sorry, the AI is busy. Please try again later.'
      const safeMsg = `${disclaimer(language)}\n\n${msg}`
      return new Response(JSON.stringify({ message: safeMsg, timestamp: new Date().toISOString(), language }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // Optional medical safety note
    const advisory = safety.message && safety.allowed ? `${safety.message}\n\n` : ''

    const finalMessage = `${advisory}${assistantCore}`

    // Persist context
    try { await appendChatContext(env.CACHE, identity.id, sanitized, assistantCore) } catch {}

    return new Response(
      JSON.stringify({ message: finalMessage, timestamp: new Date().toISOString(), language, model: 'llama-3.1-8b-instruct' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Failed to process chat', message: error?.message || 'UNKNOWN', timestamp: new Date().toISOString() }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
