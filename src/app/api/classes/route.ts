import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const rows = await sql`
    SELECT c.*,
           COUNT(cs.student_id)::int AS student_count
    FROM classes c
    LEFT JOIN class_students cs ON cs.class_id = c.id
    WHERE c.deleted_at IS NULL AND c.is_active = true
    GROUP BY c.id
    ORDER BY c.name
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
    const { name, grade_level, schedule_desc, max_students } = body;

    if (!name) {
      return NextResponse.json(
        { error: "반 이름은 필수입니다." },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO classes (name, grade_level, schedule_desc, max_students)
      VALUES (${name}, ${grade_level ?? null}, ${schedule_desc ?? null}, ${max_students ?? 10})
      RETURNING *
    `;

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Create class error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
