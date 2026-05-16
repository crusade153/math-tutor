import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let endpoint: unknown;
  try {
    ({ endpoint } = await request.json());
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }

  if (typeof endpoint !== "string" || !endpoint) {
    return NextResponse.json({ error: "endpoint가 필요합니다." }, { status: 400 });
  }

  await sql`
    DELETE FROM push_subscriptions
    WHERE user_id = ${session.userId} AND endpoint = ${endpoint}
  `;

  return NextResponse.json({ data: { ok: true } });
}
