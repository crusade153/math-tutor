import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (session.role === "admin") {
    // 관리자: 전체 목록 (미처리 우선, 날짜 가까운 순) + 수업 정보
    const rows = await sql`
      SELECT
        ar.*,
        s.name AS student_name,
        s.grade,
        l.lesson_date AS lesson_date,
        l.start_time  AS lesson_start_time,
        l.end_time    AS lesson_end_time,
        c.name        AS lesson_class_name
      FROM absence_requests ar
      JOIN students s ON s.id = ar.student_id
      LEFT JOIN lessons l ON l.id = ar.lesson_id
      LEFT JOIN classes c ON c.id = l.class_id
      ORDER BY
        CASE ar.status WHEN 'pending' THEN 0 ELSE 1 END,
        ar.absence_date ASC,
        ar.created_at DESC
    `;
    // DATE 정규화
    const data = (rows as Array<Record<string, unknown>>).map((r) => ({
      ...r,
      absence_date: r.absence_date instanceof Date
        ? r.absence_date.toISOString().slice(0, 10)
        : String(r.absence_date ?? "").slice(0, 10),
      lesson_date: r.lesson_date instanceof Date
        ? r.lesson_date.toISOString().slice(0, 10)
        : r.lesson_date ? String(r.lesson_date).slice(0, 10) : null,
      lesson_start_time: r.lesson_start_time ? String(r.lesson_start_time).slice(0, 5) : null,
      lesson_end_time: r.lesson_end_time ? String(r.lesson_end_time).slice(0, 5) : null,
    }));
    return NextResponse.json({ data });
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
  const { student_id, lesson_id, absence_date, reason } = body;

  if (!student_id || (!absence_date && !lesson_id)) {
    return NextResponse.json({ error: "학생과 결석할 수업을 선택해주세요." }, { status: 400 });
  }

  // 본인 자녀 확인
  const check = await sql`
    SELECT id FROM students
    WHERE id = ${parseInt(student_id)} AND parent_id = ${session.userId} AND deleted_at IS NULL
  `;
  if (check.length === 0) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  // lesson_id로 absence_date 확정
  let finalDate = absence_date;
  if (lesson_id) {
    const lessonRows = await sql`SELECT lesson_date FROM lessons WHERE id = ${parseInt(lesson_id)}`;
    if (lessonRows.length > 0) {
      const ld = lessonRows[0] as { lesson_date: unknown };
      const raw = ld.lesson_date;
      finalDate = raw instanceof Date ? raw.toISOString().slice(0, 10) : String(raw).slice(0, 10);
    }
  }

  // 동일 학생, 동일 수업 중복 신고 방지
  if (lesson_id) {
    const dup = await sql`
      SELECT id FROM absence_requests
      WHERE student_id = ${parseInt(student_id)} AND lesson_id = ${parseInt(lesson_id)}
    `;
    if (dup.length > 0) {
      return NextResponse.json({ error: "이미 해당 수업에 결석 신고가 접수되어 있습니다." }, { status: 400 });
    }
  }

  const rows = await sql`
    INSERT INTO absence_requests (student_id, lesson_id, absence_date, reason)
    VALUES (
      ${parseInt(student_id)},
      ${lesson_id ? parseInt(lesson_id) : null},
      ${finalDate},
      ${reason ?? null}
    )
    RETURNING *
  `;
  return NextResponse.json({ data: rows[0] }, { status: 201 });
}
