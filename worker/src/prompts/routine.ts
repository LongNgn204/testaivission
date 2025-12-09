/**
 * ============================================================
 * 📅 Routine Prompts - LANGUAGE CONSISTENT
 * ============================================================
 * 
 * Prompts for personalized routine generation
 */

export function createRoutinePrompt(
  answers: any,
  language: 'vi' | 'en'
): string {
  const isVi = language === 'vi';

  if (isVi) {
    return `Bạn đang tạo lịch trình chăm sóc mắt 7 ngày cá nhân hóa dựa trên hồ sơ người dùng.

HỒ SƠ NGƯỜI DÙNG:
- Làm việc với máy tính thường xuyên: ${answers.worksWithComputer}
- Đeo kính: ${answers.wearsGlasses}
- Mục tiêu chính: ${answers.goal}

QUY TẮC:
1. Thứ Hai đến Thứ Sáu: PHẢI có đúng HAI hoạt động: một 'test' và một 'exercise'.
2. Thứ Bảy và Chủ Nhật: PHẢI là ngày nghỉ (mảng rỗng []).
3. Tên hoạt động ('name') phải bằng TIẾNG VIỆT.
4. Khóa 'test': 'snellen', 'colorblind', 'astigmatism', 'amsler', 'duochrome'
5. Khóa 'exercise': 'exercise_20_20_20', 'exercise_palming', 'exercise_focus_change'

ĐỊNH DẠNG ĐẦU RA - Chỉ trả về JSON hợp lệ (không markdown, không giải thích):
{
  "Monday": [{"type": "test", "key": "snellen", "name": "Kiểm tra thị lực Snellen", "duration": 3}, {"type": "exercise", "key": "exercise_20_20_20", "name": "Bài tập 20-20-20", "duration": 2}],
  "Tuesday": [...],
  "Wednesday": [...],
  "Thursday": [...],
  "Friday": [...],
  "Saturday": [],
  "Sunday": []
}`;
  } else {
    return `You are creating a personalized 7-day eye care routine based on the user's profile.

USER PROFILE:
- Works with computers frequently: ${answers.worksWithComputer}
- Wears glasses: ${answers.wearsGlasses}
- Main goal: ${answers.goal}

RULES:
1. Monday to Friday: MUST contain exactly TWO activities: one 'test' and one 'exercise'.
2. Saturday and Sunday: MUST be rest days (empty array []).
3. Activity 'name' must be in ENGLISH.
4. Test 'key': 'snellen', 'colorblind', 'astigmatism', 'amsler', 'duochrome'
5. Exercise 'key': 'exercise_20_20_20', 'exercise_palming', 'exercise_focus_change'

OUTPUT FORMAT - Respond with ONLY valid JSON (no markdown, no explanation):
{
  "Monday": [{"type": "test", "key": "snellen", "name": "Snellen Visual Acuity Test", "duration": 3}, {"type": "exercise", "key": "exercise_20_20_20", "name": "20-20-20 Eye Break", "duration": 2}],
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
        description: "Must be 'test' or 'exercise'",
      },
      key: {
        type: 'string',
        description:
          "Unique key (e.g., 'snellen', 'exercise_20_20_20')",
      },
      name: {
        type: 'string',
        description: 'Display name of the activity',
      },
      duration: {
        type: 'number',
        description: 'Estimated duration in minutes',
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
      },
      Tuesday: {
        type: 'array',
        items: activitySchema,
      },
      Wednesday: {
        type: 'array',
        items: activitySchema,
      },
      Thursday: {
        type: 'array',
        items: activitySchema,
      },
      Friday: {
        type: 'array',
        items: activitySchema,
      },
      Saturday: {
        type: 'array',
        items: activitySchema,
      },
      Sunday: {
        type: 'array',
        items: activitySchema,
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
