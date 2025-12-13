/**
 * ========================================
 * SECURITY UTILITIES (Worker)
 * ========================================
 * Sanitize input, PII redaction, simple content filtering
 */

const PHONE_REGEX = /(?:\+?\d{1,3}[\s-]?)?\b\d{9,11}\b/g; // 9-11 digits
const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const ID_REGEX = /\b\d{9,12}\b/g; // CCCD/CMND dạng số

export function sanitizeInput(text: string): string {
  const withoutTags = (text || '')
    .replace(/<\/(?:script|style)>/gi, '')
    .replace(/<(?:script|style)[\s\S]*?>[\s\S]*?<\/(?:script|style)>/gi, '')
    .replace(/on[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/on[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/on[a-z]+\s*=\s*[^\s>]+/gi, '');
  const plain = withoutTags.replace(/<[^>]*>/g, '');
  return plain.trim();
}

export function redactPII(text: string): string {
  return (text || '')
    .replace(EMAIL_REGEX, '[email_redacted]')
    .replace(PHONE_REGEX, '[phone_redacted]')
    .replace(ID_REGEX, '[id_redacted]');
}

export function isInappropriate(text: string): boolean {
  const lowered = (text || '').toLowerCase();
  const banned = ['hack ', 'sql injection', 'xss', 'porn', 'nsfw', 'violence'];
  return banned.some((kw) => lowered.includes(kw));
}

export function guardUserInput(text: string): { safeText: string; redactedText: string } {
  const sanitized = sanitizeInput(text);
  if (isInappropriate(sanitized)) {
    throw new Error('Nội dung không phù hợp');
  }
  const redacted = redactPII(sanitized);
  return { safeText: sanitized, redactedText: redacted };
}

