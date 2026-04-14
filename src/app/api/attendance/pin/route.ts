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
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
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

    // 오늘 수업 조회 (없어도 괜찮음 — 선택적)
    const lessons = await sql`
      SELECT l.id AS lesson_id, c.name AS class_name
      FROM lessons l
      JOIN classes c ON c.id = l.class_id
      JOIN class_students cs ON cs.class_id = l.class_id
      WHERE cs.student_id = ${student.id}
        AND l.lesson_date = CURRENT_DATE
        AND l.status = 'scheduled'
      ORDER BY l.start_time
      LIMIT 1
    `;
    const lesson = lessons[0] ?? null;

    if (type === "entry") {
      // 1. room_visits에 입실 기록 (항상)
      const existing = await sql`
        SELECT id, checked_in_at FROM room_visits
        WHERE student_id = ${student.id} AND visit_date = CURRENT_DATE
      `;
      const alreadyIn = existing.length > 0 && existing[0].checked_in_at;

      if (existing.length === 0) {
        await sql`
          INSERT INTO room_visits (student_id, visit_date, checked_in_at)
          VALUES (${student.id}, CURRENT_DATE, NOW())
        `;
      }
      // 이미 있으면 첫 입실 시간 보존 (업데이트 안 함)

      // 2. 수업이 있으면 attendance 테이블에도 기록
      if (lesson) {
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
      }

      return NextResponse.json({
        data: {
          ok: true,
          type: "entry",
          studentName: student.name,
          className: lesson?.class_name ?? null,
          message: alreadyIn
            ? `${student.name} 학생은 이미 입실 처리되었습니다.`
            : `${student.name} 학생 입실 완료!`,
        },
      });
    } else {
      // 퇴실
      // 1. room_visits에서 오늘 입실 기록 확인
      const visit = await sql`
        SELECT id, checked_in_at FROM room_visits
        WHERE student_id = ${student.id} AND visit_date = CURRENT_DATE
      `;
      if (visit.length === 0 || !visit[0].checked_in_at) {
        return NextResponse.json(
          { error: "입실 기록이 없습니다. 먼저 입실 QR을 스캔하세요." },
          { status: 400 }
        );
      }

      // 2. room_visits 퇴실 시간 업데이트
      await sql`
        UPDATE room_visits
        SET checked_out_at = NOW()
        WHERE student_id = ${student.id} AND visit_date = CURRENT_DATE
      `;

      // 3. 수업이 있으면 attendance에도 퇴실 시간 기록
      if (lesson) {
        await sql`
          UPDATE attendance
          SET checked_out_at = NOW()
          WHERE lesson_id = ${lesson.lesson_id} AND student_id = ${student.id}
        `;
      }

      return NextResponse.json({
        data: {
          ok: true,
          type: "exit",
          studentName: student.name,
          className: lesson?.class_name ?? null,
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
