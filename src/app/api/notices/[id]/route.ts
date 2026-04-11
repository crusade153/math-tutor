import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, content, isPublished, target, targetId } = body;

  const publishedAt =
    isPublished === true ? new Date().toISOString() : null;

  await sql`
    UPDATE notices
    SET title = COALESCE(${title ?? null}, title),
        content = COALESCE(${content ?? null}, content),
        target = COALESCE(${target ?? null}, target),
        target_id = CASE WHEN ${target ?? null} = 'all' THEN NULL
                         WHEN ${targetId ?? null} IS NOT NULL THEN ${targetId ?? null}
                         ELSE target_id END,
        is_published = COALESCE(${isPublished ?? null}, is_published),
        published_at = CASE WHEN ${isPublished ?? null} = true AND published_at IS NULL
                            THEN ${publishedAt}
                            ELSE published_at END,
        updated_at = NOW()
    WHERE id = ${parseInt(id)}
  `;

  return NextResponse.json({ data: { ok: true } });
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
  await sql`DELETE FROM notices WHERE id = ${parseInt(id)}`;
  return NextResponse.json({ data: { ok: true } });
}
