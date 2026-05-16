/**
 * 서버 시작 시 필수 환경변수 검증
 * 누락된 경우 명확한 에러 메시지를 출력하고 종료합니다.
 */
const REQUIRED_VARS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "NEXT_PUBLIC_APP_URL",
] as const;

for (const key of REQUIRED_VARS) {
  if (!process.env[key]) {
    throw new Error(
      `[환경변수 오류] "${key}"가 설정되지 않았습니다.\n` +
        `.env.local 파일에 ${key}=값 을 추가해주세요.`
    );
  }
}

// 웹 푸시(VAPID) — 알림 시스템용. private 키는 서버 전용.
// 누락 시에는 알림 기능만 비활성화되고 다른 기능은 정상 동작.
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "";

if (!VAPID_PUBLIC || !VAPID_PRIVATE || !VAPID_SUBJECT) {
  console.warn(
    "[env] VAPID 환경변수가 누락되어 웹 푸시 알림이 비활성화됩니다. " +
      "(NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT 필요)"
  );
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  VAPID_PUBLIC_KEY: VAPID_PUBLIC,
  VAPID_PRIVATE_KEY: VAPID_PRIVATE,
  VAPID_SUBJECT: VAPID_SUBJECT,
  /** 웹 푸시 발송 가능 여부 — false면 notifyUser는 DB INSERT만 수행, 푸시 skip */
  PUSH_ENABLED: Boolean(VAPID_PUBLIC && VAPID_PRIVATE && VAPID_SUBJECT),
};
