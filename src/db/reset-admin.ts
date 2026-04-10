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
const NEW_PASSWORD = "changeme123!";

async function resetAdmin() {
  const passwordHash = await bcrypt.hash(NEW_PASSWORD, 12);

  const result = await sql`
    UPDATE users
    SET password_hash = ${passwordHash},
        must_change_pw = true
    WHERE email = ${ADMIN_EMAIL} AND role = 'admin'
    RETURNING id
  `;

  if (result.length === 0) {
    console.log("❌ admin 계정을 찾을 수 없습니다.");
  } else {
    console.log("✅ 비밀번호 초기화 완료!");
    console.log(`   이메일: ${ADMIN_EMAIL}`);
    console.log(`   비밀번호: ${NEW_PASSWORD}`);
  }
}

resetAdmin().catch((err) => {
  console.error("❌ 실패:", err);
  process.exit(1);
});
