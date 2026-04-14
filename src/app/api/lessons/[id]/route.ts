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
  const rows = await sql`
    SELECT l.*, c.name AS class_name
    FROM lessons l
    JOIN classes c ON c.id = l.class_id
    WHERE l.id = ${parseInt(id)}
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "수업을 찾을 수 없습니다." }, { status: 404 });
  }

  const attendance = await sql`
    SELECT a.*, s.name AS student_name
    FROM attendance a
    JOIN students s ON s.id = a.student_id
    WHERE a.lesson_id = ${parseInt(id)}
  `;

  return NextResponse.json({ data: { ...rows[0], attendance } });
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
  const { lesson_date, start_time, end_time, topic, note, status } = body;

  const ALLOWED_STATUSES = ["scheduled", "completed", "cancelled", "makeup"];
  if (status && !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "잘못된 상태값입니다." }, { status: 400 });
  }

  await sql`
    UPDATE lessons
    SET lesson_date = COALESCE(${lesson_date ?? null}, lesson_date),
        start_time = COALESCE(${start_time ?? null}, start_time),
        end_time = COALESCE(${end_time ?? null}, end_time),
        topic = COALESCE(${topic ?? null}, topic),
        note = COALESCE(${note ?? null}, note),
        status = COALESCE(${status ?? null}, status)
    WHERE id = ${parseInt(id)}
  `;

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
  await sql`DELETE FROM attendance WHERE lesson_id = ${parseInt(id)}`;
  await sql`DELETE FROM lessons WHERE id = ${parseInt(id)}`;
  return NextResponse.json({ data: { ok: true } });
}
