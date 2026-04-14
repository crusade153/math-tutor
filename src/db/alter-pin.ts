/**
 * PIN 기반 QR 출결 시스템을 위한 DB 마이그레이션
 *   - students.pin (4자리 숫자) 추가
 *   - attendance.checked_out_at (퇴실 시간) 추가
 *   - attendance.method 허용값에 'pin' 추가
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

async function alterPin() {
  // 1. students.pin 컬럼 추가
  const pinExists = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'pin'
  `;
  if (pinExists.length === 0) {
    await sql.query("ALTER TABLE students ADD COLUMN pin VARCHAR(4)");
    console.log("✅ students.pin 컬럼 추가 완료");
  } else {
    console.log("ℹ️  students.pin 컬럼이 이미 존재합니다.");
  }

  // 2. students.pin UNIQUE 인덱스
  const idxExists = await sql`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'students' AND indexname = 'idx_students_pin'
  `;
  if (idxExists.length === 0) {
    await sql.query(
      "CREATE UNIQUE INDEX idx_students_pin ON students(pin) WHERE pin IS NOT NULL"
    );
    console.log("✅ students.pin UNIQUE 인덱스 생성 완료");
  } else {
    console.log("ℹ️  idx_students_pin 인덱스가 이미 존재합니다.");
  }

  // 3. attendance.checked_out_at 컬럼 추가
  const checkoutExists = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'attendance' AND column_name = 'checked_out_at'
  `;
  if (checkoutExists.length === 0) {
    await sql.query(
      "ALTER TABLE attendance ADD COLUMN checked_out_at TIMESTAMPTZ"
    );
    console.log("✅ attendance.checked_out_at 컬럼 추가 완료");
  } else {
    console.log("ℹ️  attendance.checked_out_at 컬럼이 이미 존재합니다.");
  }

  // 4. attendance.method CHECK 제약 업데이트 ('pin' 추가)
  // 기존 제약 삭제 후 재생성
  const constraintExists = await sql`
    SELECT constraint_name FROM information_schema.table_constraints
    WHERE table_name = 'attendance' AND constraint_name = 'attendance_method_check'
  `;
  if (constraintExists.length > 0) {
    await sql.query(
      "ALTER TABLE attendance DROP CONSTRAINT attendance_method_check"
    );
    console.log("✅ 기존 attendance_method_check 제약 삭제 완료");
  }
  await sql.query(
    "ALTER TABLE attendance ADD CONSTRAINT attendance_method_check CHECK (method IN ('qr', 'manual', 'pin'))"
  );
  console.log("✅ attendance.method CHECK 제약 업데이트 완료 (pin 추가)");

  console.log("\n✅ 모든 마이그레이션 완료!");
  console.log("   이제 관리자 → 학생 관리에서 각 학생에 PIN을 설정하세요.");
}

alterPin().catch((err) => {
  console.error("❌ 마이그레이션 실패:", err);
  process.exit(1);
});
