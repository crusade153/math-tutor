import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

// 인증 없이 접근 가능한 경로
const PUBLIC_PATHS = ["/", "/login", "/attend"];
const PUBLIC_API_PATHS = ["/api/auth/login", "/api/inquiries", "/api/attendance/pin"];

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Edge 환경 단일 인스턴스 내 IP 기반 요청 제한
// Vercel 다중 인스턴스 환경에선 인스턴스별로 독립 동작 (기본 보호로 충분)
type RateLimitEntry = { count: number; resetAt: number };
const rateLimitStore = new Map<string, RateLimitEntry>();

function isRateLimited(
  ip: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= limit) return true;
  entry.count++;
  return false;
}

// 공개 API(로그인, 문의, PIN 출석)는 더 낮은 제한 적용
const RATE_LIMITS: Array<{ prefix: string; limit: number; windowMs: number }> = [
  { prefix: "/api/auth/login", limit: 10, windowMs: 60_000 },   // 1분에 10회
  { prefix: "/api/attendance/pin", limit: 30, windowMs: 60_000 }, // 1분에 30회
  { prefix: "/api/inquiries", limit: 20, windowMs: 60_000 },     // 1분에 20회
];
const DEFAULT_LIMIT = { limit: 120, windowMs: 60_000 }; // 일반 API: 1분에 120회

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

  // Rate Limiting (API 경로만)
  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const rule = RATE_LIMITS.find((r) => pathname.startsWith(r.prefix));
    const { limit, windowMs } = rule ?? DEFAULT_LIMIT;
    const key = `${ip}:${rule?.prefix ?? "api"}`;

    if (isRateLimited(key, limit, windowMs)) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }
  }

  // 공개 API 경로
  if (PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
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
