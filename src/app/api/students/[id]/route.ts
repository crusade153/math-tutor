import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const studentId = parseInt(id);

  const rows = await sql`
    SELECT s.*, u.name AS parent_name, u.username AS parent_email
    FROM students s
    LEFT JOIN users u ON u.id = s.parent_id
    WHERE s.id = ${studentId} AND s.deleted_at IS NULL
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });
  }

  // 학부모는 본인 자녀만 접근 가능
  if (session.role === "parent" && rows[0].parent_id !== session.userId) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  return NextResponse.json({ data: rows[0] });
}

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
  const { name, grade, school, parent_id, is_active } = body;
  const hasPin = "pin" in body;
  const pin: string | null = hasPin ? (body.pin || null) : null;

  if (hasPin && pin !== null && !/^\d{4}$/.test(pin)) {
    return NextResponse.json(
      { error: "PIN은 4자리 숫자여야 합니다." },
      { status: 400 }
    );
  }

  if (hasPin) {
    await sql`
      UPDATE students
      SET name = COALESCE(${name ?? null}, name),
          grade = COALESCE(${grade ?? null}, grade),
          school = COALESCE(${school ?? null}, school),
          parent_id = COALESCE(${parent_id ?? null}, parent_id),
          is_active = COALESCE(${is_active ?? null}, is_active),
          pin = ${pin}
      WHERE id = ${parseInt(id)} AND deleted_at IS NULL
    `;
  } else {
    await sql`
      UPDATE students
      SET name = COALESCE(${name ?? null}, name),
          grade = COALESCE(${grade ?? null}, grade),
          school = COALESCE(${school ?? null}, school),
          parent_id = COALESCE(${parent_id ?? null}, parent_id),
          is_active = COALESCE(${is_active ?? null}, is_active)
      WHERE id = ${parseInt(id)} AND deleted_at IS NULL
    `;
  }

  return NextResponse.json({ data: { ok: true } });
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
  await sql`
    UPDATE students SET deleted_at = NOW() WHERE id = ${parseInt(id)}
  `;

  return NextResponse.json({ data: { ok: true } });
}
