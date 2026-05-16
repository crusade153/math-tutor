/**
 * 웹 푸시 + 앱 내 알림 시스템을 위한 DB 마이그레이션
 *   - push_subscriptions: 사용자별 브라우저 푸시 구독 정보
 *   - notifications:      사용자별 알림 (앱 내 표시 + 푸시 발송 기록)
 *
 * 멱등(idempotent) 스크립트 — 여러 번 실행해도 안전.
 */
import { neon } from "@neondatabase/serverless";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
}

const sql = neon(DATABASE_URL);

async function tableExists(name: string): Promise<boolean> {
  const rows = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_name = ${name}
  `;
  return rows.length > 0;
}

async function indexExists(name: string): Promise<boolean> {
  const rows = await sql`
    SELECT indexname FROM pg_indexes WHERE indexname = ${name}
  `;
  return rows.length > 0;
}

async function alterNotifications() {
  // 1. push_subscriptions ──────────────────────────────────────────
  if (!(await tableExists("push_subscriptions"))) {
    await sql.query(`
      CREATE TABLE push_subscriptions (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        endpoint    TEXT NOT NULL UNIQUE,
        p256dh      TEXT NOT NULL,
        auth        TEXT NOT NULL,
        user_agent  TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log("✅ push_subscriptions 테이블 생성 완료");
  } else {
    console.log("ℹ️  push_subscriptions 테이블이 이미 존재합니다.");
  }

  if (!(await indexExists("idx_push_subscriptions_user"))) {
    await sql.query(
      "CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id)"
    );
    console.log("✅ idx_push_subscriptions_user 인덱스 생성 완료");
  } else {
    console.log("ℹ️  idx_push_subscriptions_user 인덱스가 이미 존재합니다.");
  }

  // 2. notifications ───────────────────────────────────────────────
  if (!(await tableExists("notifications"))) {
    await sql.query(`
      CREATE TABLE notifications (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type        TEXT NOT NULL,
        title       TEXT NOT NULL,
        body        TEXT,
        link_url    TEXT,
        meta        JSONB,
        is_read     BOOLEAN DEFAULT FALSE,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log("✅ notifications 테이블 생성 완료");
  } else {
    console.log("ℹ️  notifications 테이블이 이미 존재합니다.");

    // meta 컬럼이 빠져 있을 수 있는 구버전 보정
    const metaExists = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'notifications' AND column_name = 'meta'
    `;
    if (metaExists.length === 0) {
      await sql.query("ALTER TABLE notifications ADD COLUMN meta JSONB");
      console.log("✅ notifications.meta 컬럼 추가 완료");
    }
  }

  if (!(await indexExists("idx_notifications_user_unread"))) {
    await sql.query(
      "CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC)"
    );
    console.log("✅ idx_notifications_user_unread 인덱스 생성 완료");
  } else {
    console.log("ℹ️  idx_notifications_user_unread 인덱스가 이미 존재합니다.");
  }

  console.log("\n✅ 모든 마이그레이션 완료!");
  console.log("   다음 단계: 운영자/학부모가 사이트 접속 후 '알림 허용'을 누르면 구독이 push_subscriptions에 저장됩니다.");
}

alterNotifications().catch((err) => {
  console.error("❌ 마이그레이션 실패:", err);
  process.exit(1);
});
