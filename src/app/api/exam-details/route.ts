import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { computeWeakTopics, parseJsonb, parseTextArray } from "@/lib/examUtils";
import type { ProblemEntry } from "@/types";

// GET /api/exam-details?scoreId=<id>
export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const scoreId = request.nextUrl.searchParams.get("scoreId");
  if (!scoreId) {
    return NextResponse.json({ error: "scoreId가 필요합니다." }, { status: 400 });
  }

  if (session.role === "parent") {
    // 해당 성적이 자신의 자녀 것인지 확인
    const check = await sql`
      SELECT s.id FROM scores sc
      JOIN students s ON s.id = sc.student_id
      WHERE sc.id = ${parseInt(scoreId)}
        AND s.parent_id = ${session.userId}
        AND s.deleted_at IS NULL
    `;
    if (check.length === 0) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
  }

  const rows = await sql`
    SELECT * FROM exam_details WHERE score_id = ${parseInt(scoreId)}
  `;

  if (!rows[0]) return NextResponse.json({ data: null });

  // Neon 반환값 안전 파싱
  const row = rows[0] as Record<string, unknown>;
  return NextResponse.json({
    data: {
      ...row,
      problems: parseJsonb<ProblemEntry>(row.problems),
      weak_topics: parseTextArray(row.weak_topics),
    },
  });
}

// POST /api/exam-details  (admin only, upsert)
export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { score_id, file_url, problems, teacher_comment } = body as {
      score_id: number;
      file_url?: string | null;
      problems: ProblemEntry[];
      teacher_comment?: string | null;
    };

    if (!score_id) {
      return NextResponse.json({ error: "score_id가 필요합니다." }, { status: 400 });
    }

    const weakTopics = computeWeakTopics(problems ?? []);

    // UPSERT: 동일 score_id면 덮어쓰기
    const rows = await sql`
      INSERT INTO exam_details (score_id, file_url, problems, weak_topics, teacher_comment, updated_at)
      VALUES (
        ${score_id},
        ${file_url ?? null},
        ${JSON.stringify(problems ?? [])}::jsonb,
        ${weakTopics}::text[],
        ${teacher_comment ?? null},
        NOW()
      )
      ON CONFLICT (score_id) DO UPDATE SET
        file_url        = EXCLUDED.file_url,
        problems        = EXCLUDED.problems,
        weak_topics     = EXCLUDED.weak_topics,
        teacher_comment = EXCLUDED.teacher_comment,
        updated_at      = NOW()
      RETURNING *
    `;

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("exam-details POST error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
