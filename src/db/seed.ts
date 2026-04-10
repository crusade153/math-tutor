import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
}

const sql = neon(DATABASE_URL);

const ADMIN_EMAIL = "admin@math-tutor.com";
const ADMIN_PASSWORD = "changeme123!";
const ADMIN_NAME = "선생님";

async function seed() {
  // 이미 admin이 존재하면 건너뜀
  const existing = await sql`SELECT id FROM users WHERE email = ${ADMIN_EMAIL}`;
  if (existing.length > 0) {
    console.log("ℹ️  Admin 계정이 이미 존재합니다.");
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await sql`
    INSERT INTO users (email, password_hash, name, role, must_change_pw)
    VALUES (${ADMIN_EMAIL}, ${passwordHash}, ${ADMIN_NAME}, 'admin', true)
  `;

  console.log("✅ Admin 계정 생성 완료");
  console.log(`   이메일: ${ADMIN_EMAIL}`);
  console.log(`   비밀번호: ${ADMIN_PASSWORD}`);
  console.log("   ⚠️  첫 로그인 후 반드시 비밀번호를 변경하세요!");
}

seed().catch((err) => {
  console.error("❌ Seed 실패:", err);
  process.exit(1);
});
