/**
 * ============================================================
 * 📋 Report Prompts - DEEP MEDICAL TRAINING v2.1
 * ============================================================
 * 
 * Báo cáo y khoa chi tiết:
 * - Summary và phân tích không giới hạn cứng
 * - Khuyến nghị đầy đủ, chi tiết
 * - Kiến thức chuẩn quốc tế (WHO, AAO)
 * - Ngôn ngữ thuần túy, dịch sát nghĩa
 */

const DOCTOR_PERSONA_VI = `
Bạn là TIẾN SĨ - BÁC SĨ EVA, Chuyên gia Nhãn khoa cao cấp với hơn 20 năm kinh nghiệm lâm sàng và nghiên cứu.
- Phân tích kết quả test như một bác sĩ chuyên khoa đang khám bệnh nhân thực tế
- Luôn giải thích CƠ CHẾ BỆNH SINH đằng sau mỗi kết quả
- So sánh với TIÊU CHUẨN Y KHOA QUỐC TẾ (WHO, Hiệp hội Nhãn khoa Hoa Kỳ AAO)
- Đưa ra TIÊN LƯỢNG dài hạn và KẾ HOẠCH THEO DÕI cụ thể
- Ngôn ngữ: TIẾNG VIỆT THUẦN TÚY 100%, không dùng bất kỳ từ tiếng Anh nào
- Dịch sát nghĩa: "Myopia" = "Cận thị", "AMD" = "Thoái hóa hoàng điểm tuổi già"
`;

