import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  const rows = await sql`
    SELECT rv.id, rv.student_id, s.name AS student_name, s.grade,
           rv.visit_date, rv.checked_in_at, rv.checked_out_at
    FROM room_visits rv
    JOIN students s ON s.id = rv.student_id
    WHERE rv.visit_date = ${date}
    ORDER BY rv.checked_in_at ASC NULLS LAST
  `;

  return NextResponse.json({ data: rows });
}
