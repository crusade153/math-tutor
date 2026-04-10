import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, teacher_memo } = body;

  const ALLOWED = ["requested", "confirmed", "completed", "cancelled"];
  if (status && !ALLOWED.includes(status)) {
    return NextResponse.json({ error: "잘못된 상태값입니다." }, { status: 400 });
  }

  // 학부모는 본인 면담만 취소 가능
  if (session.role === "parent") {
    if (status && status !== "cancelled") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    const rows = await sql`
      SELECT parent_id FROM consultations WHERE id = ${parseInt(id)}
    `;
    if (rows.length === 0 || (rows[0] as { parent_id: number }).parent_id !== session.userId) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
  }

  await sql`
    UPDATE consultations
    SET status = COALESCE(${status ?? null}, status),
        teacher_memo = COALESCE(${teacher_memo ?? null}, teacher_memo)
    WHERE id = ${parseInt(id)}
  `;

  // 취소 시 슬롯 다시 활성화
  if (status === "cancelled") {
    const consultation = await sql`SELECT slot_id FROM consultations WHERE id = ${parseInt(id)}`;
    if (consultation.length > 0) {
      await sql`UPDATE consultation_slots SET is_available = true WHERE id = ${(consultation[0] as { slot_id: number }).slot_id}`;
    }
  }

  return NextResponse.json({ data: { ok: true } });
}
