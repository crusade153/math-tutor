import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const { student_id } = await request.json();

  if (!student_id) {
    return NextResponse.json({ error: "student_id가 필요합니다." }, { status: 400 });
  }

  await sql`
    INSERT INTO class_students (class_id, student_id)
    VALUES (${parseInt(id)}, ${student_id})
    ON CONFLICT DO NOTHING
  `;

  return NextResponse.json({ data: { ok: true } }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("student_id");

  if (!studentId) {
    return NextResponse.json({ error: "student_id가 필요합니다." }, { status: 400 });
  }

  await sql`
    DELETE FROM class_students
    WHERE class_id = ${parseInt(id)} AND student_id = ${parseInt(studentId)}
  `;

  return NextResponse.json({ data: { ok: true } });
}
