import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { notifyUser } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (session.role === "admin") {
    const rows = await sql`
      SELECT * FROM notices ORDER BY created_at DESC
    `;
    return NextResponse.json({ data: rows });
  } else {
    // 학부모는 자신의 자녀와 관련된 공지만 볼 수 있음
    // - target='all': 전체 공지
    // - target='individual': 자신의 자녀(student_id)에게 해당하는 공지만
    // - target='class': 자신의 자녀가 수강 중인 반 공지만
    const rows = await sql`
      SELECT n.* FROM notices n
      WHERE n.is_published = true
        AND (
          n.target = 'all'
          OR (
            n.target = 'individual'
            AND n.target_id IN (
              SELECT id FROM students
              WHERE parent_id = ${session.userId} AND deleted_at IS NULL
            )
          )
          OR (
            n.target = 'class'
            AND n.target_id IN (
              SELECT cs.class_id
              FROM class_students cs
              JOIN students s ON s.id = cs.student_id
              WHERE s.parent_id = ${session.userId} AND s.deleted_at IS NULL
            )
          )
        )
      ORDER BY n.published_at DESC
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
    const { title, content, isPublished, target, targetId } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
    }

    const noticeTarget = target ?? "all";
    const noticeTargetId = targetId ?? null;

    const rows = await sql`
      INSERT INTO notices (title, content, target, target_id, is_published, published_at)
      VALUES (
        ${title},
        ${content},
        ${noticeTarget},
        ${noticeTargetId},
        ${isPublished ?? false},
        ${isPublished ? new Date().toISOString() : null}
      )
      RETURNING *
    `;

    // 발행 상태일 때만 대상 학부모들에게 알림
    if (isPublished) {
      try {
        const parents = (await sql`
          SELECT DISTINCT u.id
          FROM users u
          WHERE u.role = 'parent'
            AND u.is_active = TRUE
            AND u.deleted_at IS NULL
            AND CASE ${noticeTarget}
              WHEN 'all' THEN TRUE
              WHEN 'individual' THEN u.id IN (
                SELECT parent_id FROM students
                WHERE id = ${noticeTargetId ?? 0} AND parent_id IS NOT NULL
              )
              WHEN 'class' THEN u.id IN (
                SELECT s.parent_id FROM class_students cs
                JOIN students s ON s.id = cs.student_id
                WHERE cs.class_id = ${noticeTargetId ?? 0} AND s.parent_id IS NOT NULL
              )
              ELSE FALSE
            END
        `) as unknown as Array<{ id: number }>;

        const noticeId = (rows[0] as { id: number }).id;
        await Promise.all(
          parents.map((p) =>
            notifyUser(p.id, {
              type: "notice",
              title: "새 공지사항",
              body: title,
              link: "/parent/notices",
              meta: { notice_id: noticeId },
            })
          )
        );
      } catch (err) {
        console.error("[notices] notify failed:", err);
      }
    }

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Create notice error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
