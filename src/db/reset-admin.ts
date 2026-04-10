import { neon } from "@neondatabase/serverless";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
}

const sql = neon(DATABASE_URL);

async function resetAdmin() {
  const result = await sql`
    UPDATE users
    SET username = 'admin',
        password = '12345678',
        must_change_pw = false
    WHERE role = 'admin'
    RETURNING id, username
  `;

  if (result.length === 0) {
    console.log("❌ admin 계정을 찾을 수 없습니다.");
  } else {
    console.log("✅ 비밀번호 초기화 완료!");
    console.log("   아이디: admin");
    console.log("   비밀번호: 12345678");
  }
}

resetAdmin().catch((err) => {
  console.error("❌ 실패:", err);
  process.exit(1);
});
