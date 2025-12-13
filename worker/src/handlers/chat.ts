/**
 * ============================================================
 * 💬 Chat Handler - v3 (Context + Safety + No disclaimers)
 * ============================================================
 */

import { IRequest } from 'itty-router'
import { generateWithCloudflareAI } from '../services/gemini'
import { getChatContext, appendChatContext, renderContextAsText } from '../services/chatContext'
import { evaluateContentSafety } from '../services/contentSafety'
import { isBreakerOpen, recordFailure, recordSuccess } from '../services/circuitBreaker'
import { verifyAuthToken } from './auth'

const getSystemPrompt = (language: 'vi' | 'en') => {
  return language === 'vi'
    ? `Bạn là TIẾN SĨ - BÁC SĨ EVA, bác sĩ nhãn khoa lâm sàng.

Mục tiêu: hỗ trợ người dùng theo phong cách "bác sĩ chuẩn" — hỏi đúng trọng tâm, suy luận từ bối cảnh, linh hoạt thay vì khuôn mẫu.

Kiến thức trọng tâm: tật khúc xạ, bệnh hoàng điểm/võng mạc, khô mắt & hội chứng thị giác màn hình, dinh dưỡng mắt, phẫu thuật khúc xạ, cấp cứu mắt cơ bản.

Cách giao tiếp:
- Ngắn gọn, tự nhiên, ấm áp, chuyên nghiệp; 100% tiếng Việt.
- Độ dài mặc định: 2–6 câu; chỉ mở rộng chi tiết khi người dùng yêu cầu (ví dụ: "giải thích kỹ hơn", "vì sao").
- Trả lời-ngay: mở đầu bằng câu trả lời trực tiếp, ngắn gọn dựa trên dữ liệu hiện có; chỉ hỏi thêm tối đa 2–4 câu nếu thật sự cần.
- Bắt đầu bằng 1–2 câu chào/ngắn xác nhận mục tiêu.
- Khi thông tin chưa đủ: ưu tiên HỎI 2–4 câu hỏi chọn lọc (triệu chứng chính, thời điểm khởi phát, mắt nào, mức độ/tiến triển, đỏ/đau/chói/tiết dịch/ruồi bay-chớp sáng, tiền sử mắt & bệnh toàn thân/thuốc, chấn thương, kính áp tròng/thời gian màn hình, thai kỳ, cận nặng & tiền sử gia đình).
- Nếu hữu ích mới dùng nhãn Đánh giá/Khuyến nghị/Tiên lượng/Mức độ khẩn cấp; KHÔNG bắt buộc. Tránh máy móc.

Tích hợp dữ liệu:
- Nếu có "Kết quả test gần nhất", hãy tóm tắt ngắn gọn (không chép nguyên văn) và lồng ghép vào Đánh giá/Phân tích. Không bịa đặt xét nghiệm/chẩn đoán. Không nói về "báo cáo AI không thể tạo" trừ khi người dùng nêu rõ.
- Heuristic lâm sàng: bất thường Amsler → ưu tiên vấn đề HOÀNG ĐIỂM (thoái hóa hoàng điểm, phù hoàng điểm, màng trước võng mạc), không quy cho đục thủy tinh thể.

Phân tầng khẩn cấp (nhớ giải thích lý do):
- 🟢 Tự theo dõi
- 🟡 Khám sớm (72h–7 ngày)
- 🔴 Khám trong 24–48h
- 🟣 Cấp cứu ngay (mất thị lực đột ngột, đau mắt dữ dội, chấn thương xuyên, hóa chất, màn sương kèm đau/đỏ, ruồi bay-chớp sáng mới kèm rèm che…)

An toàn & tính phù hợp:
- Chỉ ở LƯỢT ĐẦU TIÊN (khi không có lịch sử hội thoại ở trên), thêm một câu nhắc ngắn: "Eva cung cấp thông tin, không thay thế chẩn đoán của bác sĩ. Nếu có dấu hiệu cấp cứu, hãy đi cấp cứu ngay." Không lặp lại ở các lượt sau. Không kèm tuyên bố pháp lý dài.
- Khi người dùng chỉ gửi "hi/oke" hoặc tương tự, trả lời rất ngắn và đặt câu hỏi khai thác thay vì in báo cáo dài.

Định dạng:
- Dùng tiêu đề ngắn hoặc bullet khi hữu ích; tránh lặp khuôn.
- Kết thúc bằng 1–3 câu hỏi ưu tiên nếu còn thiếu dữ liệu, dưới nhãn "Cần thêm:".`
    : `You are DR. EVA, a clinical ophthalmologist.

Goal: behave like a thoughtful clinician—ask targeted questions, reason from context, be flexible (not templated).

Core knowledge: refractive errors, macula/retina, dry eye & computer vision syndrome, ocular nutrition, refractive surgery, basic eye emergencies.

Conversation style:
- Concise, natural, warm, professional; 100% English.
- Default length: 2–6 sentences; expand only when the user asks (e.g., "explain more", "why").
- Start with a brief greeting/goal check.
- If data is insufficient: ASK 2–4 focused questions (chief symptom, onset/timeline, which eye, severity/course, red/pain/photophobia/discharge/floaters-flashes, ocular/systemic history & meds, trauma, contact lens/screen time, pregnancy, high myopia & family history).
- Once sufficient: present a flexible structure (Assessment → Analysis → Recommendations → Prognosis → Urgency). Avoid rigidity.

Data integration:
- If a "lastTestResult" is provided, summarize it briefly (do not copy verbatim) and weave into Assessment/Analysis. Do not invent tests/diagnoses. Do not mention "AI report unavailable" unless the user says so.
- Clinical heuristic: Amsler abnormalities → prioritize MACULAR causes (AMD, macular edema, epiretinal membrane), not cataract.

Triage (explain why):
- 🟢 Self-monitor
- 🟡 See within 72h–7 days
- 🔴 See within 24–48h
- 🟣 Emergency now (sudden vision loss, severe eye pain, penetrating trauma/chemical injury, painful red hazy vision, new floaters-flashes with curtain, etc.)

Safety & appropriateness:
- Only on the FIRST TURN (when no prior conversation is shown above), add one short reminder: "Eva provides information and does not replace a doctor's diagnosis. For emergencies, seek urgent care immediately." Do not repeat. No long legal disclaimers.
- For minimal inputs like "hi/ok", keep it very short and ask clarifying questions instead of dumping a full report.

Formatting:
- Use short headers or bullets when helpful; avoid rigid templates.
- If more info is needed, end with 3–5 prioritized questions under "Need more:".`;
};

