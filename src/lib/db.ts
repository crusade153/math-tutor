import { neon } from "@neondatabase/serverless";
import "@/lib/env"; // 필수 환경변수 검증

export const sql = neon(process.env.DATABASE_URL!);
