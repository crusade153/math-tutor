import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest, hashPassword } from "@/lib/auth";
import { generateTempPassword } from "@/lib/utils";

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
    SELECT u.id, u.email, u.name, u.phone, u.is_active,
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
  const { name, phone, is_active, resetPassword } = body;

  if (resetPassword) {
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);
    await sql`
      UPDATE users SET password_hash = ${passwordHash}, must_change_pw = true
      WHERE id = ${parseInt(id)}
    `;
    return NextResponse.json({ data: { tempPassword } });
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
