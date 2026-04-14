import { neon } from "@neondatabase/serverless";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");

const sql = neon(DATABASE_URL);

async function run() {
  const col = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'classes' AND column_name = 'weekly_count'
  `;
  if (col.length === 0) {
    await sql.query("ALTER TABLE classes ADD COLUMN weekly_count INTEGER NOT NULL DEFAULT 2");
    console.log("✅ classes.weekly_count 추가 완료 (기본값: 주 2회)");
  } else {
    console.log("ℹ️  이미 존재합니다.");
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
