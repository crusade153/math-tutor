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
  const classId = parseInt(id);

  const classRows = await sql`
    SELECT * FROM classes WHERE id = ${classId} AND deleted_at IS NULL
  `;

  if (classRows.length === 0) {
    return NextResponse.json({ error: "반을 찾을 수 없습니다." }, { status: 404 });
  }

  const students = await sql`
    SELECT s.id, s.name, s.grade, s.school
    FROM class_students cs
    JOIN students s ON s.id = cs.student_id
    WHERE cs.class_id = ${classId} AND s.deleted_at IS NULL
    ORDER BY s.name
  `;

  return NextResponse.json({ data: { ...classRows[0], students } });
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
  const { name, grade_level, schedule_desc, max_students, is_active } = body;

  await sql`
    UPDATE classes
    SET name = COALESCE(${name ?? null}, name),
        grade_level = COALESCE(${grade_level ?? null}, grade_level),
        schedule_desc = COALESCE(${schedule_desc ?? null}, schedule_desc),
        max_students = COALESCE(${max_students ?? null}, max_students),
        is_active = COALESCE(${is_active ?? null}, is_active)
    WHERE id = ${parseInt(id)} AND deleted_at IS NULL
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
  await sql`UPDATE classes SET deleted_at = NOW() WHERE id = ${parseInt(id)}`;
  return NextResponse.json({ data: { ok: true } });
}
