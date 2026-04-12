import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { computeWeakTopics } from "@/lib/examUtils";
import type { ProblemEntry } from "@/types";

// PUT /api/exam-details/[id]  (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { file_url, problems, teacher_comment } = body as {
      file_url?: string | null;
      problems: ProblemEntry[];
      teacher_comment?: string | null;
    };

    const weakTopics = computeWeakTopics(problems ?? []);

    const rows = await sql`
      UPDATE exam_details SET
        file_url        = ${file_url ?? null},
        problems        = ${JSON.stringify(problems ?? [])}::jsonb,
        weak_topics     = ${weakTopics}::text[],
        teacher_comment = ${teacher_comment ?? null},
        updated_at      = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "항목을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error("exam-details PUT error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// DELETE /api/exam-details/[id]  (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;

  await sql`DELETE FROM exam_details WHERE id = ${parseInt(id)}`;
  return NextResponse.json({ data: { deleted: true } });
}
