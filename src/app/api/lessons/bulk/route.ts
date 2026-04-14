import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

interface LessonInput {
  class_id: number;
  lesson_date: string;
  start_time: string;
  end_time: string;
  topic?: string | null;
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { lessons } = body as { lessons: LessonInput[] };

    if (!Array.isArray(lessons) || lessons.length === 0) {
      return NextResponse.json({ error: "등록할 수업이 없습니다." }, { status: 400 });
    }

    for (const l of lessons) {
      if (!l.class_id || !l.lesson_date || !l.start_time || !l.end_time) {
        return NextResponse.json({ error: "반, 날짜, 시작/종료 시간은 필수입니다." }, { status: 400 });
      }
    }

    // Insert one by one within a single async flow (Neon serverless doesn't support multi-row VALUES easily)
    let count = 0;
    for (const l of lessons) {
      await sql`
        INSERT INTO lessons (class_id, lesson_date, start_time, end_time, topic)
        VALUES (${l.class_id}, ${l.lesson_date}, ${l.start_time}, ${l.end_time}, ${l.topic ?? null})
      `;
      count++;
    }

    return NextResponse.json({ data: { count } }, { status: 201 });
  } catch (err) {
    console.error("Bulk create lessons error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
