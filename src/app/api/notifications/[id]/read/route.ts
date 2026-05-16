import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const nid = parseInt(id, 10);
  if (isNaN(nid)) {
    return NextResponse.json({ error: "잘못된 id" }, { status: 400 });
  }

  await sql`
    UPDATE notifications SET is_read = TRUE
    WHERE id = ${nid} AND user_id = ${session.userId}
  `;

  return NextResponse.json({ data: { ok: true } });
}
