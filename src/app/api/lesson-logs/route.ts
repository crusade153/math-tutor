import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { createLessonLogSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");

  if (!lessonId || isNaN(parseInt(lessonId))) {
    return NextResponse.json({ error: "lessonId가 필요합니다." }, { status: 400 });
  }

  const rows = await sql`
    SELECT ll.*, l.lesson_date, l.topic, c.name AS class_name
    FROM lesson_logs ll
    JOIN lessons l ON l.id = ll.lesson_id
    JOIN classes c ON c.id = l.class_id
    WHERE ll.lesson_id = ${parseInt(lessonId)}
  `;

  return NextResponse.json({ data: rows[0] ?? null });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createLessonLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { lesson_id, content, homework, shared_with_parent } = parsed.data;

    const rows = await sql`
      INSERT INTO lesson_logs (lesson_id, content, homework, shared_with_parent)
      VALUES (${lesson_id}, ${content}, ${homework ?? null}, ${shared_with_parent ?? false})
      ON CONFLICT (lesson_id)
      DO UPDATE SET
        content = EXCLUDED.content,
        homework = EXCLUDED.homework,
        shared_with_parent = EXCLUDED.shared_with_parent,
        updated_at = NOW()
      RETURNING *
    `;

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Create lesson log error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
