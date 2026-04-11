import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

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
    const rows = await sql`
      SELECT * FROM notices WHERE is_published = true ORDER BY published_at DESC
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

    const rows = await sql`
      INSERT INTO notices (title, content, target, target_id, is_published, published_at)
      VALUES (
        ${title},
        ${content},
        ${target ?? "all"},
        ${targetId ?? null},
        ${isPublished ?? false},
        ${isPublished ? new Date().toISOString() : null}
      )
      RETURNING *
    `;

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Create notice error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
