/**
 * ========================================
 * SECURITY UTILITIES
 * ========================================
 * Guardrails an toàn: sanitize input, PII redaction, simple content filtering
 * Lưu ý: Đây là lớp bảo vệ ở FE/BE. Ở BE vẫn phải validate kỹ (Zod).
 */

// Các pattern PII phổ biến (đơn giản, thực dụng)
const PHONE_REGEX = /(?:\+?\d{1,3}[\s-]?)?\b\d{9,11}\b/g; // 9-11 digits
const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const ID_REGEX = /\b\d{9,12}\b/g; // CCCD/CMND dạng số

/**
 * Sanitize text để tránh XSS / input nguy hiểm
 * - Loại bỏ các thẻ HTML nguy hiểm
 * - Cắt khoảng trắng thừa
 */
export function sanitizeInput(text: string): string {
  // Loại bỏ thẻ script/style và thuộc tính on*
  const withoutTags = text
    .replace(/<\/(?:script|style)>/gi, '')
    .replace(/<(?:script|style)[\s\S]*?>[\s\S]*?<\/(?:script|style)>/gi, '')
    .replace(/on[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/on[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/on[a-z]+\s*=\s*[^\s>]+/gi, '');

  // Strip các tag còn lại (giữ plain text)
  const plain = withoutTags.replace(/<[^>]*>/g, '');

  return plain.trim();
}

/**
 * Redact PII cơ bản (điện thoại, email, số định danh)
 * - Dùng cho log, prompt gửi lên LLM
 */
export function redactPII(text: string): string {
  return text
    .replace(EMAIL_REGEX, '[email_redacted]')
    .replace(PHONE_REGEX, '[phone_redacted]')
    .replace(ID_REGEX, '[id_redacted]');
}

/**
 * Hard filter nội dung không phù hợp (đơn giản)
 * - Mục tiêu: chặn nhanh một số từ khoá nhạy cảm
 */
export function isInappropriate(text: string): boolean {
  const lowered = text.toLowerCase();
  const banned = [
    'hack ', 'sql injection', 'xss', 'porn', 'nsfw', 'violence',
  ];
  return banned.some((kw) => lowered.includes(kw));
}

/**
 * Guard function: sanitize + redact + filter
 * - Trả về text an toàn hoặc ném lỗi nếu không phù hợp
 */
export function guardUserInput(text: string): { safeText: string; redactedText: string } {
  const sanitized = sanitizeInput(text);
  if (isInappropriate(sanitized)) {
    throw new Error('Nội dung không phù hợp');
  }
  const redacted = redactPII(sanitized);
  return { safeText: sanitized, redactedText: redacted };
}

