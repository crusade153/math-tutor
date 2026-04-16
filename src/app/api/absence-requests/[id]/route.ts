import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, admin_note } = body;

  const ALLOWED = ["pending", "confirmed", "rejected"];
  if (!status || !ALLOWED.includes(status)) {
    return NextResponse.json({ error: "잘못된 상태값입니다." }, { status: 400 });
  }

  // 신고 정보 조회
  const existing = await sql`SELECT * FROM absence_requests WHERE id = ${parseInt(id)}`;
  if (existing.length === 0) {
    return NextResponse.json({ error: "신고를 찾을 수 없습니다." }, { status: 404 });
  }

  await sql`
    UPDATE absence_requests
    SET status = ${status},
        admin_note = COALESCE(${admin_note ?? null}, admin_note)
    WHERE id = ${parseInt(id)}
  `;

  // 확인(confirmed) 처리 시 출결을 'excused'로 자동 처리
  if (status === "confirmed") {
    const req = existing[0] as { student_id: number; absence_date: string; lesson_id: number | null };

    if (req.lesson_id) {
      // lesson_id가 있으면 해당 수업 정확히 처리
      await sql`
        UPDATE attendance
        SET status = 'excused'
        WHERE student_id = ${req.student_id}
          AND lesson_id = ${req.lesson_id}
          AND status IN ('absent', 'present', 'late')
      `;
      // 출결 레코드가 없으면 새로 생성
      const existing2 = await sql`
        SELECT id FROM attendance
        WHERE student_id = ${req.student_id} AND lesson_id = ${req.lesson_id}
      `;
      if (existing2.length === 0) {
        await sql`
          INSERT INTO attendance (lesson_id, student_id, status, method)
          VALUES (${req.lesson_id}, ${req.student_id}, 'excused', 'manual')
          ON CONFLICT (lesson_id, student_id) DO UPDATE SET status = 'excused'
        `;
      }
    } else {
      // lesson_id 없는 경우 날짜 기준으로 처리
      const rawDate = req.absence_date as unknown;
      const dateStr = rawDate instanceof Date
        ? rawDate.toISOString().slice(0, 10)
        : String(rawDate ?? "").slice(0, 10);
      await sql`
        UPDATE attendance
        SET status = 'excused'
        WHERE student_id = ${req.student_id}
          AND lesson_id IN (
            SELECT id FROM lessons WHERE lesson_date = ${dateStr}
          )
          AND status = 'absent'
      `;
    }
  }

  return NextResponse.json({ data: { ok: true } });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;

  // 학부모는 pending 상태인 자기 자녀 신고만 삭제 가능
  if (session.role === "parent") {
    const existing = await sql`
      SELECT ar.id FROM absence_requests ar
      JOIN students s ON s.id = ar.student_id
      WHERE ar.id = ${parseInt(id)} AND s.parent_id = ${session.userId} AND ar.status = 'pending'
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "삭제할 수 없습니다." }, { status: 403 });
    }
  }

  await sql`DELETE FROM absence_requests WHERE id = ${parseInt(id)}`;
  return NextResponse.json({ data: { ok: true } });
}
