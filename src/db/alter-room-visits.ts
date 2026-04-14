/**
 * room_visits 테이블 추가
 * 수업 유무와 상관없이 QR 입퇴실 기록을 저장
 */
import { neon } from "@neondatabase/serverless";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");

const sql = neon(DATABASE_URL);

async function alterRoomVisits() {
  const tableExists = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_name = 'room_visits'
  `;
  if (tableExists.length === 0) {
    await sql.query(`
      CREATE TABLE room_visits (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
        checked_in_at TIMESTAMPTZ,
        checked_out_at TIMESTAMPTZ,
        UNIQUE (student_id, visit_date)
      )
    `);
    await sql.query(
      "CREATE INDEX idx_room_visits_date ON room_visits(visit_date)"
    );
    console.log("✅ room_visits 테이블 생성 완료");
  } else {
    console.log("ℹ️  room_visits 테이블이 이미 존재합니다.");
  }
  console.log("✅ 완료!");
}

alterRoomVisits().catch((err) => {
  console.error("❌ 실패:", err);
  process.exit(1);
});
