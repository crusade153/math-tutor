import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * 현재 로그인 사용자의 알림 목록 + 미읽음 개수
 *   ?unread=true     — 미읽음만
 *   ?type=notice     — 특정 type 만 (예: 공지 토스트용)
 *   ?limit=50        — 기본 50, 최대 100
 */
export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const onlyUnread = searchParams.get("unread") === "true";
  const type = searchParams.get("type");
  const limitParam = parseInt(searchParams.get("limit") ?? "50", 10);
  const limit = Math.min(Math.max(isNaN(limitParam) ? 50 : limitParam, 1), 100);

  // 동적 WHERE — sql.query 로 파라미터 바인딩
  const conditions: string[] = ["user_id = $1"];
  const params: Array<string | number | boolean> = [session.userId];
  if (onlyUnread) conditions.push("is_read = FALSE");
  if (type) {
    params.push(type);
    conditions.push(`type = $${params.length}`);
  }
  params.push(limit);
  const limitIdx = params.length;

  const rows = await sql.query(
    `SELECT id, type, title, body, link_url, meta, is_read, created_at
     FROM notifications
     WHERE ${conditions.join(" AND ")}
     ORDER BY created_at DESC
     LIMIT $${limitIdx}`,
    params
  );

  const [{ count }] = (await sql`
    SELECT COUNT(*)::int AS count FROM notifications
    WHERE user_id = ${session.userId} AND is_read = FALSE
  `) as unknown as Array<{ count: number }>;

  return NextResponse.json({ data: rows, unread_count: count });
}

/** 전체 읽음 처리 */
export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  await sql`
    UPDATE notifications SET is_read = TRUE
    WHERE user_id = ${session.userId} AND is_read = FALSE
  `;
  return NextResponse.json({ data: { ok: true } });
}
