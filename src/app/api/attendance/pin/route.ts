import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin, type } = body as { pin: string; type: string };

    // 입력 검증
    if (!pin || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN은 4자리 숫자입니다." },
        { status: 400 }
      );
    }
    if (type !== "entry" && type !== "exit") {
      return NextResponse.json(
        { error: "잘못된 요청입니다." },
        { status: 400 }
      );
    }

    // 학생 조회
    const students = await sql`
      SELECT id, name, grade, is_active
      FROM students
      WHERE pin = ${pin} AND deleted_at IS NULL
    `;
    if (students.length === 0) {
      return NextResponse.json(
        { error: "등록되지 않은 PIN입니다." },
        { status: 404 }
      );
    }
    const student = students[0];
    if (!student.is_active) {
      return NextResponse.json(
        { error: "비활성 학생입니다. 선생님께 문의하세요." },
        { status: 403 }
      );
    }

    // 오늘 수업 조회 (학생이 속한 반의 오늘 예정 수업)
    const lessons = await sql`
      SELECT l.id AS lesson_id, l.lesson_date, l.start_time, l.end_time,
             c.name AS class_name
      FROM lessons l
      JOIN classes c ON c.id = l.class_id
      JOIN class_students cs ON cs.class_id = l.class_id
      WHERE cs.student_id = ${student.id}
        AND l.lesson_date = CURRENT_DATE
        AND l.status = 'scheduled'
      ORDER BY l.start_time
      LIMIT 1
    `;
    if (lessons.length === 0) {
      return NextResponse.json(
        { error: "오늘 수업이 없습니다." },
        { status: 404 }
      );
    }
    const lesson = lessons[0];

    if (type === "entry") {
      // 입실: UPSERT — 최초 입실 시간 보존
      await sql`
        INSERT INTO attendance (lesson_id, student_id, status, method, checked_at)
        VALUES (${lesson.lesson_id}, ${student.id}, 'present', 'pin', NOW())
        ON CONFLICT (lesson_id, student_id)
        DO UPDATE SET
          status = 'present',
          method = 'pin',
          checked_at = CASE
            WHEN attendance.checked_at IS NULL THEN NOW()
            ELSE attendance.checked_at
          END
      `;

      const alreadyIn = await sql`
        SELECT checked_at FROM attendance
        WHERE lesson_id = ${lesson.lesson_id} AND student_id = ${student.id}
          AND checked_at < NOW() - INTERVAL '2 seconds'
      `;
      const message =
        alreadyIn.length > 0
          ? `${student.name} 학생은 이미 입실 처리되었습니다.`
          : `${student.name} 학생 입실 완료!`;

      return NextResponse.json({
        data: {
          ok: true,
          type: "entry",
          studentName: student.name,
          className: lesson.class_name,
          lessonDate: lesson.lesson_date,
          message,
        },
      });
    } else {
      // 퇴실: 입실 기록 확인 후 checked_out_at 업데이트
      const existing = await sql`
        SELECT checked_at, checked_out_at
        FROM attendance
        WHERE lesson_id = ${lesson.lesson_id} AND student_id = ${student.id}
      `;
      if (existing.length === 0 || !existing[0].checked_at) {
        return NextResponse.json(
          { error: "입실 기록이 없습니다. 먼저 입실 QR을 스캔하세요." },
          { status: 400 }
        );
      }

      await sql`
        UPDATE attendance
        SET checked_out_at = NOW()
        WHERE lesson_id = ${lesson.lesson_id} AND student_id = ${student.id}
      `;

      return NextResponse.json({
        data: {
          ok: true,
          type: "exit",
          studentName: student.name,
          className: lesson.class_name,
          lessonDate: lesson.lesson_date,
          message: `${student.name} 학생 퇴실 완료!`,
        },
      });
    }
  } catch (err) {
    console.error("PIN attendance error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
