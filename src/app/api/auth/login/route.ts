import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";
import type { User } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const rows = await sql`
      SELECT id, email, password_hash, name, role, must_change_pw, is_active
      FROM users
      WHERE email = ${email} AND deleted_at IS NULL
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const user = rows[0] as User;

    if (!user.is_active) {
      return NextResponse.json(
        { error: "비활성화된 계정입니다. 선생님께 문의해주세요." },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePw: user.must_change_pw,
    });

    const response = NextResponse.json({
      data: {
        role: user.role,
        mustChangePw: user.must_change_pw,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
