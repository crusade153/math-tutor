import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const classId = searchParams.get("classId");

  if (studentId) {
    if (session.role === "parent") {
      const child = await sql`
        SELECT id FROM students WHERE id = ${parseInt(studentId)} AND parent_id = ${session.userId}
      `;
      if (child.length === 0) {
        return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
      }
    }

    const rows = await sql`
      SELECT sc.*, c.name AS class_name
      FROM scores sc
      LEFT JOIN classes c ON c.id = sc.class_id
      WHERE sc.student_id = ${parseInt(studentId)}
      ORDER BY sc.exam_date DESC
    `;
    return NextResponse.json({ data: rows });
  }

  if (classId && session.role === "admin") {
    const rows = await sql`
      SELECT sc.*, s.name AS student_name
      FROM scores sc
      JOIN students s ON s.id = sc.student_id
      WHERE sc.class_id = ${parseInt(classId)}
      ORDER BY sc.exam_date DESC, s.name
    `;
    return NextResponse.json({ data: rows });
  }

  // admin: 전체 성적
  if (session.role === "admin") {
    const rows = await sql`
      SELECT sc.*, s.name AS student_name, c.name AS class_name
      FROM scores sc
      JOIN students s ON s.id = sc.student_id
      LEFT JOIN classes c ON c.id = sc.class_id
      ORDER BY sc.exam_date DESC
      LIMIT 100
    `;
    return NextResponse.json({ data: rows });
  }

  return NextResponse.json({ error: "studentId가 필요합니다." }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { student_id, class_id, exam_name, score, max_score, exam_date, notes } = body;

    if (!student_id || !exam_name || score === undefined || !exam_date) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO scores (student_id, class_id, exam_name, score, max_score, exam_date, notes)
      VALUES (
        ${student_id},
        ${class_id ?? null},
        ${exam_name},
        ${score},
        ${max_score ?? 100},
        ${exam_date},
        ${notes ?? null}
      )
      RETURNING *
    `;

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Create score error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
