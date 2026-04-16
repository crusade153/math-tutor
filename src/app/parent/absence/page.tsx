import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import AbsenceClient from "./AbsenceClient";

function normalizeDate(d: unknown): string {
  if (!d) return "";
  const s = d instanceof Date ? d.toISOString() : String(d);
  return s.slice(0, 10);
}

async function getData(parentId: number) {
  // 학부모의 자녀 목록
  const students = await sql`
    SELECT id, name, grade
    FROM students
    WHERE parent_id = ${parentId} AND deleted_at IS NULL AND is_active = TRUE
    ORDER BY name
  ` as Array<{ id: number; name: string; grade: string }>;

  if (students.length === 0) {
    return { students: [], lessonsByStudent: {}, requests: [] };
  }

  const studentIds = students.map((s) => s.id);

  // 각 학생의 예정된 수업 목록 (오늘 포함 미래 일정)
  const upcomingLessons = await sql`
    SELECT DISTINCT
      l.id,
      l.lesson_date,
      l.start_time,
      l.end_time,
      l.topic,
      c.name AS class_name,
      cs.student_id
    FROM lessons l
    JOIN classes c ON c.id = l.class_id
    JOIN class_students cs ON cs.class_id = l.class_id
    WHERE cs.student_id = ANY(${studentIds})
      AND l.lesson_date >= CURRENT_DATE
      AND l.status = 'scheduled'
    ORDER BY l.lesson_date ASC, l.start_time ASC
    LIMIT 60
  ` as Array<{
    id: number;
    lesson_date: unknown;
    start_time: string;
    end_time: string;
    topic: string | null;
    class_name: string;
    student_id: number;
  }>;

  // 학생별로 수업 그룹화
  const lessonsByStudent: Record<
    string,
    Array<{
      id: number;
      lesson_date: string;
      start_time: string;
      end_time: string;
      topic: string | null;
      class_name: string;
    }>
  > = {};

  for (const lesson of upcomingLessons) {
    const key = String(lesson.student_id);
    if (!lessonsByStudent[key]) lessonsByStudent[key] = [];
    lessonsByStudent[key].push({
      id: lesson.id,
      lesson_date: normalizeDate(lesson.lesson_date),
      start_time: String(lesson.start_time).slice(0, 5),
      end_time: String(lesson.end_time).slice(0, 5),
      topic: lesson.topic,
      class_name: lesson.class_name,
    });
  }

  // 기존 신고 내역
  const rawRequests = await sql`
    SELECT ar.*, s.name AS student_name,
           l.lesson_date AS lesson_date_raw,
           l.start_time AS lesson_start_time,
           l.end_time AS lesson_end_time,
           c.name AS lesson_class_name
    FROM absence_requests ar
    JOIN students s ON s.id = ar.student_id
    LEFT JOIN lessons l ON l.id = ar.lesson_id
    LEFT JOIN classes c ON c.id = l.class_id
    WHERE s.parent_id = ${parentId}
    ORDER BY ar.absence_date DESC, ar.created_at DESC
    LIMIT 30
  `;

  const requests = (rawRequests as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as number,
    student_id: r.student_id as number,
    student_name: r.student_name as string,
    absence_date: normalizeDate(r.absence_date),
    lesson_id: r.lesson_id as number | null,
    lesson_date: normalizeDate(r.lesson_date_raw),
    lesson_start_time: r.lesson_start_time ? String(r.lesson_start_time).slice(0, 5) : null,
    lesson_end_time: r.lesson_end_time ? String(r.lesson_end_time).slice(0, 5) : null,
    lesson_class_name: r.lesson_class_name as string | null,
    reason: r.reason as string | null,
    status: r.status as string,
    admin_note: r.admin_note as string | null,
    created_at: r.created_at as string,
  }));

  return { students, lessonsByStudent, requests };
}

export default async function AbsencePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "parent") redirect("/admin/dashboard");

  const data = await getData(session.userId);
  return <AbsenceClient {...data} />;
}
