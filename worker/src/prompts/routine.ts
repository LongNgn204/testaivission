/**
 * ============================================================
 * 📅 Routine Prompts
 * ============================================================
 * 
 * Prompts for personalized routine generation
 */

export function createRoutinePrompt(
  answers: any,
  language: 'vi' | 'en'
): string {
  const isVi = language === 'vi';
  const langInstruction = isVi ? 'VIETNAMESE' : 'ENGLISH';

  return `You are creating a personalized 7-day eye care routine based on the user's profile.

USER PROFILE:
- Works with computers frequently: ${answers.worksWithComputer}
- Wears glasses: ${answers.wearsGlasses}
- Main goal: ${answers.goal}

RULES:
1. Structure:
   - Monday to Friday: MUST contain exactly TWO activities: one 'test' and one 'exercise'.
   - Saturday and Sunday: MUST be rest days (empty array []).
2. Personalization:
   - Select appropriate 'test' and 'exercise' based on user's profile.
   - If computer work: prioritize 'exercise_palming' or 'exercise_20_20_20'.
   - If monitoring condition: prioritize relevant tests.
3. Language: Activity 'name' must be in ${langInstruction}.
4. Keys:
   - Test 'key': 'snellen', 'colorblind', 'astigmatism', 'amsler', 'duochrome'
   - Exercise 'key': 'exercise_20_20_20', 'exercise_palming', 'exercise_focus_change'
5. Format:
   - 'type': 'test' or 'exercise'
   - Provide user-friendly 'name' and estimated 'duration' in minutes
   - Respond ONLY with valid JSON`;
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

