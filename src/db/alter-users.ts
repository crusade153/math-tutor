/**
 * users 테이블 컬럼 변경:
 *   email        → username
 *   password_hash → password
 * 그리고 admin 계정을 admin / 12345678 로 초기화
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

async function alterUsers() {
  // 1. email 컬럼이 있으면 username으로 이름 변경
  const emailExists = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email'
  `;
  if (emailExists.length > 0) {
    await sql.query("ALTER TABLE users RENAME COLUMN email TO username");
    console.log("✅ email → username 변경 완료");
  } else {
    console.log("ℹ️  username 컬럼이 이미 존재합니다.");
  }

  // 2. password_hash 컬럼이 있으면 password로 이름 변경
  const hashExists = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password_hash'
  `;
  if (hashExists.length > 0) {
    await sql.query("ALTER TABLE users RENAME COLUMN password_hash TO password");
    console.log("✅ password_hash → password 변경 완료");
  } else {
    console.log("ℹ️  password 컬럼이 이미 존재합니다.");
  }

  // 3. admin 계정을 평문 비밀번호로 초기화
  const result = await sql`
    UPDATE users
    SET username = 'admin',
        password = '12345678',
        must_change_pw = false
    WHERE role = 'admin'
    RETURNING id
  `;

  if (result.length > 0) {
    console.log("✅ admin 계정 초기화 완료");
    console.log("   아이디: admin");
    console.log("   비밀번호: 12345678");
  } else {
    // admin이 없으면 새로 생성
    await sql`
      INSERT INTO users (username, password, name, role, must_change_pw)
      VALUES ('admin', '12345678', '선생님', 'admin', false)
    `;
    console.log("✅ admin 계정 새로 생성 완료");
    console.log("   아이디: admin");
    console.log("   비밀번호: 12345678");
  }
}

alterUsers().catch((err) => {
  console.error("❌ 실패:", err);
  process.exit(1);
});
