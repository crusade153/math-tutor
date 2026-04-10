import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { currentMonth } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? currentMonth();

  const rows = await sql`
    SELECT t.*, s.name AS student_name, s.grade
    FROM tuition t
    JOIN students s ON s.id = t.student_id
    WHERE t.month = ${month}
    ORDER BY s.name
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
    const { student_id, month, amount, note } = body;

    if (!student_id || !month || !amount) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO tuition (student_id, month, amount, note)
      VALUES (${student_id}, ${month}, ${amount}, ${note ?? null})
      ON CONFLICT (student_id, month)
      DO UPDATE SET amount = EXCLUDED.amount, note = EXCLUDED.note
      RETURNING *
    `;

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Create tuition error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
