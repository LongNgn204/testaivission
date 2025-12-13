/**
 `* ============================================================
 * 💬 Chat Stream Handler (SSE) - v2 (attempt native streaming, fallback to chunking)
 * ============================================================
 *
 * Ưu tiên stream thật từ Workers AI nếu hỗ trợ; nếu không, fallback chunk.
 * Kèm guardrails: sanitize, giới hạn độ dài, optionally prepend disclaimer (lượt đầu).
 */

import { IRequest } from 'itty-router'
import { generateWithCloudflareAI, createGeminiFromEnv, GeminiService } from '../services/gemini'
import { verifyAuthToken } from './auth'

function sanitize(input: string): string {
  return (input || '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, 2000)
}

const getSystemPrompt = (language: 'vi' | 'en') => {
  return language === 'vi'
    ? `Bạn là TIẾN SĨ - BÁC SĨ EVA, bác sĩ nhãn khoa lâm sàng. Trả lời 150-300 từ, ưu tiên ngắn gọn, đúng trọng tâm, có thể dùng bullet khi cần. Ngôn ngữ: Tiếng Việt thuần túy.`
    : `You are DR. EVA, a clinical ophthalmologist. Reply in 150-300 words, concise and on-point; use bullets when helpful. Language: pure English.`
}

export async function chatStream(request: IRequest, env: any): Promise<Response> {
  try {
    const req = request as Request
    const { message, lastTestResult, userProfile, language, model, temperature, topP, maxTokens } = (await req.json()) as any

    if (!message || !language || !['vi', 'en'].includes(language)) {
      return new Response('Bad Request', { status: 400 })
    }
    if (!env.AI) {
      return new Response('AI not configured', { status: 500 })
    }

    // Optional auth (if token present)
    try {
      const auth = req.headers.get('authorization') || ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
      if (token) await verifyAuthToken(token, env)
    } catch {}

    const userPrompt = (
      (userProfile ? (language === 'vi' ? `Hồ sơ người dùng: ${JSON.stringify(userProfile)}\n` : `User profile: ${JSON.stringify(userProfile)}\n`) : '') +
      (lastTestResult ? (language === 'vi' ? `Kết quả test gần nhất: ${JSON.stringify(lastTestResult)}\n` : `Last test result: ${JSON.stringify(lastTestResult)}\n`) : '') +
      sanitize(String(message))
    )

    const modelName = model || env.CHAT_MODEL || '@cf/meta/llama-3.1-8b-instruct'
    const tempVal = typeof temperature === 'number' ? Math.min(Math.max(temperature, 0), 1.5) : 0.7

    const t0 = Date.now()
    let tokensOut = 0
    const stream = new ReadableStream<Uint8Array>({
      start: async (controller) => {
        const enc = new TextEncoder()
        const sendData = (data: string) => controller.enqueue(enc.encode(`data: ${data}\n\n`))
        const sendEvent = (event: string, data?: string) => {
          controller.enqueue(enc.encode(`event: ${event}\n`))
          if (data) controller.enqueue(enc.encode(`data: ${data}\n`))
          controller.enqueue(enc.encode(`\n`))
        }

        try {
          // Gemini route: when model starts with 'gemini-'
          if (modelName.startsWith('gemini-')) {
            try {
              const gem = createGeminiFromEnv(env)
              const full = await gem.generateContent(userPrompt, { model: modelName, temperature: tempVal, maxTokens: typeof maxTokens === 'number' ? Math.max(64, Math.floor(maxTokens)) : 1200, topP: typeof topP === 'number' ? Math.min(Math.max(topP, 0), 1) : 0.8 })
              tokensOut = Math.ceil(full.length / 4)
              const CHUNK_SIZE = 160
              for (let i = 0; i < full.length; i += CHUNK_SIZE) {
                const chunk = full.slice(i, i + CHUNK_SIZE)
                sendData(chunk)
                await new Promise((r) => setTimeout(r, 25))
              }
              sendEvent('done', 'true')
              controller.close()
              return
            } catch (e) {
              // fallthrough to Workers AI
            }
          }
          // Try native streaming from Workers AI if supported
          let usedNative = false
          try {
            // @ts-ignore stream option may be supported depending on model/runtime
            const aiStream: any = await env.AI.run(modelName, {
              messages: [
                { role: 'system', content: getSystemPrompt(language) },
                { role: 'user', content: userPrompt },
              ],
              max_tokens: typeof maxTokens === 'number' ? Math.max(64, Math.floor(maxTokens)) : 1200,
              temperature: tempVal,
              top_p: typeof topP === 'number' ? Math.min(Math.max(topP, 0), 1) : 0.8,
              stream: true,
            })

            // If aiStream is async iterable, forward chunks
            if (aiStream && typeof aiStream[Symbol.asyncIterator] === 'function') {
              usedNative = true
              for await (const part of aiStream) {
                const chunk = typeof part === 'string' ? part : (part?.response || part?.delta || JSON.stringify(part))
                if (chunk) {
                  tokensOut += Math.ceil(chunk.length / 4)
                  sendData(chunk)
                }
              }
              sendEvent('done', 'true')
              controller.close()
            }
          } catch (e) {
            // ignore, fallback below
          }

          if (!usedNative) {
            // Fallback: get full and chunk manually
            const full = await generateWithCloudflareAI(env.AI, userPrompt, getSystemPrompt(language), { temperature: tempVal, model: modelName, max_tokens: typeof maxTokens === 'number' ? Math.max(64, Math.floor(maxTokens)) : 1200, top_p: typeof topP === 'number' ? Math.min(Math.max(topP, 0), 1) : 0.8 })
            const CHUNK_SIZE = 160
            tokensOut = Math.ceil(full.length / 4)
            for (let i = 0; i < full.length; i += CHUNK_SIZE) {
              const chunk = full.slice(i, i + CHUNK_SIZE)
              sendData(chunk)
              await new Promise((r) => setTimeout(r, 25))
            }
            sendEvent('done', 'true')
            controller.close()
          }
        } catch (e: any) {
          sendEvent('error', e?.message || 'UNKNOWN')
          controller.close()
        } finally {
          // Cost & latency tracking (approx tokens)
          try {
            const tokensIn = Math.ceil((getSystemPrompt(language).length + userPrompt.length) / 4)
            const latency = Date.now() - t0
            const { DatabaseService } = await import('../services/database')
            const db = new DatabaseService(env.DB)
            await db.trackCost({
              userId: null,
              service: 'llm',
              endpoint: '/api/chat/stream',
              tokensInput: tokensIn,
              tokensOutput: tokensOut,
              costUsd: 0,
            })
            // Optional structured log
            console.info(JSON.stringify({ evt: 'chat_stream_done', model: modelName, tokensIn, tokensOut, latency }))
          } catch {}
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

