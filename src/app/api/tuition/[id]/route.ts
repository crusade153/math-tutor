import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { updateTuitionSchema } from "@/lib/schemas";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const tid = parseInt(id);
  if (isNaN(tid)) {
    return NextResponse.json({ error: "잘못된 ID입니다." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }

  const parsed = updateTuitionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }
  const { amount, is_paid, note } = parsed.data;

  // 보낸 필드만 부분 갱신. paid_at은 is_paid 토글에 따라 자동.
  // note는 명시적으로 null을 보내 지울 수 있도록 키 존재 여부로 분기.
  const noteProvided = Object.prototype.hasOwnProperty.call(parsed.data, "note");

  const rows = await sql`
    UPDATE tuition
    SET amount  = COALESCE(${amount ?? null}, amount),
        is_paid = COALESCE(${is_paid ?? null}, is_paid),
        paid_at = CASE
                    WHEN ${is_paid ?? null} = TRUE  AND paid_at IS NULL THEN NOW()
                    WHEN ${is_paid ?? null} = FALSE THEN NULL
                    ELSE paid_at
                  END,
        note    = CASE
                    WHEN ${noteProvided} THEN ${note ?? null}
                    ELSE note
                  END
    WHERE id = ${tid}
    RETURNING *
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "수업료를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ data: rows[0] });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const tid = parseInt(id);
  if (isNaN(tid)) {
    return NextResponse.json({ error: "잘못된 ID입니다." }, { status: 400 });
  }

  const rows = await sql`
    DELETE FROM tuition WHERE id = ${tid} RETURNING id
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "수업료를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ data: { ok: true } });
}
