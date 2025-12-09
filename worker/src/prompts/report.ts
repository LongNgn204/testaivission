/**
 * ============================================================
 * 📋 Report Prompts
 * ============================================================
 * 
 * Prompts for generating medical reports - LANGUAGE CONSISTENT
 */

const DOCTOR_PERSONA_VI = `
Bạn là bác sĩ chuyên khoa MẮT tên Eva, có hơn 10 năm kinh nghiệm tại bệnh viện tuyến trung ương.
- Luôn giải thích rõ ràng, đồng cảm, ưu tiên sức khỏe bệnh nhân.
- Luôn nhắc bệnh nhân đi khám trực tiếp nếu phát hiện dấu hiệu nguy hiểm.
- So sánh kết quả hiện tại với lịch sử, nhắc tới số liệu cụ thể.
- Nói tự nhiên, tiếng Việt đời thường, dễ hiểu.
`;

const DOCTOR_PERSONA_EN = `
You are Dr. Eva, a board-certified ophthalmologist with 15+ years of clinical experience.
- Always explain clearly, show empathy, prioritize patient health.
- Remind patients to seek in-person examination if dangerous signs are detected.
- Compare current results with history, mention specific data.
- Speak naturally, in everyday English, easy to understand.
`;

export function createReportPrompt(
  testType: string,
  testData: any,
  history: any[],
  language: 'vi' | 'en'
): string {
  const isVi = language === 'vi';

  const baseInstruction = isVi
    ? `${DOCTOR_PERSONA_VI}

TIÊU CHUẨN Y HỌC - PHẢI TUÂN THỦ ĐỘ CHÍNH XÁC 93%:

🔬 KIỂM TRA THỊ LỰC SNELLEN:
- 20/20: Xuất sắc → Mức độ THẤP
- 20/25-20/30: Bình thường → Mức độ THẤP
- 20/40: Giảm nhẹ → Mức độ THẤP/TRUNG BÌNH
- 20/60: Giảm trung bình → Mức độ TRUNG BÌNH
- 20/100: Giảm nặng → Mức độ CAO
- <20/100: Rất nặng → Mức độ CAO (KHẨN CẤP)

🎨 KIỂM TRA MÙ MÀU ISHIHARA:
- 11-12/12: Bình thường → Mức độ THẤP
- 7-10/12: Thiếu hụt đỏ-xanh lá → Mức độ TRUNG BÌNH
- 4-6/12: Thiếu hụt nặng → Mức độ CAO
- 0-3/12: Có thể mù màu hoàn toàn → Mức độ CAO

📐 KIỂM TRA LƯỚI AMSLER (Hoàng điểm):
- Không biến dạng → Mức độ THẤP
- 1-2 vùng biến dạng → Mức độ TRUNG BÌNH
- 3+ vùng biến dạng → Mức độ CAO (KHẨN CẤP)

🔄 KIỂM TRA LOẠN THỊ:
- Không có loạn thị → Mức độ THẤP
- Loạn thị nhẹ → Mức độ THẤP
- Loạn thị trung bình → Mức độ TRUNG BÌNH
- Loạn thị nặng → Mức độ CAO

🔴🟢 KIỂM TRA HAI MÀU (Cận/Viễn):
- Cân bằng → Mức độ THẤP
- Một mắt bất thường → Mức độ TRUNG BÌNH
- Cả hai mắt bất thường → Mức độ CAO`
    : `${DOCTOR_PERSONA_EN}

MEDICAL STANDARDS - 93% ACCURACY COMPLIANCE:

🔬 SNELLEN VISUAL ACUITY TEST:
- 20/20: Excellent → LOW severity
- 20/25-20/30: Normal → LOW severity
- 20/40: Mild reduction → LOW/MEDIUM severity
- 20/60: Moderate reduction → MEDIUM severity
- 20/100: Severe reduction → HIGH severity
- <20/100: Very severe → HIGH severity (URGENT)

🎨 ISHIHARA COLOR BLINDNESS TEST:
- 11-12/12: Normal → LOW severity
- 7-10/12: Red-Green Deficiency → MEDIUM severity
- 4-6/12: Severe deficiency → HIGH severity
- 0-3/12: Possible total color blindness → HIGH severity

📐 AMSLER GRID TEST (Macula):
- No distortion → LOW severity
- 1-2 distorted areas → MEDIUM severity
- 3+ distorted areas → HIGH severity (URGENT)

🔄 ASTIGMATISM TEST:
- No astigmatism → LOW severity
- Mild astigmatism → LOW severity
- Moderate astigmatism → MEDIUM severity
- Severe astigmatism → HIGH severity

🔴🟢 DUOCHROME TEST (Myopia/Hyperopia):
- Balanced → LOW severity
- One eye abnormal → MEDIUM severity
- Both eyes abnormal → HIGH severity`;

  const historyDigest = history
    .slice(0, 3)
    .map((item: any) => {
      const date = new Date(item.date).toLocaleDateString(isVi ? 'vi-VN' : 'en-US');
      const severity = item.report?.severity || (isVi ? 'không rõ' : 'unknown');
      return `- ${item.testType.toUpperCase()} (${date}): ${severity}`;
    })
    .join('\n');

  const testSpecificInfo = getTestSpecificInfo(testType, testData, language);

  const outputFormat = isVi
    ? `ĐỊNH DẠNG ĐẦU RA - Chỉ trả về JSON hợp lệ (không markdown, không giải thích):
{
  "confidence": <số từ 70-99>,
  "summary": "<250-300 từ tiếng Việt phân tích lâm sàng>",
  "trend": "<100 từ tiếng Việt phân tích xu hướng>",
  "causes": "<80 từ tiếng Việt nguyên nhân>",
  "recommendations": ["Khuyến nghị 1", "Khuyến nghị 2", "..."],
  "severity": "LOW" | "MEDIUM" | "HIGH",
  "prediction": "<80 từ tiếng Việt tiên lượng>"
}`
    : `OUTPUT FORMAT - Respond with ONLY valid JSON (no markdown, no explanation):
{
  "confidence": <number 70-99>,
  "summary": "<250-300 words English clinical analysis>",
  "trend": "<100 words English trend analysis>",
  "causes": "<80 words English causes>",
  "recommendations": ["Recommendation 1", "Recommendation 2", "..."],
  "severity": "LOW" | "MEDIUM" | "HIGH",
  "prediction": "<80 words English prognosis>"
}`;

  const historyLabel = isVi ? 'LỊCH SỬ KIỂM TRA (3 lần gần nhất):' : 'TEST HISTORY (last 3):';
  const noHistory = isVi ? 'Chưa có lịch sử kiểm tra' : 'No previous tests';
  const currentDataLabel = isVi ? 'DỮ LIỆU KIỂM TRA HIỆN TẠI:' : 'CURRENT TEST DATA:';

  return `${baseInstruction}

${historyLabel}
${historyDigest || noHistory}

${currentDataLabel}
${JSON.stringify(testData, null, 2)}

${testSpecificInfo}

${outputFormat}`;
}

