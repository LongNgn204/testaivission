/**
 * ============================================================
 * 📅 Routine Prompts - PERSONALIZED CARE v2.0
 * ============================================================
 * 
 * Nâng cấp lịch tập cá nhân:
 * - Thêm giải thích y khoa cho mỗi hoạt động
 * - Cá nhân hóa theo hồ sơ bệnh nhân
 * - Ngôn ngữ thuần túy, không pha trộn
 */

export function createRoutinePrompt(
  answers: any,
  language: 'vi' | 'en'
): string {
  const isVi = language === 'vi';

  if (isVi) {
    return `Bạn là TIẾN SĨ - BÁC SĨ EVA, đang tạo lịch trình chăm sóc mắt 7 ngày CÁ NHÂN HÓA.

═══════════════════════════════════════════════════════════════════════════════
👤 HỒ SƠ BỆNH NHÂN:
═══════════════════════════════════════════════════════════════════════════════
- Làm việc với máy tính thường xuyên: ${answers.worksWithComputer ? 'CÓ → Nguy cơ cao hội chứng thị giác máy tính (CVS)' : 'KHÔNG → Nguy cơ CVS thấp'}
- Đeo kính: ${answers.wearsGlasses ? 'CÓ → Cần kiểm tra định kỳ và bài tập điều tiết' : 'KHÔNG → Tập trung phòng ngừa'}
- Mục tiêu chính: ${answers.goal}

═══════════════════════════════════════════════════════════════════════════════
📋 DANH SÁCH HOẠT ĐỘNG VÀ LỢI ÍCH Y KHOA:
═══════════════════════════════════════════════════════════════════════════════

🔬 CÁC BÀI KIỂM TRA (type: 'test'):
• snellen: "Kiểm tra thị lực Snellen" - Đánh giá độ sắc nét thị giác, phát hiện sớm tật khúc xạ
• colorblind: "Kiểm tra sắc giác Ishihara" - Đánh giá khả năng phân biệt màu sắc
• astigmatism: "Kiểm tra loạn thị" - Phát hiện bất thường độ cong giác mạc
• amsler: "Kiểm tra lưới Amsler" - Sàng lọc sớm bệnh lý hoàng điểm (quan trọng cho người trên 40 tuổi)
• duochrome: "Kiểm tra cân bằng hai màu" - Đánh giá độ chính xác kính đang đeo

💪 CÁC BÀI TẬP (type: 'exercise'):
• exercise_20_20_20: "Bài tập nghỉ 20-20-20" - Giảm mỏi mắt kỹ thuật số, thư giãn cơ thể mi
• exercise_palming: "Bài tập thư giãn lòng bàn tay" - Giảm căng thẳng mắt, tăng tuần hoàn máu
• exercise_focus_change: "Bài tập thay đổi tiêu điểm" - Tập cơ điều tiết, cải thiện khả năng nhìn xa-gần

═══════════════════════════════════════════════════════════════════════════════
📏 QUY TẮC TẠO LỊCH:
═══════════════════════════════════════════════════════════════════════════════
1. Thứ Hai đến Thứ Sáu: PHẢI có đúng HAI hoạt động - một 'test' và một 'exercise'
2. Thứ Bảy và Chủ Nhật: PHẢI là ngày nghỉ (mảng rỗng [])
3. Phân bố test hợp lý: Không lặp lại cùng một test trong tuần
4. Ưu tiên hoạt động phù hợp với hồ sơ:
   - Nếu làm việc với máy tính: Ưu tiên exercise_20_20_20
   - Nếu đeo kính: Ưu tiên duochrome và exercise_focus_change
   - Nếu trên 40 tuổi: Ưu tiên amsler
5. Tên hoạt động ('name') bằng TIẾNG VIỆT THUẦN TÚY

═══════════════════════════════════════════════════════════════════════════════
📄 ĐỊNH DẠNG ĐẦU RA - CHỈ TRẢ VỀ JSON HỢP LỆ (không markdown, không giải thích):
═══════════════════════════════════════════════════════════════════════════════
{
  "Monday": [
    {"type": "test", "key": "snellen", "name": "Kiểm tra thị lực Snellen", "duration": 3, "benefit": "Đánh giá độ sắc nét thị giác"},
    {"type": "exercise", "key": "exercise_20_20_20", "name": "Bài tập nghỉ 20-20-20", "duration": 2, "benefit": "Giảm mỏi mắt kỹ thuật số"}
  ],
  "Tuesday": [...],
  "Wednesday": [...],
  "Thursday": [...],
  "Friday": [...],
  "Saturday": [],
  "Sunday": []
}`;
  } else {
    return `You are DR. EVA, MD, PhD - creating a PERSONALIZED 7-day eye care routine.

═══════════════════════════════════════════════════════════════════════════════
👤 PATIENT PROFILE:
═══════════════════════════════════════════════════════════════════════════════
- Works with computers frequently: ${answers.worksWithComputer ? 'YES → High risk of Computer Vision Syndrome (CVS)' : 'NO → Low CVS risk'}
- Wears glasses: ${answers.wearsGlasses ? 'YES → Needs regular check-ups and accommodation exercises' : 'NO → Focus on prevention'}
- Main goal: ${answers.goal}

═══════════════════════════════════════════════════════════════════════════════
📋 ACTIVITY LIST AND MEDICAL BENEFITS:
═══════════════════════════════════════════════════════════════════════════════

🔬 TESTS (type: 'test'):
• snellen: "Snellen Visual Acuity Test" - Assesses visual sharpness, early detection of refractive errors
• colorblind: "Ishihara Color Vision Test" - Evaluates color discrimination ability
• astigmatism: "Astigmatism Screening Test" - Detects corneal curvature abnormalities
• amsler: "Amsler Grid Test" - Early screening for macular diseases (important for those over 40)
• duochrome: "Duochrome Balance Test" - Evaluates current glasses accuracy

💪 EXERCISES (type: 'exercise'):
• exercise_20_20_20: "20-20-20 Eye Break" - Reduces digital eye strain, relaxes ciliary muscles
• exercise_palming: "Palm Relaxation Exercise" - Reduces eye tension, improves blood circulation
• exercise_focus_change: "Focus Shifting Exercise" - Trains accommodation muscles, improves near-far vision

═══════════════════════════════════════════════════════════════════════════════
📏 ROUTINE CREATION RULES:
═══════════════════════════════════════════════════════════════════════════════
1. Monday to Friday: MUST contain exactly TWO activities - one 'test' and one 'exercise'
2. Saturday and Sunday: MUST be rest days (empty array [])
3. Distribute tests logically: Don't repeat the same test within the week
4. Prioritize activities matching profile:
   - If computer work: Priority exercise_20_20_20
   - If wears glasses: Priority duochrome and exercise_focus_change
   - If over 40: Priority amsler
5. Activity 'name' in PURE ENGLISH ONLY

═══════════════════════════════════════════════════════════════════════════════
📄 OUTPUT FORMAT - RESPOND WITH ONLY VALID JSON (no markdown, no explanation):
═══════════════════════════════════════════════════════════════════════════════
{
  "Monday": [
    {"type": "test", "key": "snellen", "name": "Snellen Visual Acuity Test", "duration": 3, "benefit": "Assesses visual sharpness"},
    {"type": "exercise", "key": "exercise_20_20_20", "name": "20-20-20 Eye Break", "duration": 2, "benefit": "Reduces digital eye strain"}
  ],
  "Tuesday": [...],
  "Wednesday": [...],
  "Thursday": [...],
  "Friday": [...],
  "Saturday": [],
  "Sunday": []
}`;
  }
}

