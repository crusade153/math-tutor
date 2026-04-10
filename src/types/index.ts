// 사용자 역할
export type Role = "admin" | "parent";

// JWT 페이로드
export interface JWTPayload {
  userId: number;
  username: string;
  name: string;
  role: Role;
  mustChangePw: boolean;
}

// DB 행 타입
export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  role: Role;
  phone: string | null;
  must_change_pw: boolean;
  is_active: boolean;
  created_at: string;
  deleted_at: string | null;
}

export interface Student {
  id: number;
  parent_id: number | null;
  name: string;
  grade: string;
  school: string | null;
  is_active: boolean;
  created_at: string;
  deleted_at: string | null;
}

export interface Class {
  id: number;
  name: string;
  grade_level: string | null;
  schedule_desc: string | null;
  max_students: number;
  is_active: boolean;
  created_at: string;
  deleted_at: string | null;
}

export interface Lesson {
  id: number;
  class_id: number;
  lesson_date: string;
  start_time: string;
  end_time: string;
  topic: string | null;
  status: "scheduled" | "completed" | "cancelled" | "makeup";
  note: string | null;
  created_at: string;
}

export interface Attendance {
  id: number;
  lesson_id: number;
  student_id: number;
  status: "present" | "absent" | "late" | "excused";
  method: "qr" | "manual" | null;
  checked_at: string | null;
}

export interface QRToken {
  id: number;
  token: string;
  lesson_id: number;
  expires_at: string;
  is_used: boolean;
  created_at: string;
}

export interface LessonLog {
  id: number;
  lesson_id: number;
  content: string;
  homework: string | null;
  shared_with_parent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: number;
  student_id: number;
  class_id: number | null;
  exam_name: string;
  score: number;
  max_score: number;
  exam_date: string;
  notes: string | null;
  created_at: string;
}

export interface ConsultationSlot {
  id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

export interface Consultation {
  id: number;
  slot_id: number;
  parent_id: number;
  student_id: number | null;
  type: "in_person" | "phone" | "video";
  topic: string | null;
  status: "requested" | "confirmed" | "completed" | "cancelled";
  parent_memo: string | null;
  teacher_memo: string | null;
  created_at: string;
}

export interface Inquiry {
  id: number;
  name: string;
  phone: string;
  grade: string | null;
  message: string | null;
  status: "new" | "contacted" | "enrolled" | "declined";
  created_at: string;
}

export interface Tuition {
  id: number;
  student_id: number;
  month: string;
  amount: number;
  is_paid: boolean;
  paid_at: string | null;
  note: string | null;
  created_at: string;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  target: "all" | "class" | "individual";
  target_id: number | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// API 응답 타입
export type ApiResponse<T> =
  | { data: T; error?: never }
  | { error: string; data?: never };

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};
