import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// UTC 날짜를 KST로 변환하여 포맷
export function formatKST(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    ...options,
  });
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatTime(timeStr: string): string {
  // "HH:MM:SS" → "HH:MM"
  return timeStr.slice(0, 5);
}

// YYYY-MM 형식 (수업료 월)
export function currentMonth(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 7);
}

export function calculateAttendanceRate(
  attended: number,
  total: number
): string {
  if (total === 0) return "0%";
  return `${Math.round((attended / total) * 100)}%`;
}

// 무작위 임시 비밀번호 생성 (8자리)
export function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

export function gradeLabel(grade: string): string {
  const map: Record<string, string> = {
    elem1: "초등 1학년",
    elem2: "초등 2학년",
    elem3: "초등 3학년",
    elem4: "초등 4학년",
    elem5: "초등 5학년",
    elem6: "초등 6학년",
    mid1: "중학교 1학년",
    mid2: "중학교 2학년",
    mid3: "중학교 3학년",
    high1: "고등학교 1학년",
    high2: "고등학교 2학년",
    high3: "고등학교 3학년",
  };
  return map[grade] ?? grade;
}

export const GRADE_OPTIONS = [
  { value: "elem1", label: "초등 1학년" },
  { value: "elem2", label: "초등 2학년" },
  { value: "elem3", label: "초등 3학년" },
  { value: "elem4", label: "초등 4학년" },
  { value: "elem5", label: "초등 5학년" },
  { value: "elem6", label: "초등 6학년" },
  { value: "mid1", label: "중학교 1학년" },
  { value: "mid2", label: "중학교 2학년" },
  { value: "mid3", label: "중학교 3학년" },
  { value: "high1", label: "고등학교 1학년" },
  { value: "high2", label: "고등학교 2학년" },
  { value: "high3", label: "고등학교 3학년" },
];