const DOCTOR_PERSONA_EN = `
You are DR. EVA, MD, PhD - A Senior Board-Certified Ophthalmologist with over 20 years of clinical and research experience.
- Analyze test results as if examining a real patient in your clinic
- Always explain the PATHOPHYSIOLOGY behind each result
- Compare with INTERNATIONAL MEDICAL STANDARDS (WHO, American Academy of Ophthalmology AAO)
- Provide LONG-TERM PROGNOSIS and SPECIFIC FOLLOW-UP PLAN
- Language: PURE ENGLISH ONLY 100%, no Vietnamese words whatsoever
- Use proper medical terminology with clear explanations for patients
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

═══════════════════════════════════════════════════════════════════════════════
🏥 TIÊU CHUẨN Y KHOA QUỐC TẾ - ĐỘ CHÍNH XÁC TỐI THIỂU 95%:
═══════════════════════════════════════════════════════════════════════════════

🔬 KIỂM TRA THỊ LỰC SNELLEN (Tiêu chuẩn WHO/AAO):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 20/20 (6/6): Thị lực xuất sắc → Mức độ THẤP
  - Khúc xạ bình thường, không cần can thiệp
  - Tái khám định kỳ 12-24 tháng
  
• 20/25-20/30 (6/7.5-6/9): Thị lực bình thường → Mức độ THẤP
  - Có thể có tật khúc xạ nhẹ chưa được điều chỉnh
  - Khuyến nghị đo khúc xạ chi tiết
  
• 20/40 (6/12): Giảm thị lực nhẹ → Mức độ THẤP/TRUNG BÌNH
  - Ngưỡng tối thiểu để lái xe theo quy định nhiều nước
  - Cần đeo kính điều chỉnh
  
• 20/60 (6/18): Giảm thị lực trung bình → Mức độ TRUNG BÌNH
  - Ảnh hưởng đáng kể sinh hoạt hàng ngày
  - Cần khám chuyên khoa để loại trừ bệnh lý
  
• 20/100 (6/30): Giảm thị lực nặng → Mức độ CAO
  - Khó khăn trong đọc sách, nhận diện khuôn mặt
  - Khám khẩn cấp tìm nguyên nhân bệnh lý
  
• <20/200 (6/60): Mù pháp lý → Mức độ CAO (KHẨN CẤP)
  - Theo tiêu chuẩn WHO, đây là ngưỡng mù pháp lý
  - Cần can thiệp y tế và hỗ trợ xã hội

🎨 KIỂM TRA MÙ MÀU ISHIHARA (38 bảng đầy đủ / 14 bảng rút gọn):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 11-12/12 (91-100%): Nhận thức màu bình thường → Mức độ THẤP
  - Tế bào nón đỏ, xanh lá, xanh dương hoạt động tốt
  - Không hạn chế nghề nghiệp
  
• 7-10/12 (58-83%): Thiếu hụt sắc giác đỏ-xanh lá → Mức độ TRUNG BÌNH
  - Có thể là Protanomaly (yếu nhạy đỏ) hoặc Deuteranomaly (yếu nhạy xanh lá)
  - Hạn chế: phi công, điện lực, thiết kế đồ họa
  - Kiểm tra bổ sung: Anomaloscope, Farnsworth D-15
  
• 4-6/12 (33-50%): Thiếu hụt sắc giác nặng → Mức độ CAO
  - Có thể là Protanopia hoặc Deuteranopia (mất hoàn toàn tế bào nón)
  - Ảnh hưởng đáng kể cuộc sống: phân biệt đèn giao thông, chọn quần áo
  
• 0-3/12 (0-25%): Nghi ngờ mù màu hoàn toàn → Mức độ CAO
  - Cần loại trừ Achromatopsia (mù màu hoàn toàn bẩm sinh)
  - Kiểm tra bổ sung: điện võng mạc ERG

📐 KIỂM TRA LƯỚI AMSLER (Hoàng điểm - Trung tâm thị lực):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Không biến dạng, đường kẻ thẳng rõ ràng → Mức độ THẤP
  - Hoàng điểm khỏe mạnh, biểu mô sắc tố nguyên vẹn
  - Tái khám định kỳ 6-12 tháng nếu trên 50 tuổi
  
• 1-2 vùng biến dạng (méo nhẹ) → Mức độ TRUNG BÌNH
  - Dấu hiệu sớm thoái hóa hoàng điểm (AMD dạng khô)
  - Có thể có Drusen (tích tụ lipid dưới võng mạc)
  - Khám OCT trong 2 tuần để đánh giá cấu trúc
  
• 3+ vùng biến dạng hoặc điểm đen → Mức độ CAO (KHẨN CẤP)
  - Nghi ngờ AMD dạng ướt (tân mạch dưới võng mạc)
  - Hoặc phù hoàng điểm, xuất huyết hoàng điểm
  - KHÁM NGAY trong 24-48 giờ - Có thể cần tiêm kháng VEGF

🔄 KIỂM TRA LOẠN THỊ (Astigmatism):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Không phát hiện loạn thị → Mức độ THẤP
  - Giác mạc có độ cong đều đặn (cầu hoàn hảo)
  
• Loạn thị nhẹ (≤1.00D) → Mức độ THẤP
  - Thường không ảnh hưởng thị lực đáng kể
  - Có thể điều chỉnh bằng kính trụ nếu cần
  
• Loạn thị trung bình (1.00-2.00D) → Mức độ TRUNG BÌNH
  - Nhìn mờ ở mọi khoảng cách, mỏi mắt khi làm việc lâu
  - Cần đeo kính hoặc kính tiếp xúc toric
  
• Loạn thị nặng (>2.00D) → Mức độ CAO
  - Ảnh hưởng đáng kể chất lượng thị lực
  - Cân nhắc phẫu thuật khúc xạ nếu đủ điều kiện

🔴🟢 KIỂM TRA HAI MÀU DUOCHROME (Cân bằng khúc xạ):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Cân bằng (đỏ = xanh lá rõ nét bằng nhau) → Mức độ THẤP
  - Kính đang đeo đúng số
  - Điểm hội tụ nằm chính xác trên võng mạc
  
• Đỏ rõ hơn → Cận thị chưa được điều chỉnh đủ → Mức độ TRUNG BÌNH
  - Cần tăng độ cận hoặc giảm độ viễn trong kính
  
• Xanh lá rõ hơn → Cận thị bị điều chỉnh quá mức HOẶC viễn thị → Mức độ TRUNG BÌNH
  - Cần giảm độ cận hoặc tăng độ viễn trong kính
  
• Bất thường cả hai mắt, kèm nhức đầu → Mức độ CAO
  - Cần khám khúc xạ đầy đủ với thuốc liệt điều tiết`
    : `${DOCTOR_PERSONA_EN}

═══════════════════════════════════════════════════════════════════════════════
🏥 INTERNATIONAL MEDICAL STANDARDS - MINIMUM 95% ACCURACY:
═══════════════════════════════════════════════════════════════════════════════

🔬 SNELLEN VISUAL ACUITY TEST (WHO/AAO Standards):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 20/20 (6/6): Excellent visual acuity → LOW severity
  - Normal refraction, no intervention needed
  - Routine follow-up every 12-24 months
  
• 20/25-20/30 (6/7.5-6/9): Normal visual acuity → LOW severity
  - May have mild uncorrected refractive error
  - Recommend detailed refraction assessment
  
• 20/40 (6/12): Mild visual impairment → LOW/MEDIUM severity
  - Minimum threshold for driving in many countries
  - Corrective lenses required
  
• 20/60 (6/18): Moderate visual impairment → MEDIUM severity
  - Significant impact on daily activities
  - Comprehensive eye exam to rule out pathology
  
• 20/100 (6/30): Severe visual impairment → HIGH severity
  - Difficulty reading, recognizing faces
  - Urgent evaluation to identify underlying cause
  
• <20/200 (6/60): Legal blindness → HIGH severity (URGENT)
  - Meets WHO definition of legal blindness
  - Requires medical intervention and social support

🎨 ISHIHARA COLOR BLINDNESS TEST (Full 38 plates / Screening 14 plates):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 11-12/12 (91-100%): Normal color vision → LOW severity
  - Red, green, and blue cone cells functioning properly
  - No occupational restrictions
  
• 7-10/12 (58-83%): Red-Green deficiency → MEDIUM severity
  - May be Protanomaly (weak red sensitivity) or Deuteranomaly (weak green sensitivity)
  - Restrictions: pilot, electrician, graphic design
  - Additional testing: Anomaloscope, Farnsworth D-15
  
• 4-6/12 (33-50%): Severe color deficiency → HIGH severity
  - May be Protanopia or Deuteranopia (complete cone cell loss)
  - Significant life impact: traffic lights, clothing selection
  
• 0-3/12 (0-25%): Suspected complete color blindness → HIGH severity
  - Rule out Achromatopsia (congenital complete color blindness)
  - Additional testing: Electroretinogram ERG

📐 AMSLER GRID TEST (Macula - Central Vision Center):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• No distortion, straight lines clear → LOW severity
  - Healthy macula, intact retinal pigment epithelium
  - Routine check every 6-12 months if over 50 years
  
• 1-2 distorted areas (mild waviness) → MEDIUM severity
  - Early sign of macular degeneration (dry AMD)
  - May have Drusen (lipid deposits under retina)
  - OCT scan within 2 weeks to evaluate structure
  
• 3+ distorted areas or blind spots → HIGH severity (URGENT)
  - Suspected wet AMD (choroidal neovascularization)
  - Or macular edema, macular hemorrhage
  - URGENT EXAM within 24-48 hours - May need anti-VEGF injection

🔄 ASTIGMATISM TEST:
━━━━━━━━━━━━━━━━━━━━━
• No astigmatism detected → LOW severity
  - Cornea has uniform curvature (perfect sphere)
  
• Mild astigmatism (≤1.00D) → LOW severity
  - Usually no significant visual impact
  - Correctable with cylindrical lenses if needed
  
• Moderate astigmatism (1.00-2.00D) → MEDIUM severity
  - Blurry vision at all distances, eye strain with prolonged work
  - Glasses or toric contact lenses required
  
• Severe astigmatism (>2.00D) → HIGH severity
  - Significant impact on visual quality
  - Consider refractive surgery if eligible

🔴🟢 DUOCHROME TEST (Refractive Balance):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Balanced (red = green equally clear) → LOW severity
  - Current glasses are correctly prescribed
  - Focal point precisely on retina
  
• Red clearer → Undercorrected myopia → MEDIUM severity
  - Need to increase minus power or decrease plus power
  
• Green clearer → Overcorrected myopia OR hyperopia → MEDIUM severity
  - Need to decrease minus power or increase plus power
  
• Both eyes abnormal with headache → HIGH severity
  - Comprehensive refraction with cycloplegic drops needed`;

  const historyDigest = history
    .slice(0, 5)
    .map((item: any) => {
      const date = new Date(item.date).toLocaleDateString(isVi ? 'vi-VN' : 'en-US');
      const severity = item.report?.severity || (isVi ? 'không rõ' : 'unknown');
      const confidence = item.report?.confidence || 'N/A';
      return `- ${item.testType.toUpperCase()} (${date}): ${isVi ? 'Mức độ' : 'Severity'} ${severity}, ${isVi ? 'Độ tin cậy' : 'Confidence'} ${confidence}%`;
    })
    .join('\n');

  const testSpecificInfo = getTestSpecificInfo(testType, testData, language);

  const outputFormat = isVi
    ? `═══════════════════════════════════════════════════════════════════════════════
📄 ĐỊNH DẠNG ĐẦU RA - CHỈ TRẢ VỀ JSON HỢP LỆ (không markdown, không giải thích):
═══════════════════════════════════════════════════════════════════════════════
{
  "confidence": <số từ 75-99, dựa trên độ rõ ràng của kết quả test>,
  "summary": "<TIẾNG VIỆT THUẦN TÚY. Phân tích lâm sàng đầy đủ bao gồm: đánh giá kết quả, cơ chế bệnh sinh, so sánh tiêu chuẩn quốc tế, ảnh hưởng cuộc sống, tiên lượng - trả lời chi tiết không giới hạn>",
  "trend": "<TIẾNG VIỆT. Phân tích xu hướng so với lịch sử, dự đoán diễn biến - không giới hạn độ dài>",
  "causes": "<TIẾNG VIỆT. Phân tích nguyên nhân: di truyền, môi trường, lối sống, bệnh lý nền - không giới hạn>",
  "recommendations": [
    "Khuyến nghị 1: <chi tiết, cụ thể, có thời gian thực hiện>",
    "Khuyến nghị 2: <bao gồm liều lượng, tần suất nếu là thuốc/bổ sung>",
    "Khuyến nghị 3: <lý do y khoa đằng sau khuyến nghị>",
    "... 12-15 khuyến nghị chi tiết"
  ],
  "severity": "LOW" | "MEDIUM" | "HIGH",
  "prediction": "<TIẾNG VIỆT. Tiên lượng 6-12 tháng, yếu tố ảnh hưởng, kế hoạch theo dõi - không giới hạn độ dài>"
}`
    : `═══════════════════════════════════════════════════════════════════════════════
📄 OUTPUT FORMAT - RESPOND WITH ONLY VALID JSON (no markdown, no explanation):
═══════════════════════════════════════════════════════════════════════════════
{
  "confidence": <number 75-99, based on test result clarity>,
  "summary": "<PURE ENGLISH. Comprehensive clinical analysis: result assessment, pathophysiology, international standards comparison, daily life impact, prognosis - respond thoroughly with no strict limit>",
  "trend": "<ENGLISH. Trend analysis vs history, predicted progression - no strict word limit>",
  "causes": "<ENGLISH. Cause analysis: genetic, environmental, lifestyle, conditions - no strict limit>",
  "recommendations": [
    "Recommendation 1: <detailed, specific, with timeline>",
    "Recommendation 2: <include dosage, frequency if medication/supplement>",
    "Recommendation 3: <medical rationale behind recommendation>",
    "... 12-15 detailed recommendations"
  ],
  "severity": "LOW" | "MEDIUM" | "HIGH",
  "prediction": "<ENGLISH. 6-12 month prognosis, influencing factors, follow-up plan - no strict limit>"
}`;

  const historyLabel = isVi ? '📊 LỊCH SỬ KIỂM TRA (5 lần gần nhất):' : '📊 TEST HISTORY (last 5):';
  const noHistory = isVi ? 'Đây là lần kiểm tra đầu tiên - không có dữ liệu so sánh' : 'This is the first test - no comparison data available';
  const currentDataLabel = isVi ? '🔍 DỮ LIỆU KIỂM TRA HIỆN TẠI:' : '🔍 CURRENT TEST DATA:';

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
        ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PHÂN TÍCH CHI TIẾT KIỂM TRA THỊ LỰC SNELLEN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Điểm số thị lực: ${testData.score || 'Không xác định'}
