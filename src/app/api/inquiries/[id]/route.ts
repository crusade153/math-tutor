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
  const { status } = body;

  const ALLOWED = ["new", "contacted", "enrolled", "declined"];
  if (status && !ALLOWED.includes(status)) {
    return NextResponse.json({ error: "잘못된 상태값입니다." }, { status: 400 });
  }

  await sql`
    UPDATE inquiries SET status = ${status} WHERE id = ${parseInt(id)}
  `;

  return NextResponse.json({ data: { ok: true } });
}
