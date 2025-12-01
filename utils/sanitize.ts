export function sanitizeText(input: string, maxLen = 500): string {
  // Remove control characters, trim, squash whitespace, limit length
  const cleaned = input
    .replace(/[\u0000-\u001F\u007F]/g, ' ') // control chars
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();
  return cleaned.slice(0, maxLen);
}

export function isLikelyInjection(input: string): boolean {
  // Heuristic patterns to reject obvious payloads
  const patterns = [
    /<script/i,
    /javascript:/i,
    /onerror\s*=|onload\s*=/i,
    /data:\s*text\/html/i,
  ];
  return patterns.some((p) => p.test(input));
}

