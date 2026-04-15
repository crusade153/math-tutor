import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { createLessonSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");
  const year = searchParams.get("year") ?? new Date().getFullYear().toString();
  const month = searchParams.get("month") ?? String(new Date().getMonth() + 1).padStart(2, "0");

  const startDate = `${year}-${month.padStart(2, "0")}-01`;
  const endDate = `${year}-${month.padStart(2, "0")}-31`;

  let rows;
  if (classId) {
    rows = await sql`
      SELECT l.*, c.name AS class_name
      FROM lessons l
      JOIN classes c ON c.id = l.class_id
      WHERE l.class_id = ${parseInt(classId)}
        AND l.lesson_date BETWEEN ${startDate} AND ${endDate}
      ORDER BY l.lesson_date, l.start_time
    `;
  } else {
    rows = await sql`
      SELECT l.*, c.name AS class_name
      FROM lessons l
      JOIN classes c ON c.id = l.class_id
      WHERE l.lesson_date BETWEEN ${startDate} AND ${endDate}
      ORDER BY l.lesson_date, l.start_time
    `;
  }

  return NextResponse.json({ data: rows });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createLessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { class_id, lesson_date, start_time, end_time, topic, note } = parsed.data;

    const rows = await sql`
      INSERT INTO lessons (class_id, lesson_date, start_time, end_time, topic, note)
      VALUES (${class_id}, ${lesson_date}, ${start_time}, ${end_time}, ${topic ?? null}, ${note ?? null})
      RETURNING *
    `;

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Create lesson error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