function getTestSpecificInfo(
  testType: string,
  testData: any,
  language: 'vi' | 'en'
): string {
  const isVi = language === 'vi';

  switch (testType) {
    case 'snellen':
      return isVi
        ? `PHÂN TÍCH KIỂM TRA THỊ LỰC SNELLEN:
- Điểm số: ${testData.score || 'N/A'}
- Độ chính xác: ${testData.accuracy || 'N/A'}%
- Số câu đúng: ${testData.correctAnswers || 0}/${testData.totalQuestions || 0}`
        : `SNELLEN VISUAL ACUITY ANALYSIS:
- Score: ${testData.score || 'N/A'}
- Accuracy: ${testData.accuracy || 'N/A'}%
- Correct answers: ${testData.correctAnswers || 0}/${testData.totalQuestions || 0}`;

    case 'colorblind':
      return isVi
        ? `PHÂN TÍCH KIỂM TRA MÙ MÀU ISHIHARA:
- Số thẻ đúng: ${testData.correct || 0}/${testData.total || 12}
- Độ chính xác: ${testData.accuracy || 'N/A'}%
- Các thẻ sai: ${JSON.stringify(testData.missedPlates || [])}`
        : `ISHIHARA COLOR BLINDNESS ANALYSIS:
- Correct plates: ${testData.correct || 0}/${testData.total || 12}
- Accuracy: ${testData.accuracy || 'N/A'}%
- Missed plates: ${JSON.stringify(testData.missedPlates || [])}`;

    case 'amsler':
      return isVi
        ? `PHÂN TÍCH KIỂM TRA LƯỚI AMSLER:
- Biến dạng: ${testData.distortions || 'không có'}
- Vị trí: ${testData.location || 'N/A'}
- Mức độ nghiêm trọng: ${testData.severity || 'không rõ'}`
        : `AMSLER GRID ANALYSIS:
- Distortions: ${testData.distortions || 'none'}
- Location: ${testData.location || 'N/A'}
- Severity: ${testData.severity || 'unknown'}`;

    case 'astigmatism':
      return isVi
        ? `PHÂN TÍCH KIỂM TRA LOẠN THỊ:
- Mắt phải: ${testData.rightEye?.hasAstigmatism ? 'Có' : 'Không'} (${testData.rightEye?.type || 'N/A'})
- Mắt trái: ${testData.leftEye?.hasAstigmatism ? 'Có' : 'Không'} (${testData.leftEye?.type || 'N/A'})`
        : `ASTIGMATISM ANALYSIS:
- Right eye: ${testData.rightEye?.hasAstigmatism ? 'Yes' : 'No'} (${testData.rightEye?.type || 'N/A'})
- Left eye: ${testData.leftEye?.hasAstigmatism ? 'Yes' : 'No'} (${testData.leftEye?.type || 'N/A'})`;

    case 'duochrome':
      return isVi
        ? `PHÂN TÍCH KIỂM TRA HAI MÀU:
- Mắt phải: ${testData.rightEye?.result || 'N/A'}
- Mắt trái: ${testData.leftEye?.result || 'N/A'}`
        : `DUOCHROME ANALYSIS:
- Right eye: ${testData.rightEye?.result || 'N/A'}
- Left eye: ${testData.leftEye?.result || 'N/A'}`;

    default:
      return '';
  }
}

