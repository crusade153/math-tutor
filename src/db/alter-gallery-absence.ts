/**
 * 갤러리 이미지 + 결석 사전 신고 테이블 추가 마이그레이션
 *   - gallery_images 테이블 생성
 *   - absence_requests 테이블 생성
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

async function migrate() {
  // 1. gallery_images 테이블
  const galleryExists = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_name = 'gallery_images'
  `;
  if (galleryExists.length === 0) {
    await sql.query(`
      CREATE TABLE gallery_images (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        caption VARCHAR(200),
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await sql.query(`
      CREATE INDEX idx_gallery_images_order ON gallery_images(display_order) WHERE is_active = TRUE
    `);
    console.log("✅ gallery_images 테이블 생성 완료");
  } else {
    console.log("ℹ️  gallery_images 테이블이 이미 존재합니다.");
  }

  // 2. absence_requests 테이블
  const absenceExists = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_name = 'absence_requests'
  `;
  if (absenceExists.length === 0) {
    await sql.query(`
      CREATE TABLE absence_requests (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) NOT NULL,
        absence_date DATE NOT NULL,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
        admin_note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await sql.query(`
      CREATE INDEX idx_absence_requests_student ON absence_requests(student_id)
    `);
    await sql.query(`
      CREATE INDEX idx_absence_requests_status ON absence_requests(status, absence_date)
    `);
    console.log("✅ absence_requests 테이블 생성 완료");
  } else {
    console.log("ℹ️  absence_requests 테이블이 이미 존재합니다.");
  }

  console.log("\n✅ 모든 마이그레이션 완료!");
}

migrate().catch((err) => {
  console.error("❌ 마이그레이션 실패:", err);
  process.exit(1);
});