- Độ chính xác: ${testData.accuracy || 'Không xác định'}%
- Số câu trả lời đúng: ${testData.correctAnswers || 0}/${testData.totalQuestions || 0}
- Cấp độ đạt được: ${testData.level || 'Không xác định'}

⚕️ LƯU Ý LÂM SÀNG:
- So sánh với tiêu chuẩn 20/20 (thị lực bình thường)
- Đánh giá nhu cầu điều chỉnh khúc xạ
- Xem xét các yếu tố ảnh hưởng: ánh sáng, khoảng cách, mỏi mắt`
        : `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DETAILED SNELLEN VISUAL ACUITY ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Visual acuity score: ${testData.score || 'Not determined'}
- Accuracy: ${testData.accuracy || 'Not determined'}%
- Correct answers: ${testData.correctAnswers || 0}/${testData.totalQuestions || 0}
- Level achieved: ${testData.level || 'Not determined'}

⚕️ CLINICAL NOTES:
- Compare against 20/20 standard (normal vision)
- Evaluate need for refractive correction
- Consider influencing factors: lighting, distance, eye fatigue`;

    case 'colorblind':
      return isVi
        ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PHÂN TÍCH CHI TIẾT KIỂM TRA MÙ MÀU ISHIHARA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Số bảng đúng: ${testData.correct || 0}/${testData.total || 12}
- Độ chính xác: ${testData.accuracy || 'Không xác định'}%
- Các bảng nhận diện sai: ${JSON.stringify(testData.missedPlates || [])}
- Loại thiếu hụt sắc giác: ${testData.deficiencyType || 'Cần đánh giá thêm'}

⚕️ LƯU Ý LÂM SÀNG:
- Phân biệt Protanopia (mù đỏ) vs Deuteranopia (mù xanh lá)
- Đánh giá ảnh hưởng nghề nghiệp và cuộc sống
- Xem xét xét nghiệm bổ sung: Farnsworth D-15, Anomaloscope`
        : `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DETAILED ISHIHARA COLOR BLINDNESS ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Correct plates: ${testData.correct || 0}/${testData.total || 12}
- Accuracy: ${testData.accuracy || 'Not determined'}%
- Misidentified plates: ${JSON.stringify(testData.missedPlates || [])}
- Deficiency type: ${testData.deficiencyType || 'Requires further evaluation'}

⚕️ CLINICAL NOTES:
- Differentiate Protanopia (red blindness) vs Deuteranopia (green blindness)
- Assess occupational and lifestyle impact
- Consider additional testing: Farnsworth D-15, Anomaloscope`;

    case 'amsler':
      return isVi
        ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PHÂN TÍCH CHI TIẾT KIỂM TRA LƯỚI AMSLER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Phát hiện biến dạng: ${testData.distortions || 'Không có'}
