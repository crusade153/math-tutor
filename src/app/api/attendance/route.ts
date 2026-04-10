import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");
  const studentId = searchParams.get("studentId");

  if (lessonId) {
    const rows = await sql`
      SELECT a.*, s.name AS student_name, s.grade
      FROM attendance a
      JOIN students s ON s.id = a.student_id
      WHERE a.lesson_id = ${parseInt(lessonId)}
      ORDER BY s.name
    `;
    return NextResponse.json({ data: rows });
  }

  if (studentId) {
    // 학부모는 본인 자녀만
    if (session.role === "parent") {
      const child = await sql`
        SELECT id FROM students WHERE id = ${parseInt(studentId)} AND parent_id = ${session.userId}
      `;
      if (child.length === 0) {
        return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
      }
    }

    const rows = await sql`
      SELECT a.*, l.lesson_date, l.start_time, l.end_time, c.name AS class_name
      FROM attendance a
      JOIN lessons l ON l.id = a.lesson_id
      JOIN classes c ON c.id = l.class_id
      WHERE a.student_id = ${parseInt(studentId)}
      ORDER BY l.lesson_date DESC, l.start_time DESC
      LIMIT 30
    `;
    return NextResponse.json({ data: rows });
  }

  return NextResponse.json({ error: "lessonId 또는 studentId가 필요합니다." }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { lesson_id, student_id, status } = body;

    const ALLOWED = ["present", "absent", "late", "excused"];
    if (!ALLOWED.includes(status)) {
      return NextResponse.json({ error: "잘못된 상태값입니다." }, { status: 400 });
    }

    await sql`
      INSERT INTO attendance (lesson_id, student_id, status, method, checked_at)
      VALUES (${lesson_id}, ${student_id}, ${status}, 'manual', NOW())
      ON CONFLICT (lesson_id, student_id)
      DO UPDATE SET status = EXCLUDED.status, method = 'manual', checked_at = NOW()
    `;

    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    console.error("Attendance error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
