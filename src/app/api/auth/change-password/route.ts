import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest, signToken, setAuthCookie } from "@/lib/auth";
import type { User } from "@/types";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "현재 비밀번호와 새 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: "새 비밀번호는 4자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const rows = await sql`
      SELECT id, password FROM users WHERE id = ${session.userId}
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const user = rows[0] as Pick<User, "id" | "password">;

    if (currentPassword !== user.password) {
      return NextResponse.json(
        { error: "현재 비밀번호가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    await sql`
      UPDATE users
      SET password = ${newPassword}, must_change_pw = false
      WHERE id = ${session.userId}
    `;

    const newToken = await signToken({
      ...session,
      mustChangePw: false,
    });

    const response = NextResponse.json({ data: { ok: true } });
    setAuthCookie(response, newToken);
    return response;
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
