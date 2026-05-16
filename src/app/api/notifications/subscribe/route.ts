import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }

  const parsed = subscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 구독 정보" }, { status: 400 });
  }

  const { endpoint, keys } = parsed.data;
  const userAgent = request.headers.get("user-agent") ?? null;

  // 같은 endpoint가 이미 있으면 user_id/키 갱신 (기기 재구독 / 사용자 변경 대응)
  await sql`
    INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
    VALUES (${session.userId}, ${endpoint}, ${keys.p256dh}, ${keys.auth}, ${userAgent})
    ON CONFLICT (endpoint) DO UPDATE
      SET user_id = EXCLUDED.user_id,
          p256dh = EXCLUDED.p256dh,
          auth = EXCLUDED.auth,
          user_agent = EXCLUDED.user_agent
  `;

  return NextResponse.json({ data: { ok: true } });
}
