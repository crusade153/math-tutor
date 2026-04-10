import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (session.role === "admin") {
    const rows = await sql`
      SELECT c.*, u.name AS parent_name, u.phone AS parent_phone,
             s.name AS student_name,
             cs.slot_date, cs.start_time, cs.end_time
      FROM consultations c
      JOIN users u ON u.id = c.parent_id
      LEFT JOIN students s ON s.id = c.student_id
      JOIN consultation_slots cs ON cs.id = c.slot_id
      ORDER BY cs.slot_date DESC, cs.start_time DESC
    `;
    return NextResponse.json({ data: rows });
  } else {
    const rows = await sql`
      SELECT c.*, s.name AS student_name,
             cs.slot_date, cs.start_time, cs.end_time
      FROM consultations c
      LEFT JOIN students s ON s.id = c.student_id
      JOIN consultation_slots cs ON cs.id = c.slot_id
      WHERE c.parent_id = ${session.userId}
      ORDER BY cs.slot_date DESC
    `;
    return NextResponse.json({ data: rows });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slot_id, student_id, type, topic, parent_memo } = body;

    if (!slot_id) {
      return NextResponse.json({ error: "시간대를 선택해주세요." }, { status: 400 });
    }

    // 슬롯이 사용 가능한지 확인
    const slot = await sql`
      SELECT * FROM consultation_slots WHERE id = ${slot_id} AND is_available = true
    `;
    if (slot.length === 0) {
      return NextResponse.json({ error: "선택한 시간대를 사용할 수 없습니다." }, { status: 400 });
    }

    // 이미 해당 슬롯에 예약이 있는지 확인
    const existing = await sql`
      SELECT id FROM consultations
      WHERE slot_id = ${slot_id} AND status NOT IN ('cancelled')
    `;
    if (existing.length > 0) {
      return NextResponse.json({ error: "이미 예약된 시간대입니다." }, { status: 409 });
    }

    const parentId = session.role === "admin" ? body.parent_id : session.userId;

    const rows = await sql`
      INSERT INTO consultations (slot_id, parent_id, student_id, type, topic, parent_memo)
      VALUES (${slot_id}, ${parentId}, ${student_id ?? null}, ${type ?? "in_person"}, ${topic ?? null}, ${parent_memo ?? null})
      RETURNING *
    `;

    // 슬롯 비활성화
    await sql`UPDATE consultation_slots SET is_available = false WHERE id = ${slot_id}`;

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Create consultation error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
