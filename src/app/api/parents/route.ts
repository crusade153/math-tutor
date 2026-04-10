import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const rows = await sql`
    SELECT u.id, u.username, u.name, u.phone, u.is_active, u.created_at,
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
    const { name, username, phone, password } = body;

    if (!name || !username) {
      return NextResponse.json(
        { error: "이름과 아이디는 필수입니다." },
        { status: 400 }
      );
    }

    const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "이미 사용 중인 아이디입니다." },
        { status: 409 }
      );
    }

    const finalPassword = password || "1234";

    const rows = await sql`
      INSERT INTO users (username, password, name, role, phone, must_change_pw)
      VALUES (${username}, ${finalPassword}, ${name}, 'parent', ${phone ?? null}, false)
      RETURNING id, username, name, phone, created_at
    `;

    return NextResponse.json(
      { data: { ...rows[0], password: finalPassword } },
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