function sanitize(input: string): string {
  return (input || '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, 1000)
}

async function resolveContextId(request: Request, env: any): Promise<{ id: string; source: 'user' | 'ip' }> {
  try {
    const auth = request.headers.get('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (token && env.JWT_SECRET) {
      const decoded: any = await verifyAuthToken(token, env)
      if (decoded?.sub || decoded?.userId) {
        const uid = decoded.sub || decoded.userId
        return { id: `user:${uid}`, source: 'user' }
      }
    }
  } catch {}
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'anonymous'
  return { id: `ip:${ip}`, source: 'ip' }
}

export async function chat(request: IRequest, env: any): Promise<Response> {
  const req = request as unknown as Request
  try {
    const { message, lastTestResult, userProfile, language, model, temperature, topP, maxTokens } = (await req.json()) as any

    if (!message || !['vi','en'].includes(language)) {
      return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Content safety
    const safety = evaluateContentSafety(String(message), language)
    if (!safety.allowed) {
      const safeMsg = safety.message || (language === 'vi' ? 'Nội dung này không được hỗ trợ.' : 'This content is not supported.')
      return new Response(JSON.stringify({ message: safeMsg, timestamp: new Date().toISOString(), language }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    if (!env.AI) {
      const msg = language === 'vi' ? 'Dịch vụ AI chưa sẵn sàng.' : 'AI service not available.'
      return new Response(JSON.stringify({ message: msg }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    if (await isBreakerOpen(env.CACHE)) {
      const msg = language === 'vi' ? 'Hệ thống đang bận. Vui lòng thử lại sau ít phút.' : 'System is busy. Please try again shortly.'
      return new Response(JSON.stringify({ message: msg, timestamp: new Date().toISOString(), language }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    const identity = await resolveContextId(req, env)
    const ctxTurns = await getChatContext(env.CACHE, identity.id)
    const ctxText = renderContextAsText(ctxTurns, language)

    const sanitized = sanitize(String(message))
    let userPrompt = ''
    if (ctxText) userPrompt += `${ctxText}\n\n---\n`
    userPrompt += sanitized
    if (lastTestResult) userPrompt += `\n\nKết quả test gần nhất: ${JSON.stringify(lastTestResult)}`
    if (userProfile) userPrompt += language === 'vi'
      ? `\n\nHồ sơ người dùng: ${JSON.stringify(userProfile)}`
      : `\n\nUser profile: ${JSON.stringify(userProfile)}`

    const t0 = Date.now()
    let assistantCore = ''
    try {
      const mdl = model || env.CHAT_MODEL || ''
      if (mdl.startsWith('gemini-')) {
        const { createGeminiFromEnv } = await import('../services/gemini')
        const gem = createGeminiFromEnv(env)
        assistantCore = await gem.generateContent(userPrompt, {
          model: mdl,
          temperature: typeof temperature === 'number' ? temperature : 0.7,
          maxTokens: typeof maxTokens === 'number' ? Math.max(64, Math.floor(maxTokens)) : 1200,
          topP: typeof topP === 'number' ? Math.min(Math.max(topP, 0), 1) : 0.8,
        })
      } else {
        assistantCore = await generateWithCloudflareAI(env.AI, userPrompt, getSystemPrompt(language), { model: mdl || undefined, temperature: typeof temperature === 'number' ? temperature : 0.7, max_tokens: typeof maxTokens === 'number' ? Math.max(64, Math.floor(maxTokens)) : 1200, top_p: typeof topP === 'number' ? Math.min(Math.max(topP, 0), 1) : 0.8 })
      }
      await recordSuccess(env.CACHE)
    } catch (e) {
      await recordFailure(env.CACHE)
      const msg = language === 'vi' ? 'Xin lỗi, AI đang bận. Vui lòng thử lại sau.' : 'Sorry, the AI is busy. Please try again later.'
      return new Response(JSON.stringify({ message: msg, timestamp: new Date().toISOString(), language }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // Persist context (assistant message)
    try { await appendChatContext(env.CACHE, identity.id, sanitized, assistantCore) } catch {}

    // Cost & latency tracking (approximate tokens)
    try {
      const uid = identity.id.startsWith('user:') ? identity.id.slice(5) : null
      const tokensIn = Math.ceil((getSystemPrompt(language).length + userPrompt.length) / 4)
      const tokensOut = Math.ceil(assistantCore.length / 4)
      const latency = Date.now() - t0
      const { DatabaseService } = await import('../services/database')
      const db = new DatabaseService(env.DB)
      await db.trackCost({ userId: uid, service: 'llm', endpoint: '/api/chat', tokensInput: tokensIn, tokensOutput: tokensOut, costUsd: 0 })
      console.info(JSON.stringify({ evt: 'chat_done', model: model || env.CHAT_MODEL || '@cf/meta/llama-3.1-8b-instruct', tokensIn, tokensOut, latency }))
    } catch {}

    return new Response(
      JSON.stringify({ message: assistantCore, timestamp: new Date().toISOString(), language, model: model || env.CHAT_MODEL || '@cf/meta/llama-3.1-8b-instruct' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Failed to process chat', message: error?.message || 'UNKNOWN' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
