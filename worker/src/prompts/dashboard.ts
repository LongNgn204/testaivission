/**
 * ============================================================
 * 📊 Dashboard Prompts - LANGUAGE CONSISTENT
 * ============================================================
 * 
 * Prompts for dashboard insights
 */

export function createDashboardPrompt(
  history: any[],
  language: 'vi' | 'en'
): string {
  const isVi = language === 'vi';

  const historyDigest = history
    .slice(0, 6)
    .map((item: any) => {
      const date = new Date(item.date).toLocaleDateString(isVi ? 'vi-VN' : 'en-US');
      const score = item.resultData?.score || item.report?.score || 'N/A';
      const severity = item.report?.severity || (isVi ? 'không rõ' : 'unknown');
      return `- ${item.testType.toUpperCase()} (${date}): ${isVi ? 'điểm' : 'score'} ${score}, ${isVi ? 'mức độ' : 'severity'} ${severity}`;
    })
    .join('\n');

  if (isVi) {
    return `Bạn đang chuẩn bị "Bảng Điều Khiển Sức Khỏe Thị Lực" cho bệnh nhân. Trả lời hoàn toàn bằng TIẾNG VIỆT.

QUY TẮC:
1. Phân tích toàn bộ lịch sử: Xem xét loại kiểm tra, mức độ nghiêm trọng, thời gian gần đây và tần suất.
2. Tính điểm (0-100): 100 là thị lực hoàn hảo. Trừ điểm dựa trên mức độ nghiêm trọng.
3. Xác định xếp hạng: 'EXCELLENT' (85-100), 'GOOD' (70-84), 'AVERAGE' (50-69), hoặc 'NEEDS_ATTENTION' (<50).
4. Xác định xu hướng: 'IMPROVING', 'STABLE', 'DECLINING', hoặc 'INSUFFICIENT_DATA'.
5. Cung cấp thông tin chi tiết bằng tiếng Việt.

LỊCH SỬ BỆNH NHÂN:
${historyDigest}

ĐỊNH DẠNG ĐẦU RA - Chỉ trả về JSON hợp lệ (không markdown, không giải thích):
{
  "score": <số từ 0-100>,
  "rating": "EXCELLENT" | "GOOD" | "AVERAGE" | "NEEDS_ATTENTION",
  "trend": "IMPROVING" | "STABLE" | "DECLINING" | "INSUFFICIENT_DATA",
  "overallSummary": "<40-60 từ tiếng Việt tóm tắt tổng quan>",
  "positives": ["<điểm tích cực 1>", "<điểm tích cực 2>"],
  "areasToMonitor": ["<lĩnh vực cần theo dõi 1>", "<lĩnh vực cần theo dõi 2>"],
  "proTip": "<20-30 từ tiếng Việt lời khuyên hữu ích>"
}`;
  } else {
    return `You are preparing a "Vision Wellness Dashboard" for the patient. Respond entirely in ENGLISH.

RULES:
1. Analyze the entire history: Consider test type, severity, recency, and frequency.
2. Calculate a Score (0-100): 100 is perfect vision. Deduct points based on severity.
3. Determine a Rating: 'EXCELLENT' (85-100), 'GOOD' (70-84), 'AVERAGE' (50-69), or 'NEEDS_ATTENTION' (<50).
4. Determine the Trend: 'IMPROVING', 'STABLE', 'DECLINING', or 'INSUFFICIENT_DATA'.
5. Provide detailed insights in English.

PATIENT HISTORY:
${historyDigest}

OUTPUT FORMAT - Respond with ONLY valid JSON (no markdown, no explanation):
{
  "score": <number 0-100>,
  "rating": "EXCELLENT" | "GOOD" | "AVERAGE" | "NEEDS_ATTENTION",
  "trend": "IMPROVING" | "STABLE" | "DECLINING" | "INSUFFICIENT_DATA",
  "overallSummary": "<40-60 words English overall summary>",
  "positives": ["<positive point 1>", "<positive point 2>"],
  "areasToMonitor": ["<area to monitor 1>", "<area to monitor 2>"],
  "proTip": "<20-30 words English actionable tip>"
}`;
  }
}

export function createDashboardSchema(): any {
  return {
    type: 'object',
    properties: {
      score: {
        type: 'number',
        description: 'Vision wellness score from 0 to 100',
      },
      rating: {
        type: 'string',
        enum: ['EXCELLENT', 'GOOD', 'AVERAGE', 'NEEDS_ATTENTION'],
        description: 'Qualitative rating',
      },
      trend: {
        type: 'string',
        enum: ['IMPROVING', 'STABLE', 'DECLINING', 'INSUFFICIENT_DATA'],
        description: 'Trend direction',
      },
      overallSummary: {
        type: 'string',
        description: 'Comprehensive summary (40-60 words)',
      },
      positives: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of 1-2 positive points',
      },
      areasToMonitor: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of 1-2 areas to monitor',
      },
      proTip: {
        type: 'string',
        description: 'Single actionable Pro Tip (20-30 words)',
      },
    },
    required: [
      'score',
      'rating',
      'trend',
      'overallSummary',
      'positives',
      'areasToMonitor',
      'proTip',
    ],
  };
}