- Vị trí bất thường: ${testData.location || 'Không xác định'}
- Mức độ nghiêm trọng ban đầu: ${testData.severity || 'Chưa đánh giá'}
- Có điểm mù: ${testData.blindSpots ? 'Có - CẦN KHÁM NGAY' : 'Không'}

⚕️ LƯU Ý LÂM SÀNG:
- Đánh giá nguy cơ thoái hóa hoàng điểm (AMD)
- Theo dõi biến đổi hình ảnh trung tâm
- Khuyến nghị chụp OCT nếu có bất thường`
        : `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DETAILED AMSLER GRID ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Distortion detected: ${testData.distortions || 'None'}
- Abnormality location: ${testData.location || 'Not specified'}
- Initial severity assessment: ${testData.severity || 'Not evaluated'}
- Blind spots present: ${testData.blindSpots ? 'Yes - URGENT EXAM NEEDED' : 'No'}

⚕️ CLINICAL NOTES:
- Assess risk of macular degeneration (AMD)
- Monitor central vision changes
- Recommend OCT imaging if abnormalities present`;

    case 'astigmatism':
      return isVi
        ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PHÂN TÍCH CHI TIẾT KIỂM TRA LOẠN THỊ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Mắt phải: ${testData.rightEye?.hasAstigmatism ? 'Có loạn thị' : 'Không loạn thị'} 
  • Loại: ${testData.rightEye?.type || 'Không xác định'}
  • Trục: ${testData.rightEye?.axis || 'Không xác định'}°
- Mắt trái: ${testData.leftEye?.hasAstigmatism ? 'Có loạn thị' : 'Không loạn thị'}
  • Loại: ${testData.leftEye?.type || 'Không xác định'}
  • Trục: ${testData.leftEye?.axis || 'Không xác định'}°

⚕️ LƯU Ý LÂM SÀNG:
- Phân loại: Thuận quy tắc vs Nghịch quy tắc vs Chéo
- Đánh giá nhu cầu kính trụ hoặc kính tiếp xúc toric
- Xem xét phẫu thuật khúc xạ nếu loạn thị cao và ổn định`
        : `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DETAILED ASTIGMATISM ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Right eye: ${testData.rightEye?.hasAstigmatism ? 'Astigmatism present' : 'No astigmatism'}
  • Type: ${testData.rightEye?.type || 'Not determined'}
  • Axis: ${testData.rightEye?.axis || 'Not determined'}°
- Left eye: ${testData.leftEye?.hasAstigmatism ? 'Astigmatism present' : 'No astigmatism'}
  • Type: ${testData.leftEye?.type || 'Not determined'}
  • Axis: ${testData.leftEye?.axis || 'Not determined'}°

⚕️ CLINICAL NOTES:
- Classification: With-the-rule vs Against-the-rule vs Oblique
- Evaluate need for cylindrical lenses or toric contacts
- Consider refractive surgery if high astigmatism is stable`;

    case 'duochrome':
      return isVi
        ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PHÂN TÍCH CHI TIẾT KIỂM TRA HAI MÀU:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Mắt phải: ${testData.rightEye?.result || 'Không xác định'}
  • Màu rõ hơn: ${testData.rightEye?.clearer || 'Cân bằng'}
  • Đánh giá: ${testData.rightEye?.assessment || 'Chưa đánh giá'}
