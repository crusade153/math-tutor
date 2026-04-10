import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { is_paid, note } = body;

  await sql`
    UPDATE tuition
    SET is_paid = COALESCE(${is_paid ?? null}, is_paid),
        paid_at = CASE WHEN ${is_paid ?? null} = true AND paid_at IS NULL
                       THEN NOW()
                       WHEN ${is_paid ?? null} = false
                       THEN NULL
                       ELSE paid_at END,
        note = COALESCE(${note ?? null}, note)
    WHERE id = ${parseInt(id)}
  `;

  return NextResponse.json({ data: { ok: true } });
}
