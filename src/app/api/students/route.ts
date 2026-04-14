import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (session.role === "admin") {
    const rows = await sql`
      SELECT s.*, u.name AS parent_name, u.username AS parent_email,
             u.phone AS parent_phone
      FROM students s
      LEFT JOIN users u ON u.id = s.parent_id
      WHERE s.deleted_at IS NULL
      ORDER BY s.name
    `;
    return NextResponse.json({ data: rows });
  } else {
    // 학부모: 본인 자녀만 (pin 제외)
    const rows = await sql`
      SELECT s.id, s.parent_id, s.name, s.grade, s.school,
             s.is_active, s.created_at, s.deleted_at
      FROM students s
      WHERE s.parent_id = ${session.userId} AND s.deleted_at IS NULL
      ORDER BY s.name
    `;
    return NextResponse.json({ data: rows });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, grade, school, parent_id, pin } = body;

    if (!name || !grade) {
      return NextResponse.json(
        { error: "이름과 학년은 필수입니다." },
        { status: 400 }
      );
    }

    if (pin && !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN은 4자리 숫자여야 합니다." },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO students (name, grade, school, parent_id, pin)
      VALUES (${name}, ${grade}, ${school ?? null}, ${parent_id ?? null}, ${pin ?? null})
      RETURNING *
    `;

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Create student error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
