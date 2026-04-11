import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const rows = await sql`
    SELECT u.id, u.username, u.password, u.name, u.phone, u.is_active,
           json_agg(
             json_build_object('id', s.id, 'name', s.name, 'grade', s.grade, 'school', s.school)
             ORDER BY s.name
           ) FILTER (WHERE s.id IS NOT NULL AND s.deleted_at IS NULL) AS students
    FROM users u
    LEFT JOIN students s ON s.parent_id = u.id
    WHERE u.id = ${parseInt(id)} AND u.role = 'parent' AND u.deleted_at IS NULL
    GROUP BY u.id
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "학부모를 찾을 수 없습니다." }, { status: 404 });
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
  const { name, phone, is_active, password } = body;

  if (password !== undefined) {
    await sql`
      UPDATE users SET password = ${password}, must_change_pw = false
      WHERE id = ${parseInt(id)}
    `;
    return NextResponse.json({ data: { ok: true } });
  }

  await sql`
    UPDATE users
    SET name = COALESCE(${name ?? null}, name),
        phone = COALESCE(${phone ?? null}, phone),
        is_active = COALESCE(${is_active ?? null}, is_active)
    WHERE id = ${parseInt(id)} AND role = 'parent'
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
  await sql`
    UPDATE users
    SET deleted_at = NOW()
    WHERE id = ${parseInt(id)} AND role = 'parent'
  `;

  return NextResponse.json({ data: { ok: true } });
}
