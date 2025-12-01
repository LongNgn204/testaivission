import { z } from 'zod';

// User login schema
export const userLoginSchema = z.object({
  name: z
    .string({ required_error: 'Vui lòng nhập tên' })
    .trim()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên quá dài'),
  age: z
    .string({ required_error: 'Vui lòng nhập tuổi' })
    .trim()
    .refine((v) => /^\d+$/.test(v), 'Tuổi phải là số')
    .transform((v) => Number(v))
    .refine((v) => v >= 5 && v <= 120, 'Tuổi phải từ 5-120')
    .transform((v) => String(v)),
  phone: z
    .string({ required_error: 'Vui lòng nhập số điện thoại' })
    .trim()
    .regex(/^0\d{9,10}$/, 'Số điện thoại không hợp lệ (VD: 0912345678)'),
});

export type UserLoginInput = z.infer<typeof userLoginSchema>;

// Reminder form schema
export const reminderSchema = z.object({
  type: z.enum(['test', 'exercise', 'custom'], { required_error: 'Chọn loại nhắc nhở' }),
  title: z
    .string({ required_error: 'Nhập tiêu đề' })
    .trim()
    .min(2, 'Tiêu đề quá ngắn')
    .max(100, 'Tiêu đề quá dài'),
  message: z
    .string({ required_error: 'Nhập nội dung' })
    .trim()
    .min(5, 'Nội dung quá ngắn')
    .max(280, 'Nội dung quá dài (tối đa 280 ký tự)'),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly'], { required_error: 'Chọn tần suất' }),
  time: z
    .string({ required_error: 'Chọn thời gian' })
    .regex(/^\d{2}:\d{2}$/i, 'Thời gian không hợp lệ (HH:MM)'),
  enabled: z.boolean().optional(),
});

export type ReminderInput = z.infer<typeof reminderSchema>;

// Personalized setup answers schema
export const setupAnswersSchema = z.object({
  worksWithComputer: z.enum(['Yes', 'No'], { required_error: 'Chọn một phương án' }),
  wearsGlasses: z.enum(['Yes', 'No'], { required_error: 'Chọn một phương án' }),
  goal: z.enum(['General Check-up', 'Monitor a Condition', 'Check for Retinal Issues'], { required_error: 'Chọn mục tiêu' }),
});

export type SetupAnswersInput = z.infer<typeof setupAnswersSchema>;

