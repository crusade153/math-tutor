import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const rows = await sql`
    SELECT * FROM inquiries ORDER BY created_at DESC
  `;

  return NextResponse.json({ data: rows });
}

export async function POST(request: NextRequest) {
  // 비로그인 공개 엔드포인트
  try {
    const body = await request.json();
    const { name, phone, grade, message } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "이름과 연락처는 필수입니다." },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO inquiries (name, phone, grade, message)
      VALUES (${name}, ${phone}, ${grade ?? null}, ${message ?? null})
    `;

    return NextResponse.json(
      { data: { ok: true } },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create inquiry error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