export function createReportSchema(language: 'vi' | 'en'): any {
  return {
    type: 'object',
    properties: {
      confidence: {
        type: 'number',
        description: language === 'vi'
          ? 'Độ tin cậy chẩn đoán (70-99)'
          : 'Diagnostic confidence (70-99)',
      },
      summary: {
        type: 'string',
        description: language === 'vi'
          ? '250-300 từ TIẾNG VIỆT. Phân tích lâm sàng sâu sắc'
          : '250-300 words ENGLISH. Deep clinical analysis',
      },
      trend: {
        type: 'string',
        description: language === 'vi'
          ? '100-150 từ TIẾNG VIỆT. Phân tích xu hướng'
          : '100-150 words ENGLISH. Trend analysis',
      },
      causes: {
        type: 'string',
        description: language === 'vi'
          ? '80-100 từ TIẾNG VIỆT. Phân tích nguyên nhân'
          : '80-100 words ENGLISH. Cause analysis',
      },
      recommendations: {
        type: 'array',
        items: { type: 'string' },
        description: language === 'vi'
          ? '8-10 lời khuyên cụ thể TIẾNG VIỆT'
          : '8-10 detailed recommendations ENGLISH',
      },
      severity: {
        type: 'string',
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        description: language === 'vi' ? 'Mức độ nghiêm trọng' : 'Severity level',
      },
      prediction: {
        type: 'string',
        description: language === 'vi'
          ? '80-100 từ TIẾNG VIỆT. Tiên lượng'
          : '80-100 words ENGLISH. Prognosis',
      },
    },
    required: [
      'confidence',
      'summary',
      'trend',
      'recommendations',
      'severity',
      'causes',
      'prediction',
    ],
  };
}
