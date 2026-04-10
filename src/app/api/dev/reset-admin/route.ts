import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export async function GET() {
  const NEW_PASSWORD = "changeme123!";
  const passwordHash = await bcrypt.hash(NEW_PASSWORD, 12);

  const result = await sql`
    UPDATE users
    SET password_hash = ${passwordHash},
        must_change_pw = true
    WHERE email = 'admin@math-tutor.com' AND role = 'admin'
    RETURNING id, email
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "admin 계정을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: "비밀번호가 초기화되었습니다.",
    email: "admin@math-tutor.com",
    password: NEW_PASSWORD,
  });
}
