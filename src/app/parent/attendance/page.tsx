import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, gradeLabel, calculateAttendanceRate } from "@/lib/utils";
import { QrCode } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  present: { label: "출석", color: "bg-green-100 text-green-700" },
  absent: { label: "결석", color: "bg-red-100 text-red-700" },
  late: { label: "지각", color: "bg-amber-100 text-amber-700" },
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
      const records = await sql`
        SELECT a.status, a.method, a.checked_at,
               l.lesson_date, l.start_time, l.end_time,
               c.name AS class_name
        FROM attendance a
        JOIN lessons l ON l.id = a.lesson_id
        JOIN classes c ON c.id = l.class_id
        WHERE a.student_id = ${s.id}
        ORDER BY l.lesson_date DESC, l.start_time DESC
        LIMIT 20
      `;

      const totalLessons = await sql`
        SELECT COUNT(*)::int AS total
        FROM class_students cs
        JOIN lessons l ON l.class_id = cs.class_id
        WHERE cs.student_id = ${s.id}
          AND l.lesson_date <= CURRENT_DATE
          AND l.status IN ('scheduled', 'completed')
      `;

      const attended = records.filter(
        (r) => (r as { status: string }).status === "present"
      ).length;
      const total = (totalLessons[0] as { total: number }).total;

      return { student: s, records, attended, total };
    })
  );

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

      {attendanceByStudent.map(({ student, records, attended, total }) => (
        <Card key={student.id as number}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                {student.name as string}
                <Badge variant="outline" className="text-xs font-normal">
                  {gradeLabel(student.grade as string)}
                </Badge>
              </div>
              <span className="text-blue-600 font-bold">
                {calculateAttendanceRate(attended, total)}
              </span>
            </CardTitle>
            <p className="text-xs text-gray-400">
              전체 {total}회 중 {attended}회 출석
            </p>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                출결 기록이 없습니다.
              </p>
            ) : (
              <div className="space-y-2">
                {records.map((r: Record<string, unknown>, idx: number) => {
                  const st = STATUS_MAP[r.status as string] ?? { label: r.status as string, color: "bg-gray-100 text-gray-600" };
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {formatDate(r.lesson_date as string)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {r.class_name as string} · {String(r.start_time).slice(0, 5)}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs ${st.color}`}
                        variant="outline"
                      >
                        {st.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
