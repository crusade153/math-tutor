import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { updateLessonLogSchema } from "@/lib/schemas";
import { notifyUser } from "@/lib/notifications";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const logId = parseInt(id);
  if (isNaN(logId)) {
    return NextResponse.json({ error: "잘못된 ID입니다." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = updateLessonLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { content, homework, shared_with_parent } = parsed.data;

    const rows = await sql`
      UPDATE lesson_logs
      SET
        content = COALESCE(${content ?? null}, content),
        homework = COALESCE(${homework ?? null}, homework),
        shared_with_parent = COALESCE(${shared_with_parent ?? null}, shared_with_parent),
        updated_at = NOW()
      WHERE id = ${logId}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "수업 일지를 찾을 수 없습니다." }, { status: 404 });
    }

    // 공유로 전환된 경우 학부모들에게 알림
    if (shared_with_parent === true) {
      try {
        const parents = (await sql`
          SELECT DISTINCT s.parent_id, s.name AS student_name
          FROM lesson_logs ll
          JOIN lessons l ON l.id = ll.lesson_id
          JOIN class_students cs ON cs.class_id = l.class_id
          JOIN students s ON s.id = cs.student_id
          WHERE ll.id = ${logId}
            AND s.parent_id IS NOT NULL
            AND s.deleted_at IS NULL
        `) as unknown as Array<{ parent_id: number; student_name: string }>;

        await Promise.all(
          parents.map((p) =>
            notifyUser(p.parent_id, {
              type: "lesson_log",
              title: "수업 일지가 공유되었습니다",
              body: `${p.student_name} 학생의 수업 일지를 확인해보세요.`,
              link: "/parent/lesson-logs",
              meta: { lesson_log_id: logId },
            })
          )
        );
      } catch (err) {
        console.error("[lesson-logs] notify failed:", err);
      }
    }

    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error("Update lesson log error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
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
  const logId = parseInt(id);
  if (isNaN(logId)) {
    return NextResponse.json({ error: "잘못된 ID입니다." }, { status: 400 });
  }

  await sql`DELETE FROM lesson_logs WHERE id = ${logId}`;
  return NextResponse.json({ data: { ok: true } });
}
