import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET() {
  const rows = await sql`
    SELECT id, url, caption, display_order, is_active, created_at
    FROM gallery_images
    WHERE is_active = TRUE
    ORDER BY display_order ASC, created_at ASC
  `;
  return NextResponse.json({ data: rows });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json();
  const { url, caption, display_order } = body;

  if (!url || typeof url !== "string" || url.trim() === "") {
    return NextResponse.json({ error: "이미지 URL을 입력해주세요." }, { status: 400 });
  }

  const count = await sql`SELECT COUNT(*)::int AS cnt FROM gallery_images WHERE is_active = TRUE`;
  if ((count[0] as { cnt: number }).cnt >= 10) {
    return NextResponse.json({ error: "갤러리 이미지는 최대 10장까지 등록 가능합니다." }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO gallery_images (url, caption, display_order)
    VALUES (${url.trim()}, ${caption ?? null}, ${display_order ?? 0})
    RETURNING *
  `;
  return NextResponse.json({ data: rows[0] }, { status: 201 });
}
