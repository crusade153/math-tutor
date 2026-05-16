/**
 * web-push 인스턴스 (VAPID 설정 적용)
 * — API route(Node runtime) 에서만 임포트하세요. Edge runtime에서 사용 불가.
 * VAPID 환경변수가 누락되면 setVapidDetails를 건너뛰고 발송 시 no-op.
 */
import webpush from "web-push";
import { env } from "@/lib/env";

if (env.PUSH_ENABLED) {
  webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );
}

export { webpush };
