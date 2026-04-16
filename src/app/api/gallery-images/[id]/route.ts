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
  const { url, caption, display_order, is_active } = body;

  await sql`
    UPDATE gallery_images
    SET url = COALESCE(${url ?? null}, url),
        caption = COALESCE(${caption ?? null}, caption),
        display_order = COALESCE(${display_order ?? null}, display_order),
        is_active = COALESCE(${is_active ?? null}, is_active)
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
  await sql`DELETE FROM gallery_images WHERE id = ${parseInt(id)}`;
  return NextResponse.json({ data: { ok: true } });
}
