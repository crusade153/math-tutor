import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calculateAttendanceRate, formatDate, gradeLabel } from "@/lib/utils";
import { QrCode, Calendar, Bell } from "lucide-react";

async function getParentData(parentId: number) {
  const [students, nextLesson, notices] = await Promise.all([
    sql`
      SELECT s.id, s.name, s.grade, s.school
      FROM students s
      WHERE s.parent_id = ${parentId} AND s.deleted_at IS NULL
    `,
    sql`
      SELECT l.*, c.name AS class_name
      FROM lessons l
      JOIN classes c ON c.id = l.class_id
      JOIN class_students cs ON cs.class_id = c.id
      JOIN students s ON s.id = cs.student_id
      WHERE s.parent_id = ${parentId}
        AND l.lesson_date >= CURRENT_DATE
        AND l.status = 'scheduled'
      ORDER BY l.lesson_date, l.start_time
      LIMIT 1
    `,
    sql`
      SELECT n.id, n.title, n.published_at, n.created_at FROM notices n
      WHERE n.is_published = true
        AND (
          n.target = 'all'
          OR (
            n.target = 'individual'
            AND n.target_id IN (
              SELECT id FROM students WHERE parent_id = ${parentId} AND deleted_at IS NULL
            )
          )
          OR (
            n.target = 'class'
            AND n.target_id IN (
              SELECT cs.class_id FROM class_students cs
              JOIN students s ON s.id = cs.student_id
              WHERE s.parent_id = ${parentId} AND s.deleted_at IS NULL
            )
          )
        )
      ORDER BY n.published_at DESC
      LIMIT 3
    `,
  ]);

  type StudentRow = { id: number; name: string; grade: string; school: string | null };

  // 각 학생의 출석률 계산
  const studentStats = await Promise.all(
    (students as unknown as StudentRow[]).map(async (s) => {
      const stats = await sql`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE a.status = 'present')::int AS attended
        FROM class_students cs
        JOIN lessons l ON l.class_id = cs.class_id
        LEFT JOIN attendance a ON a.lesson_id = l.id AND a.student_id = cs.student_id
        WHERE cs.student_id = ${s.id}
          AND l.lesson_date <= CURRENT_DATE
          AND l.status IN ('scheduled', 'completed')
      `;
      const stat = stats[0] as { total: number; attended: number };
      return {
        id: s.id,
        name: s.name,
        grade: s.grade,
        school: s.school,
        total: stat.total,
        attended: stat.attended,
      };
    })
  );

  return { students: studentStats, nextLesson: nextLesson[0] ?? null, notices };
}

export default async function ParentDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { students, nextLesson, notices } = await getParentData(session.userId);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">안녕하세요 👋</h1>
        <p className="text-gray-500 text-sm">{session.name} 학부모님</p>
      </div>

      {/* 빠른 QR 스캔 버튼 */}
      <Link href="/parent/scan">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-base">
          <QrCode size={22} className="mr-2" />
          QR 출석 체크
        </Button>
      </Link>

      {/* 자녀 출결 현황 */}
      {students.map((s) => (
        <Card key={s.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              {s.name}
              <Badge variant="outline" className="text-xs font-normal">
                {gradeLabel(s.grade)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {calculateAttendanceRate(s.attended, s.total)}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  출석률 ({s.attended}/{s.total}회)
                </p>
              </div>
              <Link href="/parent/attendance">
                <Button variant="outline" size="sm">
                  상세 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* 다음 수업 */}
      {nextLesson && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" />
              다음 수업
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {(nextLesson as Record<string, unknown>).class_name as string}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate((nextLesson as Record<string, unknown>).lesson_date as string)}{" "}
              {String((nextLesson as Record<string, unknown>).start_time).slice(0, 5)} ~{" "}
              {String((nextLesson as Record<string, unknown>).end_time).slice(0, 5)}
            </p>
            {Boolean((nextLesson as Record<string, unknown>).topic) && (
              <p className="text-sm text-gray-400 mt-0.5">
                주제: {(nextLesson as Record<string, unknown>).topic as string}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 최근 알림장 */}
      {(notices as unknown[]).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell size={16} className="text-amber-500" />
              최근 알림장
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(notices as Record<string, unknown>[]).map((n) => (
              <div key={n.id as number} className="flex items-center justify-between py-1 border-b last:border-0">
                <p className="text-sm truncate flex-1">{n.title as string}</p>
                <p className="text-xs text-gray-400 ml-2 shrink-0">
                  {formatDate(n.created_at as string)}
                </p>
              </div>
            ))}
            <Link href="/parent/notices">
              <Button variant="ghost" size="sm" className="w-full mt-1 text-blue-600">
                전체 보기
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
