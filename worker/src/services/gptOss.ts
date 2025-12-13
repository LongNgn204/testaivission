/**
 * ============================================================
 * 🤖 GPT-OSS-120B Service - Cloudflare Workers AI
 * ============================================================
 * 
 * Service để gọi GPT-OSS-120B với 2-pass accuracy check
 * Sử dụng Cloudflare Workers AI @cf/openai/gpt-oss-120b
 */

type AiBinding = {
  run(model: string, input: any): Promise<any>;
};

type LogFn = (event: string, meta?: Record<string, unknown>) => void;

const MODEL = '@cf/openai/gpt-oss-120b';

/**
 * Chú thích: Workers AI trả object kiểu Responses API; ưu tiên "output_text" nếu có
 */
function pickOutputText(res: any): string {
  if (typeof res?.output_text === 'string') return res.output_text;
  if (typeof res?.response === 'string') return res.response;
  // Fallback best-effort
  const out0 = res?.output?.[0];
  const text0 = out0?.content?.[0]?.text;
  return typeof text0 === 'string' ? text0 : '';
}

/**
 * Chạy 2-pass GPT-OSS để đảm bảo độ chính xác
 * Pass 1: Trả lời chính
 * Pass 2: QA review và sửa nếu cần
 */
export async function runTwoPassGptOss(
  ai: AiBinding,
  log: LogFn,
  args: {
    requestId: string;
    instructions: string;      // system prompt gọn
    userInput: string;         // câu hỏi user (đã sanitize cơ bản ở handler)
  }
): Promise<{ text: string }> {
  const t0 = Date.now();

  // Pass 1: trả lời chính (effort medium để cân bằng chất lượng/độ trễ)
  const pass1 = await ai.run(MODEL, {
    instructions: args.instructions,
    reasoning: { effort: 'medium', summary: 'auto' },
    input: [
      { role: 'user', content: args.userInput },
    ],
  });

  const draft = pickOutputText(pass1).trim();

  // Pass 2: kiểm tra độ đúng — nếu ổn thì trả PASS để khỏi rewrite
  const qaInstructions = [
    'Bạn là QA reviewer cực kỳ khó tính.',
    'Kiểm tra DRAFT có sai, thiếu, mơ hồ, hoặc không đúng yêu cầu không.',
    'Nếu DRAFT ổn: trả đúng chuỗi "PASS".',
    'Nếu cần sửa: trả phiên bản đã sửa trực tiếp (ngắn gọn).',
    'Không được bịa thêm dữ kiện. Thiếu thông tin thì hỏi tối đa 2 câu.',
  ].join('\n');

  const pass2 = await ai.run(MODEL, {
    instructions: qaInstructions,
    reasoning: { effort: 'low', summary: 'auto' },
    input: [
      { role: 'user', content: `DRAFT:\n${draft}` },
    ],
  });

  const qa = pickOutputText(pass2).trim();
  const finalText = qa === 'PASS' ? draft : qa;

  log('llm_two_pass_done', {
    requestId: args.requestId,
    model: MODEL,
    latencyMs: Date.now() - t0,
    // Chú thích: tokens/cost tuỳ response có field hay không, best-effort
    usage: pass2?.usage ?? pass1?.usage ?? null,
  });

  return { text: finalText };
}

