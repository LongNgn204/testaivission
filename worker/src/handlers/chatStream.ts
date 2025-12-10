/**
 * ============================================================
 * 💬 Chat Stream Handler (SSE) - v1
 * ============================================================
 *
 * Streams AI response over Server-Sent Events for better UX.
 * Hiện tại Cloudflare Workers AI không stream chunk theo ví dụ này,
 * nên ta lấy full response rồi chia nhỏ thành chunk để giả lập streaming.
 */

import { IRequest } from 'itty-router'
import { generateWithCloudflareAI } from '../services/gemini'

function sanitize(input: string): string {
  return (input || '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, 1000)
}

function disclaimer(lang: 'vi' | 'en'): string {
  return lang === 'vi'
    ? 'Lưu ý: Eva là trợ lý AI hỗ trợ sức khỏe mắt và KHÔNG thay thế chẩn đoán của bác sĩ. Nếu có triệu chứng khẩn cấp (mất thị lực đột ngột, đau mắt dữ dội, chấn thương mắt), hãy đến cơ sở y tế gần nhất hoặc gọi cấp cứu.'
    : 'Note: Eva is an AI eye health assistant and does NOT replace professional medical diagnosis. If you have emergency symptoms (sudden vision loss, severe eye pain, eye trauma), seek urgent care or call emergency services.'
}

const getSystemPrompt = (language: 'vi' | 'en') => {
  return language === 'vi'
    ? `Bạn là TIẾN SĨ - BÁC SĨ EVA, Chuyên gia Nhãn khoa. Trả lời 150-300 từ, có cấu trúc: Đánh giá → Phân tích → Khuyến nghị → Tiên lượng. Ngôn ngữ: Tiếng Việt thuần túy.`
    : `You are DR. EVA, Senior Ophthalmologist. Answer in 150-300 words with structure: Assessment → Analysis → Recommendations → Prognosis. Language: pure English.`
}

export async function chatStream(request: IRequest, env: any): Promise<Response> {
  try {
    const { message, lastTestResult, language } = (await request.json()) as any

    if (!message || !language || !['vi', 'en'].includes(language)) {
      return new Response('Bad Request', { status: 400 })
    }
    if (!env.AI) {
      return new Response('AI not configured', { status: 500 })
    }

    const userPrompt = sanitize(String(message)) + (lastTestResult ? `\n\nKết quả test gần nhất: ${JSON.stringify(lastTestResult)}` : '')

    const stream = new ReadableStream<Uint8Array>({
      start: async (controller) => {
        const enc = new TextEncoder()
        function send(data: string) {
          controller.enqueue(enc.encode(`data: ${data}\n\n`))
        }
        function sendEvent(event: string, data?: string) {
          controller.enqueue(enc.encode(`event: ${event}\n`))
          if (data) controller.enqueue(enc.encode(`data: ${data}\n`))
          controller.enqueue(enc.encode(`\n`))
        }

        try {
          // Get full AI response
          const full = await generateWithCloudflareAI(env.AI, userPrompt, getSystemPrompt(language))

          // Chunk the response by ~120 chars
          const CHUNK_SIZE = 120
          for (let i = 0; i < full.length; i += CHUNK_SIZE) {
            const chunk = full.slice(i, i + CHUNK_SIZE)
            send(chunk)
            // small delay to simulate streaming
            await new Promise((r) => setTimeout(r, 30))
          }
          sendEvent('done', 'true')
          controller.close()
        } catch (e: any) {
          sendEvent('error', e?.message || 'UNKNOWN')
          controller.close()
        }
      },
    })

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (e) {
    return new Response('Internal Error', { status: 500 })
  }
}

