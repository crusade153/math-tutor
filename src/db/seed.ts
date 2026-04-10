import { neon } from "@neondatabase/serverless";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
}

const sql = neon(DATABASE_URL);

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "12345678";
const ADMIN_NAME = "선생님";

async function seed() {
  const existing = await sql`SELECT id FROM users WHERE username = ${ADMIN_USERNAME}`;
  if (existing.length > 0) {
    console.log("ℹ️  Admin 계정이 이미 존재합니다.");
    return;
  }

  await sql`
    INSERT INTO users (username, password, name, role, must_change_pw)
    VALUES (${ADMIN_USERNAME}, ${ADMIN_PASSWORD}, ${ADMIN_NAME}, 'admin', false)
  `;

  console.log("✅ Admin 계정 생성 완료");
  console.log(`   아이디: ${ADMIN_USERNAME}`);
  console.log(`   비밀번호: ${ADMIN_PASSWORD}`);
}

seed().catch((err) => {
  console.error("❌ Seed 실패:", err);
  process.exit(1);
});
