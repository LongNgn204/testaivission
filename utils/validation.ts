/**
 * ========================================
 * VALIDATION SCHEMAS (Zod)
 * ========================================
 * Centralized input validation schemas
 * Tuân thủ TypeScript strict mode
 */

import { z } from 'zod';
import { ValidationError } from './errors';

/**
 * User authentication schema
 */
export const UserAuthSchema = z.object({
  name: z.string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên không được vượt quá 100 ký tự')
    .trim(),
  phone: z.string()
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  age: z.number()
    .int('Tuổi phải là số nguyên')
    .min(5, 'Tuổi phải từ 5 trở lên')
    .max(120, 'Tuổi không hợp lệ'),
});

export type UserAuthInput = z.infer<typeof UserAuthSchema>;

/**
 * Chat message schema
 */
export const ChatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Tin nhắn không được trống')
    .max(2000, 'Tin nhắn quá dài (tối đa 2000 ký tự)'),
  context: z.object({
    lastTestResult: z.any().optional(),
    userProfile: z.any().optional(),
  }).optional(),
  language: z.enum(['vi', 'en']).default('vi'),
});

export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;

/**
 * Test result schema
 */
export const TestResultSchema = z.object({
  testType: z.enum(['snellen', 'colorblind', 'astigmatism', 'amsler', 'duochrome']),
  resultData: z.any(), // Flexible, sẽ validate riêng per test type
  report: z.object({
    id: z.string(),
    testType: z.string(),
    timestamp: z.string(),
    totalResponseTime: z.number(),
    confidence: z.number(),
    summary: z.string(),
    recommendations: z.array(z.string()),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  }),
});

export type TestResultInput = z.infer<typeof TestResultSchema>;

/**
 * Snellen test result schema
 */
export const SnellenResultSchema = z.object({
  score: z.enum(['20/20', '20/30', '20/40', '20/60', '20/100', 'Dưới 20/100']),
  accuracy: z.number().min(0).max(100),
  correctAnswers: z.number().int(),
  totalQuestions: z.number().int(),
  duration: z.number().int(),
  date: z.string(),
  rawAnswers: z.array(z.object({
    level: z.number(),
    size: z.number(),
    rotation: z.number(),
    correct: z.boolean(),
  })).optional(),
  stopCondition: z.enum(['all_passed', 'failed_threshold', 'max_extra_attempts', 'unknown']).optional(),
  levelAchieved: z.number().optional(),
  deviceInfo: z.string().optional(),
});

export type SnellenResultInput = z.infer<typeof SnellenResultSchema>;

/**
 * Color blind test result schema
 */
export const ColorBlindResultSchema = z.object({
  correct: z.number().int(),
  total: z.number().int(),
  accuracy: z.number().min(0).max(100),
  missedPlates: z.array(z.object({
    plate: z.number(),
    correctAnswer: z.string(),
    userAnswer: z.string(),
  })),
  type: z.enum(['Normal', 'Red-Green Deficiency', 'Possible Total Color Blindness']),
  severity: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']),
  date: z.string(),
  duration: z.number().int(),
  rawAnswers: z.array(z.object({
    plate: z.number(),
    userAnswer: z.string(),
    correct: z.boolean(),
  })).optional(),
  deviceInfo: z.string().optional(),
});

export type ColorBlindResultInput = z.infer<typeof ColorBlindResultSchema>;

/**
 * Helper function để validate input và throw ValidationError
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string = 'Input'
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields: Record<string, string[]> = {};

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!fields[path]) {
          fields[path] = [];
        }
        fields[path]!.push(err.message);
      });

      throw new ValidationError(`${context} không hợp lệ`, fields);
    }

    throw error;
  }
}

/**
 * Safe validation - trả về result object thay vì throw
 */
export function validateInputSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path]!.push(err.message);
      });

      return { success: false, errors };
    }

    return {
      success: false,
      errors: { _root: [String(error)] },
    };
  }
}