export function createRoutineSchema(): any {
  const activitySchema = {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['test', 'exercise'],
        description: "Activity type: 'test' or 'exercise'",
      },
      key: {
        type: 'string',
        description: "Unique key (snellen, colorblind, astigmatism, amsler, duochrome, exercise_20_20_20, exercise_palming, exercise_focus_change)",
      },
      name: {
        type: 'string',
        description: 'Display name of the activity in appropriate language',
      },
      duration: {
        type: 'number',
        description: 'Estimated duration in minutes (2-5 minutes per activity)',
      },
      benefit: {
        type: 'string',
        description: 'Short medical benefit explanation (optional)',
      },
    },
    required: ['type', 'key', 'name', 'duration'],
  };

  return {
    type: 'object',
    properties: {
      Monday: {
        type: 'array',
        items: activitySchema,
        description: 'Must contain exactly 2 activities: 1 test + 1 exercise',
      },
      Tuesday: {
        type: 'array',
        items: activitySchema,
        description: 'Must contain exactly 2 activities: 1 test + 1 exercise',
      },
      Wednesday: {
        type: 'array',
        items: activitySchema,
        description: 'Must contain exactly 2 activities: 1 test + 1 exercise',
      },
      Thursday: {
        type: 'array',
        items: activitySchema,
        description: 'Must contain exactly 2 activities: 1 test + 1 exercise',
      },
      Friday: {
        type: 'array',
        items: activitySchema,
        description: 'Must contain exactly 2 activities: 1 test + 1 exercise',
      },
      Saturday: {
        type: 'array',
        items: activitySchema,
        description: 'Rest day - must be empty array',
      },
      Sunday: {
        type: 'array',
        items: activitySchema,
        description: 'Rest day - must be empty array',
      },
    },
    required: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
  };
}

