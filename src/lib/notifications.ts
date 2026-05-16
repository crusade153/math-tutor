/**
 * 알림 단일 진입점
 *   1) notifications 테이블에 INSERT  (앱 내 알림 / 종 아이콘)
 *   2) push_subscriptions 모두 조회 후 web-push로 전송 (잠금화면 푸시)
 *   3) 만료(404/410) 구독은 정리
 *
 * Node runtime 필수. middleware/edge 에서 호출 금지.
 */
import { sql } from "@/lib/db";
import { webpush } from "@/lib/web-push";
import { env } from "@/lib/env";

export type NotificationType =
  | "absence_request"
  | "consultation"
  | "inquiry"
  | "lesson_log"
  | "notice"
  | "tuition_overdue";

export interface NotifyParams {
  type: NotificationType | string;
  title: string;
  body?: string;
  /** 알림 클릭 시 이동할 내부 경로 (예: '/admin/absence-requests') */
  link?: string;
  /** 부가 식별자 (예: { tuition_id: 12 }). 중복 방지/필터링용 */
  meta?: Record<string, unknown>;
}

interface SubscriptionRow {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
}

/** 특정 사용자 1명에게 알림 발송 (DB 기록 + 푸시) */
export async function notifyUser(
  userId: number,
  params: NotifyParams
): Promise<void> {
  const { type, title, body, link, meta } = params;

  // 1. 앱 내 알림 INSERT
  await sql`
    INSERT INTO notifications (user_id, type, title, body, link_url, meta)
    VALUES (
      ${userId},
      ${type},
      ${title},
      ${body ?? null},
      ${link ?? null},
      ${meta ? JSON.stringify(meta) : null}
    )
  `;

  // VAPID env가 없으면 푸시 단계는 건너뛴다 (앱 내 알림만 기록)
  if (!env.PUSH_ENABLED) return;

  // 2. 푸시 발송
  const subs = (await sql`
    SELECT id, endpoint, p256dh, auth
    FROM push_subscriptions
    WHERE user_id = ${userId}
  `) as unknown as SubscriptionRow[];

  if (subs.length === 0) return;

  const payload = JSON.stringify({
    title,
    body: body ?? "",
    url: link ?? "/",
  });

  const expired: number[] = [];
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        );
      } catch (err: unknown) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          // 구독 만료/취소 — 정리 대상
          expired.push(s.id);
        } else {
          console.error("[notifyUser] push send failed:", err);
        }
      }
    })
  );

  if (expired.length > 0) {
    await sql`DELETE FROM push_subscriptions WHERE id = ANY(${expired})`;
  }
}

/** 활성 관리자 전원에게 알림 발송 */
export async function notifyAdmins(params: NotifyParams): Promise<void> {
  const admins = (await sql`
    SELECT id FROM users
    WHERE role = 'admin' AND is_active = TRUE AND deleted_at IS NULL
  `) as unknown as Array<{ id: number }>;

  await Promise.all(admins.map((a) => notifyUser(a.id, params)));
}

/**
 * 같은 사용자에게 동일한 meta 식별자로 N일 이내 알림이 이미 갔는지 체크.
 * 중복 발송 방지용 (예: 미납 리마인더).
 */
export async function wasRecentlyNotified(
  userId: number,
  type: string,
  metaMatch: Record<string, unknown>,
  withinDays: number
): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM notifications
    WHERE user_id = ${userId}
      AND type = ${type}
      AND meta @> ${JSON.stringify(metaMatch)}::jsonb
      AND created_at > NOW() - (${withinDays}::int * INTERVAL '1 day')
    LIMIT 1
  `;
  return rows.length > 0;
}
