import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (session.role === "admin") {
    // 관리자: 전체 목록 (미처리 우선, 날짜 가까운 순)
    const rows = await sql`
      SELECT ar.*, s.name AS student_name, s.grade
      FROM absence_requests ar
      JOIN students s ON s.id = ar.student_id
      ORDER BY
        CASE ar.status WHEN 'pending' THEN 0 ELSE 1 END,
        ar.absence_date ASC,
        ar.created_at DESC
    `;
    return NextResponse.json({ data: rows });
  } else {
    // 학부모: 본인 자녀 목록만
    const rows = await sql`
      SELECT ar.*, s.name AS student_name, s.grade
      FROM absence_requests ar
      JOIN students s ON s.id = ar.student_id
      WHERE s.parent_id = ${session.userId}
      ORDER BY ar.absence_date DESC, ar.created_at DESC
    `;
    return NextResponse.json({ data: rows });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "parent") {
    return NextResponse.json({ error: "학부모만 결석 신고를 할 수 있습니다." }, { status: 403 });
  }

  const body = await request.json();
  const { student_id, absence_date, reason } = body;

  if (!student_id || !absence_date) {
    return NextResponse.json({ error: "학생과 날짜를 입력해주세요." }, { status: 400 });
  }

  // 본인 자녀 확인
  const check = await sql`
    SELECT id FROM students
    WHERE id = ${parseInt(student_id)} AND parent_id = ${session.userId} AND deleted_at IS NULL
  `;
  if (check.length === 0) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const rows = await sql`
    INSERT INTO absence_requests (student_id, absence_date, reason)
    VALUES (${parseInt(student_id)}, ${absence_date}, ${reason ?? null})
    RETURNING *
  `;
  return NextResponse.json({ data: rows[0] }, { status: 201 });
}
