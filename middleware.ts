import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

// 인증 없이 접근 가능한 경로
const PUBLIC_PATHS = ["/", "/login"];
const PUBLIC_API_PATHS = ["/api/auth/login", "/api/inquiries"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일, Next.js 내부 경로 제외
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 공개 API (POST /api/inquiries만 허용)
  if (
    pathname === "/api/inquiries" &&
    request.method === "POST"
  ) {
    return NextResponse.next();
  }

  // 공개 경로
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);

  // 미인증 사용자
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 비밀번호 변경 강제
  if (
    session.mustChangePw &&
    pathname !== "/change-password" &&
    pathname !== "/api/auth/change-password" &&
    pathname !== "/api/auth/logout"
  ) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "비밀번호를 변경해주세요." },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  // 역할 기반 라우트 보호
  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/parent/dashboard", request.url));
  }

  if (pathname.startsWith("/parent") && session.role !== "parent") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // API 역할 보호
  if (pathname.startsWith("/api/parents") && session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  // 사용자 정보를 헤더에 주입 (API Route에서 재사용)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-payload", JSON.stringify(session));

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
