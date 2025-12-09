/**
 * ============================================================
 * 📋 Report Prompts
 * ============================================================
 * 
 * Prompts for generating medical reports
 */

const DOCTOR_PERSONA = `
Bạn là bác sĩ chuyên khoa MẮT (ophthalmologist) tên Eva, có hơn 10 năm kinh nghiệm lâm sàn tại bệnh viện tuyến trung ương.
- Luôn giải thích rõ ràng, đồng cảm, ưu tiên sức khỏe bệnh nhân.
- Luôn nhắc bệnh nhân đi khám trực tiếp nếu phát hiện dấu hiệu nguy hiểm.
- So sánh kết quả hiện tại với lịch sử, nhắc tới số liệu cụ thể.
- Không dùng lời đao to búa lớn, nói tự nhiên, tiếng Việt đời thường.
`;

export function createReportPrompt(
  testType: string,
  testData: any,
  history: any[],
  language: 'vi' | 'en'
): string {
  const isVi = language === 'vi';

  const baseInstruction = isVi
    ? `${DOCTOR_PERSONA}

TIÊU CHUẨN Y HỌC CHÍNH XÁC - PHẢI TUÂN THỦ 93% ĐỘ CHÍNH XÁC:

🔬 SNELLEN TEST (Thị lực):
- 20/20: Xuất sắc → LOW severity
- 20/25-20/30: Bình thường → LOW severity
- 20/40: Giảm nhẹ → LOW/MEDIUM severity
- 20/60: Giảm trung bình → MEDIUM severity
- 20/100: Giảm nặng → HIGH severity
- <20/100: Rất nặng → HIGH severity (KHẨN CẤP)

🎨 ISHIHARA TEST (Mù màu):
- 11-12/12: Normal → LOW severity
- 7-10/12: Red-Green Deficiency → MEDIUM severity
- 4-6/12: Severe deficiency → HIGH severity
- 0-3/12: Possible total color blindness → HIGH severity

📐 AMSLER GRID (Hoàng điểm):
- Không biến dạng → LOW severity
- 1-2 điểm → MEDIUM severity
- 3+ vùng → HIGH severity (KHẨN CẤP)

🔄 ASTIGMATISM:
- Không có → LOW severity
- Nhẹ → LOW severity
- Trung bình → MEDIUM severity
- Nặng → HIGH severity

🔴🟢 DUOCHROME:
- Cân bằng → LOW severity
- Một mắt bất thường → MEDIUM severity
- Cả hai bất thường → HIGH severity`
    : `You are Dr. Eva - Board-certified ophthalmologist with 15+ years experience.

MEDICAL ACCURACY STANDARD - 93% COMPLIANCE[object Object] Acuity):
- 20/20: Excellent → LOW severity
- 20/25-20/30: Normal → LOW severity
- 20/40: Mild reduction → LOW/MEDIUM severity
- 20/60: Moderate reduction → MEDIUM severity
- 20/100: Severe reduction → HIGH severity
- <20/100: Very severe → HIGH severity (URGENT)

🎨 ISHIHARA TEST (Color Blindness):
- 11-12/12: Normal → LOW severity
- 7-10/12: Red-Green Deficiency → MEDIUM severity
- 4-6/12: Severe deficiency → HIGH severity
- 0-3/12: Possible total color blindness → HIGH severity

📐 AMSLER GRID (Macula):
- No distortion → LOW severity
- 1-2 areas → MEDIUM severity
- 3+ areas → HIGH severity (URGENT)

🔄 ASTIGMATISM:
- None → LOW severity
- Mild → LOW severity
- Moderate → MEDIUM severity
- Severe → HIGH severity

🔴🟢 DUOCHROME:
- Balanced → LOW severity
- One eye abnormal → MEDIUM severity
- Both abnormal → HIGH severity`;

  const historyDigest = history
    .slice(0, 3)
    .map(
      (item: any) =>
        `- ${item.testType.toUpperCase()} (${new Date(item.date).toLocaleDateString()}): ${item.report?.severity || 'unknown'}`
    )
    .join('\n');

  const testSpecificInfo = getTestSpecificInfo(testType, testData, language);

  return `${baseInstruction}

TEST HISTORY (last 3):
${historyDigest || 'No previous tests'}

CURRENT TEST DATA:
${JSON.stringify(testData, null, 2)}

${testSpecificInfo}

OUTPUT FORMAT - Respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "confidence": <number 70-99>,
  "summary": "${isVi ? '<250-300 từ tiếng Việt phân tích lâm sàng>' : '<250-300 words clinical analysis>'}",
  "trend": "${isVi ? '<100 từ phân tích xu hướng>' : '<100 words trend analysis>'}",
  "causes": "${isVi ? '<80 từ nguyên nhân>' : '<80 words causes>'}",
  "recommendations": ["${isVi ? 'Khuyến nghị 1' : 'Recommendation 1'}", "${isVi ? 'Khuyến nghị 2' : 'Recommendation 2'}", ...],
  "severity": "LOW" | "MEDIUM" | "HIGH",
  "prediction": "${isVi ? '<80 từ tiên lượng>' : '<80 words prognosis>'}"
}`;
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
        ? `SNELLEN TEST ANALYSIS:
- Score: ${testData.score || 'N/A'}
- Accuracy: ${testData.accuracy || 'N/A'}%
- Correct: ${testData.correctAnswers || 0}/${testData.totalQuestions || 0}`
        : `SNELLEN TEST ANALYSIS:
- Score: ${testData.score || 'N/A'}
- Accuracy: ${testData.accuracy || 'N/A'}%
- Correct: ${testData.correctAnswers || 0}/${testData.totalQuestions || 0}`;

    case 'colorblind':
      return isVi
        ? `ISHIHARA TEST ANALYSIS:
- Correct plates: ${testData.correct || 0}/${testData.total || 12}
- Accuracy: ${testData.accuracy || 'N/A'}%
- Missed plates: ${JSON.stringify(testData.missedPlates || [])}`
        : `ISHIHARA TEST ANALYSIS:
- Correct plates: ${testData.correct || 0}/${testData.total || 12}
- Accuracy: ${testData.accuracy || 'N/A'}%
- Missed plates: ${JSON.stringify(testData.missedPlates || [])}`;

    case 'amsler':
      return isVi
        ? `AMSLER GRID ANALYSIS:
- Distortions: ${testData.distortions || 'none'}
- Location: ${testData.location || 'N/A'}
- Severity: ${testData.severity || 'unknown'}`
        : `AMSLER GRID ANALYSIS:
- Distortions: ${testData.distortions || 'none'}
- Location: ${testData.location || 'N/A'}
- Severity: ${testData.severity || 'unknown'}`;

    case 'astigmatism':
      return isVi
        ? `ASTIGMATISM TEST ANALYSIS:
- Right eye: ${testData.rightEye?.hasAstigmatism ? 'Yes' : 'No'} (${testData.rightEye?.type || 'N/A'})
- Left eye: ${testData.leftEye?.hasAstigmatism ? 'Yes' : 'No'} (${testData.leftEye?.type || 'N/A'})`
        : `ASTIGMATISM TEST ANALYSIS:
- Right eye: ${testData.rightEye?.hasAstigmatism ? 'Yes' : 'No'} (${testData.rightEye?.type || 'N/A'})
- Left eye: ${testData.leftEye?.hasAstigmatism ? 'Yes' : 'No'} (${testData.leftEye?.type || 'N/A'})`;

    case 'duochrome':
      return isVi
        ? `DUOCHROME TEST ANALYSIS:
- Right eye: ${testData.rightEye?.result || 'N/A'}
- Left eye: ${testData.leftEye?.result || 'N/A'}`
        : `DUOCHROME TEST ANALYSIS:
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
        description: 'Diagnostic confidence (0.85-0.99)',
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
        description: 'Severity level',
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

