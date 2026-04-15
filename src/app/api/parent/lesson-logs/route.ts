import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "parent") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  if (!studentId || isNaN(parseInt(studentId))) {
    return NextResponse.json({ error: "studentId가 필요합니다." }, { status: 400 });
  }

  // 본인 자녀인지 확인
  const child = await sql`
    SELECT id FROM students WHERE id = ${parseInt(studentId)} AND parent_id = ${session.userId}
  `;
  if (child.length === 0) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const rows = await sql`
    SELECT
      ll.id,
      ll.lesson_id,
      ll.content,
      ll.homework,
      ll.shared_with_parent,
      ll.updated_at,
      l.lesson_date,
      l.start_time,
      l.end_time,
      l.topic,
      c.name AS class_name
    FROM lesson_logs ll
    JOIN lessons l ON l.id = ll.lesson_id
    JOIN classes c ON c.id = l.class_id
    JOIN class_students cs ON cs.class_id = l.class_id AND cs.student_id = ${parseInt(studentId)}
    WHERE ll.shared_with_parent = true
    ORDER BY l.lesson_date DESC, l.start_time DESC
    LIMIT 50
  `;

  return NextResponse.json({ data: rows });
}
