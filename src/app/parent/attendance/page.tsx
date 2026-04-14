import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, gradeLabel } from "@/lib/utils";
import { QrCode } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  present: { label: "출석", color: "bg-green-100 text-green-700" },
  absent:  { label: "결석", color: "bg-red-100 text-red-700" },
  late:    { label: "지각", color: "bg-amber-100 text-amber-700" },
  excused: { label: "공결", color: "bg-blue-100 text-blue-700" },
};

export default async function ParentAttendancePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const students = await sql`
    SELECT id, name, grade FROM students
    WHERE parent_id = ${session.userId} AND deleted_at IS NULL
  `;

  const attendanceByStudent = await Promise.all(
    students.map(async (s) => {
      // 수업 기반 출결 기록
      const lessonRecords = await sql`
        SELECT a.status, a.method, a.checked_at, a.checked_out_at,
               l.lesson_date, l.start_time, c.name AS class_name
        FROM attendance a
        JOIN lessons l ON l.id = a.lesson_id
        JOIN classes c ON c.id = l.class_id
        WHERE a.student_id = ${s.id}
        ORDER BY l.lesson_date DESC, l.start_time DESC
        LIMIT 30
      `;

      // QR 입퇴실 방문 기록
      const visitRecords = await sql`
        SELECT visit_date, checked_in_at, checked_out_at
        FROM room_visits
        WHERE student_id = ${s.id}
        ORDER BY visit_date DESC
        LIMIT 30
      `;

      // ── 출결율: QR 방문 기반 ──────────────────────────────────────
      // 이 학생이 속한 반들의 weekly_count 합산
      const classInfo = await sql`
        SELECT COALESCE(SUM(c.weekly_count), 0)::int AS total_weekly
        FROM class_students cs
        JOIN classes c ON c.id = cs.class_id
        WHERE cs.student_id = ${s.id} AND c.is_active = true AND c.deleted_at IS NULL
      `;
      const totalWeekly = (classInfo[0]?.total_weekly as number) ?? 0;

      // 최근 4주(28일) 기준
      const recentVisits = await sql`
        SELECT COUNT(*)::int AS cnt
        FROM room_visits
        WHERE student_id = ${s.id}
          AND visit_date >= CURRENT_DATE - INTERVAL '28 days'
          AND checked_in_at IS NOT NULL
      `;
      const actualVisits = (recentVisits[0]?.cnt as number) ?? 0;
      const expectedVisits = totalWeekly * 4; // 4주 기대치

      const rateStr =
        expectedVisits === 0
          ? "-"
          : `${Math.min(100, Math.round((actualVisits / expectedVisits) * 100))}%`;

      // ── 기록 병합 (날짜 내림차순) ─────────────────────────────────
      type UnifiedRecord =
        | { kind: "lesson"; date: string; class_name: string; start_time: string; status: string }
        | { kind: "visit"; date: string; checked_in_at: string | null; checked_out_at: string | null };

      const unified: UnifiedRecord[] = [
        ...lessonRecords.map((r) => ({
          kind: "lesson" as const,
          date: r.lesson_date as string,
          class_name: r.class_name as string,
          start_time: r.start_time as string,
          status: r.status as string,
        })),
        ...visitRecords.map((r) => ({
          kind: "visit" as const,
          date: r.visit_date as string,
          checked_in_at: r.checked_in_at as string | null,
          checked_out_at: r.checked_out_at as string | null,
        })),
      ]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 30);

      return { student: s, unified, actualVisits, expectedVisits, rateStr };
    })
  );

  function fmtTime(ts: string | null) {
    if (!ts) return null;
    return new Date(ts).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Seoul",
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">출결 현황</h1>
        <Link href="/parent/scan">
          <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
            <QrCode size={14} className="mr-1" />
            QR 스캔
          </Button>
        </Link>
      </div>

      {attendanceByStudent.map(({ student, unified, actualVisits, expectedVisits, rateStr }) => (
        <Card key={student.id as number}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                {student.name as string}
                <Badge variant="outline" className="text-xs font-normal">
                  {gradeLabel(student.grade as string)}
                </Badge>
              </div>
              <span className={`font-bold ${rateStr === "-" ? "text-gray-400" : "text-blue-600"}`}>
                {rateStr}
              </span>
            </CardTitle>
            <p className="text-xs text-gray-400">
              {expectedVisits > 0
                ? `최근 4주 기대 ${expectedVisits}회 중 ${actualVisits}회 방문`
                : "반 정보 없음 — 관리자에게 문의하세요"}
            </p>
          </CardHeader>
          <CardContent>
            {unified.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                출결 기록이 없습니다.
              </p>
            ) : (
              <div className="space-y-2">
                {unified.map((r, idx) => {
                  if (r.kind === "lesson") {
                    const st = STATUS_MAP[r.status] ?? { label: r.status, color: "bg-gray-100 text-gray-600" };
                    return (
                      <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium">{formatDate(r.date)}</p>
                          <p className="text-xs text-gray-400">
                            {r.class_name} · {String(r.start_time).slice(0, 5)}
                          </p>
                        </div>
                        <Badge className={`text-xs ${st.color}`} variant="outline">
                          {st.label}
                        </Badge>
                      </div>
                    );
                  } else {
                    const inTime = fmtTime(r.checked_in_at);
                    const outTime = fmtTime(r.checked_out_at);
                    return (
                      <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium">{formatDate(r.date)}</p>
                          <p className="text-xs text-gray-400">
                            {inTime ? `입실 ${inTime}` : "입실"}
                            {outTime ? ` · 퇴실 ${outTime}` : " · 공부 중"}
                          </p>
                        </div>
                        <Badge className="text-xs bg-purple-100 text-purple-700" variant="outline">
                          방문
                        </Badge>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
