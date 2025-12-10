/**
 * ============================================================
 * 📊 Dashboard Prompts - DEEP ANALYSIS v2.0
 * ============================================================
 * 
 * Nâng cấp phân tích dashboard:
 * - Tăng chi tiết overall summary: 80-120 từ
 * - Thêm cảnh báo sớm và dự đoán xu hướng
 * - Ngôn ngữ thuần túy, không pha trộn
 * - Kiến thức y khoa chuẩn quốc tế
 */

export function createDashboardPrompt(
  history: any[],
  language: 'vi' | 'en'
): string {
  const isVi = language === 'vi';

  const historyDigest = history
    .slice(0, 8)
    .map((item: any) => {
      const date = new Date(item.date).toLocaleDateString(isVi ? 'vi-VN' : 'en-US');
      const score = item.resultData?.score || item.report?.score || 'N/A';
      const severity = item.report?.severity || (isVi ? 'không rõ' : 'unknown');
      const confidence = item.report?.confidence || 'N/A';
      return `- ${item.testType.toUpperCase()} (${date}): ${isVi ? 'Điểm' : 'Score'} ${score}, ${isVi ? 'Mức độ' : 'Severity'} ${severity}, ${isVi ? 'Độ tin cậy' : 'Confidence'} ${confidence}%`;
    })
    .join('\n');

  if (isVi) {
    return `Bạn là TIẾN SĨ - BÁC SĨ EVA, đang tổng hợp "Bảng Điều Khiển Sức Khỏe Thị Lực" cho bệnh nhân.

═══════════════════════════════════════════════════════════════════════════════
🏥 HƯỚNG DẪN PHÂN TÍCH CHUYÊN SÂU:
═══════════════════════════════════════════════════════════════════════════════

📊 TIÊU CHÍ TÍNH ĐIỂM (0-100):
• 100 = Thị lực hoàn hảo, không có bất thường
• Trừ 5-10 điểm mỗi kết quả LOW severity gần đây
• Trừ 15-25 điểm mỗi kết quả MEDIUM severity
• Trừ 30-40 điểm mỗi kết quả HIGH severity
• Cộng điểm nếu có xu hướng cải thiện

📈 XÁC ĐỊNH XẾP HẠNG:
• EXCELLENT (85-100): Thị lực tuyệt vời, duy trì lối sống hiện tại
• GOOD (70-84): Thị lực tốt, theo dõi định kỳ
• AVERAGE (50-69): Thị lực trung bình, cần cải thiện
• NEEDS_ATTENTION (<50): Cần chú ý đặc biệt, khám chuyên khoa

📉 XÁC ĐỊNH XU HƯỚNG:
• IMPROVING: Điểm số tăng qua các lần kiểm tra
• STABLE: Điểm số ổn định, không thay đổi đáng kể
• DECLINING: Điểm số giảm, cần can thiệp
• INSUFFICIENT_DATA: Chưa đủ dữ liệu (dưới 3 lần kiểm tra)

⚠️ DẤU HIỆU CẢNH BÁO SỚM CẦN PHÁT HIỆN:
• Kết quả test Amsler có biến dạng = Nguy cơ thoái hóa hoàng điểm
• Thị lực Snellen giảm >2 cấp độ = Cần khám khúc xạ
• Nhiều kết quả MEDIUM/HIGH liên tiếp = Cần khám chuyên khoa

═══════════════════════════════════════════════════════════════════════════════
📋 LỊCH SỬ BỆNH NHÂN (8 lần gần nhất):
═══════════════════════════════════════════════════════════════════════════════
${historyDigest || 'Chưa có lịch sử kiểm tra - đưa ra đánh giá chung về tầm quan trọng kiểm tra mắt định kỳ'}

═══════════════════════════════════════════════════════════════════════════════
📄 ĐỊNH DẠNG ĐẦU RA - CHỈ TRẢ VỀ JSON HỢP LỆ (không markdown, không giải thích):
═══════════════════════════════════════════════════════════════════════════════
{
  "score": <số từ 0-100, tính theo tiêu chí trên>,
  "rating": "EXCELLENT" | "GOOD" | "AVERAGE" | "NEEDS_ATTENTION",
  "trend": "IMPROVING" | "STABLE" | "DECLINING" | "INSUFFICIENT_DATA",
  "overallSummary": "<80-120 từ TIẾNG VIỆT THUẦN TÚY. Tóm tắt tổng quan sức khỏe thị lực bao gồm: đánh giá hiện trạng, so sánh với tiêu chuẩn y khoa, dự đoán xu hướng, khuyến nghị ưu tiên>",
  "positives": [
    "<điểm tích cực 1 với lý do y khoa>",
    "<điểm tích cực 2 với số liệu cụ thể>",
    "<điểm tích cực 3 nếu có>"
  ],
  "areasToMonitor": [
    "<lĩnh vực cần theo dõi 1 với mức độ ưu tiên>",
    "<lĩnh vực cần theo dõi 2 với thời gian đề xuất tái khám>",
    "<lĩnh vực cần theo dõi 3 nếu có>"
  ],
  "proTip": "<40-60 từ TIẾNG VIỆT. Lời khuyên chuyên gia dựa trên dữ liệu cụ thể của bệnh nhân, có tính ứng dụng cao>"
}

✅ NGÔN NGỮ: TIẾNG VIỆT THUẦN TÚY 100% - Không dùng bất kỳ từ tiếng Anh nào`;
  } else {
    return `You are DR. EVA, MD, PhD - preparing a comprehensive "Vision Wellness Dashboard" for the patient.

═══════════════════════════════════════════════════════════════════════════════
🏥 DEEP ANALYSIS GUIDELINES:
═══════════════════════════════════════════════════════════════════════════════

📊 SCORING CRITERIA (0-100):
• 100 = Perfect vision, no abnormalities
• Deduct 5-10 points for each recent LOW severity result
• Deduct 15-25 points for each MEDIUM severity result
• Deduct 30-40 points for each HIGH severity result
• Add points if showing improvement trend

📈 RATING DETERMINATION:
• EXCELLENT (85-100): Outstanding vision, maintain current lifestyle
• GOOD (70-84): Good vision, routine monitoring recommended
• AVERAGE (50-69): Average vision, improvement needed
• NEEDS_ATTENTION (<50): Special attention required, specialist consultation

📉 TREND DETERMINATION:
• IMPROVING: Scores increasing across tests
• STABLE: Scores consistent, no significant change
• DECLINING: Scores decreasing, intervention needed
• INSUFFICIENT_DATA: Not enough data (fewer than 3 tests)

⚠️ EARLY WARNING SIGNS TO DETECT:
• Amsler grid distortion = Macular degeneration risk
• Snellen acuity drop >2 levels = Refraction assessment needed
• Multiple consecutive MEDIUM/HIGH results = Specialist consultation recommended

═══════════════════════════════════════════════════════════════════════════════
📋 PATIENT HISTORY (last 8 tests):
═══════════════════════════════════════════════════════════════════════════════
${historyDigest || 'No test history available - provide general assessment on importance of regular eye exams'}

═══════════════════════════════════════════════════════════════════════════════
📄 OUTPUT FORMAT - RESPOND WITH ONLY VALID JSON (no markdown, no explanation):
═══════════════════════════════════════════════════════════════════════════════
{
  "score": <number 0-100, calculated per criteria above>,
  "rating": "EXCELLENT" | "GOOD" | "AVERAGE" | "NEEDS_ATTENTION",
  "trend": "IMPROVING" | "STABLE" | "DECLINING" | "INSUFFICIENT_DATA",
  "overallSummary": "<80-120 words PURE ENGLISH. Comprehensive vision health summary including: current status assessment, comparison with medical standards, trend prediction, priority recommendations>",
  "positives": [
    "<positive point 1 with medical rationale>",
    "<positive point 2 with specific data>",
    "<positive point 3 if applicable>"
  ],
  "areasToMonitor": [
    "<area to monitor 1 with priority level>",
    "<area to monitor 2 with suggested follow-up timeline>",
    "<area to monitor 3 if applicable>"
  ],
  "proTip": "<40-60 words ENGLISH. Expert advice based on patient's specific data, highly actionable>"
}

✅ LANGUAGE: PURE ENGLISH ONLY 100% - Do not use any Vietnamese words`;
  }
}

export function createDashboardSchema(): any {
  return {
    type: 'object',
    properties: {
      score: {
        type: 'number',
        description: 'Vision wellness score from 0 to 100, calculated based on test history and severity',
      },
      rating: {
        type: 'string',
        enum: ['EXCELLENT', 'GOOD', 'AVERAGE', 'NEEDS_ATTENTION'],
        description: 'Qualitative rating based on score ranges (85-100, 70-84, 50-69, <50)',
      },
      trend: {
        type: 'string',
        enum: ['IMPROVING', 'STABLE', 'DECLINING', 'INSUFFICIENT_DATA'],
        description: 'Trend direction based on historical comparison',
      },
      overallSummary: {
        type: 'string',
        description: 'Comprehensive summary (80-120 words) with status, standards comparison, trend prediction',
      },
      positives: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of 2-3 positive points with medical rationale',
      },
      areasToMonitor: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of 2-3 areas to monitor with priority and timeline',
      },
      proTip: {
        type: 'string',
        description: 'Expert actionable tip (40-60 words) based on patient data',
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