- Mắt trái: ${testData.leftEye?.result || 'Không xác định'}
  • Màu rõ hơn: ${testData.leftEye?.clearer || 'Cân bằng'}
  • Đánh giá: ${testData.leftEye?.assessment || 'Chưa đánh giá'}

⚕️ LƯU Ý LÂM SÀNG:
- Đỏ rõ hơn = Cận thị chưa điều chỉnh đủ (cần tăng độ âm)
- Xanh lá rõ hơn = Cận thị điều chỉnh quá hoặc viễn thị (cần giảm độ âm)
- Cân bằng = Kính phù hợp, điểm hội tụ đúng trên võng mạc`
        : `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DETAILED DUOCHROME ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Right eye: ${testData.rightEye?.result || 'Not determined'}
  • Clearer color: ${testData.rightEye?.clearer || 'Balanced'}
  • Assessment: ${testData.rightEye?.assessment || 'Not evaluated'}
- Left eye: ${testData.leftEye?.result || 'Not determined'}
  • Clearer color: ${testData.leftEye?.clearer || 'Balanced'}
  • Assessment: ${testData.leftEye?.assessment || 'Not evaluated'}

⚕️ CLINICAL NOTES:
- Red clearer = Undercorrected myopia (need more minus power)
- Green clearer = Overcorrected myopia or hyperopia (need less minus power)
- Balanced = Appropriate prescription, focal point correctly on retina`;

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
          ? 'Độ tin cậy chẩn đoán (75-99), dựa trên độ rõ ràng của kết quả'
          : 'Diagnostic confidence (75-99), based on result clarity',
      },
      summary: {
        type: 'string',
        description: language === 'vi'
          ? '400-500 từ TIẾNG VIỆT THUẦN TÚY. Phân tích lâm sàng sâu sắc với cơ chế bệnh sinh, so sánh tiêu chuẩn quốc tế, tiên lượng'
          : '400-500 words PURE ENGLISH. Deep clinical analysis with pathophysiology, international standard comparison, prognosis',
      },
      trend: {
        type: 'string',
        description: language === 'vi'
          ? '100-150 từ TIẾNG VIỆT. Phân tích xu hướng so với lịch sử, dự đoán diễn biến'
          : '100-150 words ENGLISH. Trend analysis vs history, predicted progression',
      },
      causes: {
        type: 'string',
        description: language === 'vi'
          ? '100-120 từ TIẾNG VIỆT. Phân tích nguyên nhân: di truyền, môi trường, lối sống'
          : '100-120 words ENGLISH. Cause analysis: genetic, environmental, lifestyle',
      },
      recommendations: {
        type: 'array',
        items: { type: 'string' },
        description: language === 'vi'
          ? '12-15 khuyến nghị chi tiết TIẾNG VIỆT, bao gồm thời gian thực hiện và lý do y khoa'
          : '12-15 detailed recommendations ENGLISH, including timeline and medical rationale',
      },
      severity: {
        type: 'string',
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        description: language === 'vi' ? 'Mức độ nghiêm trọng theo tiêu chuẩn WHO' : 'Severity level per WHO standards',
      },
      prediction: {
        type: 'string',
        description: language === 'vi'
          ? '100-120 từ TIẾNG VIỆT. Tiên lượng 6-12 tháng, kế hoạch theo dõi cụ thể'
          : '100-120 words ENGLISH. 6-12 month prognosis, specific follow-up plan',
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

