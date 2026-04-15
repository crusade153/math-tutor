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

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
};
