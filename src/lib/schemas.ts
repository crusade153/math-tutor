import { z } from "zod";

// 학생 생성
export const createStudentSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다.").max(50),
  grade: z.string().min(1, "학년은 필수입니다."),
  school: z.string().max(100).optional().nullable(),
  parent_id: z.number().int().positive().optional().nullable(),
  pin: z
    .string()
    .regex(/^\d{4}$/, "PIN은 4자리 숫자여야 합니다.")
    .optional()
    .nullable(),
});

// 원비 생성
export const createTuitionSchema = z.object({
  student_id: z.number().int().positive("학생 ID가 올바르지 않습니다."),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "월 형식은 YYYY-MM이어야 합니다."),
  amount: z.number().int().positive("금액은 0보다 커야 합니다."),
  note: z.string().max(500).optional().nullable(),
});

// 수업 생성
export const createLessonSchema = z.object({
  class_id: z.number().int().positive("반 ID가 올바르지 않습니다."),
  lesson_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식은 YYYY-MM-DD여야 합니다."),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "시작 시간 형식이 올바르지 않습니다."),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "종료 시간 형식이 올바르지 않습니다."),
  topic: z.string().max(200).optional().nullable(),
  note: z.string().max(1000).optional().nullable(),
  status: z
    .enum(["scheduled", "completed", "cancelled", "makeup"])
    .optional(),
});

// 출결 기록
export const createAttendanceSchema = z.object({
  lesson_id: z.number().int().positive("수업 ID가 올바르지 않습니다."),
  student_id: z.number().int().positive("학생 ID가 올바르지 않습니다."),
  status: z.enum(["present", "absent", "late", "excused"], {
    errorMap: () => ({ message: "잘못된 출결 상태입니다." }),
  }),
});

// 수업 일지 생성
export const createLessonLogSchema = z.object({
  lesson_id: z.number().int().positive("수업 ID가 올바르지 않습니다."),
  content: z.string().min(1, "수업 내용은 필수입니다.").max(2000),
  homework: z.string().max(1000).optional().nullable(),
  shared_with_parent: z.boolean().optional().default(false),
});

// 수업 일지 수정
export const updateLessonLogSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  homework: z.string().max(1000).optional().nullable(),
  shared_with_parent: z.boolean().optional(),
});
