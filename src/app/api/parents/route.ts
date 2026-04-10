import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest, hashPassword } from "@/lib/auth";
import { generateTempPassword } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const rows = await sql`
    SELECT u.id, u.email, u.name, u.phone, u.is_active, u.created_at,
           json_agg(
             json_build_object('id', s.id, 'name', s.name, 'grade', s.grade)
             ORDER BY s.name
           ) FILTER (WHERE s.id IS NOT NULL AND s.deleted_at IS NULL) AS students
    FROM users u
    LEFT JOIN students s ON s.parent_id = u.id
    WHERE u.role = 'parent' AND u.deleted_at IS NULL
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `;

  return NextResponse.json({ data: rows });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, phone } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "이름과 이메일은 필수입니다." },
        { status: 400 }
      );
    }

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다." },
        { status: 409 }
      );
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    const rows = await sql`
      INSERT INTO users (email, password_hash, name, role, phone, must_change_pw)
      VALUES (${email}, ${passwordHash}, ${name}, 'parent', ${phone ?? null}, true)
      RETURNING id, email, name, phone, created_at
    `;

    return NextResponse.json(
      { data: { ...rows[0], tempPassword } },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create parent error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
