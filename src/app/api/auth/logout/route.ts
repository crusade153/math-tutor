import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ data: { ok: true } });
  clearAuthCookie(response);
  return response;
}
