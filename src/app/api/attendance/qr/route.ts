import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // 특정 수업의 현재 유효한 QR 토큰 조회
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId가 필요합니다." }, { status: 400 });
  }

  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const rows = await sql`
    SELECT token, expires_at, is_used
    FROM qr_tokens
    WHERE lesson_id = ${parseInt(lessonId)}
      AND expires_at > NOW()
      AND is_used = false
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (rows.length === 0) {
    return NextResponse.json({ data: null });
  }

  return NextResponse.json({ data: rows[0] });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  // QR 생성 (선생님만)
  if (action === "generate") {
    if (session.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { lessonId } = body;
    if (!lessonId) {
      return NextResponse.json({ error: "lessonId가 필요합니다." }, { status: 400 });
    }

    // 기존 미사용 토큰 만료 처리
    await sql`
      UPDATE qr_tokens SET is_used = true
      WHERE lesson_id = ${lessonId} AND expires_at > NOW() AND is_used = false
    `;

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15분

    const rows = await sql`
      INSERT INTO qr_tokens (lesson_id, expires_at)
      VALUES (${lessonId}, ${expiresAt.toISOString()})
      RETURNING token, expires_at
    `;

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  }

  // QR 스캔 처리
  if (action === "scan") {
    const { token, studentId } = body;

    if (!token || !studentId) {
      return NextResponse.json(
        { error: "token과 studentId가 필요합니다." },
        { status: 400 }
      );
    }

    // 학부모는 본인 자녀만
    if (session.role === "parent") {
      const child = await sql`
        SELECT id FROM students WHERE id = ${studentId} AND parent_id = ${session.userId}
      `;
      if (child.length === 0) {
        return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
      }
    }

    // 토큰 검증
    const tokenRows = await sql`
      SELECT qt.*, l.class_id
      FROM qr_tokens qt
      JOIN lessons l ON l.id = qt.lesson_id
      WHERE qt.token = ${token}
    `;

    if (tokenRows.length === 0) {
      return NextResponse.json({ error: "유효하지 않은 QR 코드입니다." }, { status: 400 });
    }

    const qr = tokenRows[0] as {
      id: number;
      lesson_id: number;
      class_id: number;
      expires_at: string;
      is_used: boolean;
    };

    if (qr.is_used) {
      return NextResponse.json({ error: "이미 사용된 QR 코드입니다." }, { status: 400 });
    }

    if (new Date(qr.expires_at) < new Date()) {
      return NextResponse.json({ error: "만료된 QR 코드입니다." }, { status: 400 });
    }

    // 학생이 해당 반에 속하는지 확인
    const enrolled = await sql`
      SELECT 1 FROM class_students
      WHERE class_id = ${qr.class_id} AND student_id = ${studentId}
    `;

    if (enrolled.length === 0) {
      return NextResponse.json(
        { error: "해당 수업에 등록된 학생이 아닙니다." },
        { status: 400 }
      );
    }

    // 이미 출석 기록이 있는지 확인
    const existing = await sql`
      SELECT status FROM attendance
      WHERE lesson_id = ${qr.lesson_id} AND student_id = ${studentId}
    `;

    if (existing.length > 0 && existing[0].status === "present") {
      return NextResponse.json({ error: "이미 출석 처리되었습니다." }, { status: 400 });
    }

    // 출석 기록
    await sql`
      INSERT INTO attendance (lesson_id, student_id, status, method, checked_at)
      VALUES (${qr.lesson_id}, ${studentId}, 'present', 'qr', NOW())
      ON CONFLICT (lesson_id, student_id)
      DO UPDATE SET status = 'present', method = 'qr', checked_at = NOW()
    `;

    // 토큰은 재사용 가능 (여러 학생이 같은 QR로 스캔) — 만료 시간만으로 제어
    // 개인별 중복 방지는 attendance UNIQUE 제약으로 처리

    // 수업 정보 반환
    const lessonInfo = await sql`
      SELECT l.lesson_date, l.start_time, c.name AS class_name, s.name AS student_name
      FROM lessons l
      JOIN classes c ON c.id = l.class_id
      JOIN students s ON s.id = ${studentId}
      WHERE l.id = ${qr.lesson_id}
    `;

    return NextResponse.json({
      data: {
        ok: true,
        lessonDate: lessonInfo[0]?.lesson_date,
        className: lessonInfo[0]?.class_name,
        studentName: lessonInfo[0]?.student_name,
      },
    });
  }

  return NextResponse.json({ error: "잘못된 action입니다." }, { status: 400 });
}
