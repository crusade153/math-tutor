import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { buildFeedbackNoticeContent, parseTextArray, parseJsonb } from "@/lib/examUtils";
import type { ProblemEntry } from "@/types";

// POST /api/exam-details/send-feedback  (admin only)
// body: { score_id: number }
export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const body = await request.json() as { score_id?: number };
    const score_id = body?.score_id;

    if (!score_id) {
      return NextResponse.json({ error: "score_id가 필요합니다." }, { status: 400 });
    }

    // 성적 + 학생 + 시험 상세 조회
    const rows = await sql`
      SELECT
        sc.id           AS score_id,
        sc.exam_name,
        sc.score,
        sc.max_score,
        sc.exam_date,
        st.id           AS student_id,
        st.name         AS student_name,
        ed.id           AS detail_id,
        ed.file_url,
        ed.problems,
        ed.weak_topics,
        ed.teacher_comment
      FROM scores sc
      JOIN students st ON st.id = sc.student_id
      LEFT JOIN exam_details ed ON ed.score_id = sc.id
      WHERE sc.id = ${score_id}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "성적 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    const row = rows[0] as Record<string, unknown>;

    if (!row.detail_id) {
      return NextResponse.json(
        { error: "먼저 문제 상세를 저장한 후 발송해주세요." },
        { status: 400 }
      );
    }

    // Neon이 JSONB/TEXT[]를 다양한 형식으로 반환할 수 있으므로 안전하게 파싱
    const problems = parseJsonb<ProblemEntry>(row.problems);
    const weakTopics = parseTextArray(row.weak_topics);

    const { title, content } = buildFeedbackNoticeContent({
      examName: String(row.exam_name ?? ""),
      score: Number(row.score ?? 0),
      maxScore: Number(row.max_score ?? 100),
      examDate: String(row.exam_date ?? ""),
      problems,
      weakTopics,
      fileUrl: row.file_url ? String(row.file_url) : null,
      teacherComment: row.teacher_comment ? String(row.teacher_comment) : null,
      studentName: String(row.student_name ?? ""),
    });

    // 개인 알림으로 공지 생성 (target='individual', target_id=student.id)
    const noticeRows = await sql`
      INSERT INTO notices (title, content, target, target_id, is_published, published_at)
      VALUES (
        ${title},
        ${content},
        'individual',
        ${Number(row.student_id)},
        true,
        NOW()
      )
      RETURNING id
    `;

    return NextResponse.json({ data: { noticeId: noticeRows[0].id } }, { status: 201 });
  } catch (err) {
    console.error("send-feedback POST error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
