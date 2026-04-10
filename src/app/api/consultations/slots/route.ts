import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const rows = await sql`
    SELECT * FROM consultation_slots
    WHERE slot_date >= CURRENT_DATE
    ORDER BY slot_date, start_time
  `;

  return NextResponse.json({ data: rows });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { slot_date, start_time, end_time } = body;

    if (!slot_date || !start_time || !end_time) {
      return NextResponse.json({ error: "날짜와 시간을 입력해주세요." }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO consultation_slots (slot_date, start_time, end_time)
      VALUES (${slot_date}, ${start_time}, ${end_time})
      RETURNING *
    `;

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Create slot error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
