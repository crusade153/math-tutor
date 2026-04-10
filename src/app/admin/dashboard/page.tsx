import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Calendar, MessageSquare } from "lucide-react";

async function getStats() {
  const [students, todayLessons, pendingConsultations, newInquiries] =
    await Promise.all([
      sql`SELECT COUNT(*)::int AS cnt FROM students WHERE deleted_at IS NULL AND is_active = true`,
      sql`
        SELECT l.*, c.name AS class_name
        FROM lessons l
        JOIN classes c ON c.id = l.class_id
        WHERE l.lesson_date = CURRENT_DATE AND l.status = 'scheduled'
        ORDER BY l.start_time
      `,
      sql`SELECT COUNT(*)::int AS cnt FROM consultations WHERE status = 'requested'`,
      sql`SELECT COUNT(*)::int AS cnt FROM inquiries WHERE status = 'new'`,
    ]);

  return {
    totalStudents: (students[0] as { cnt: number }).cnt,
    todayLessons,
    pendingConsultations: (pendingConsultations[0] as { cnt: number }).cnt,
    newInquiries: (newInquiries[0] as { cnt: number }).cnt,
  };
}

export default async function AdminDashboard() {
  const session = await getSession();
  const stats = await getStats();

  const statCards = [
    {
      title: "전체 학생",
      value: `${stats.totalStudents}명`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "오늘 수업",
      value: `${stats.todayLessons.length}개`,
      icon: Calendar,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "면담 신청",
      value: `${stats.pendingConsultations}건`,
      icon: BookOpen,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "신규 문의",
      value: `${stats.newInquiries}건`,
      icon: MessageSquare,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          안녕하세요, {session?.name} 선생님 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {formatDate(new Date())} 기준 현황입니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bg}`}>
                    <Icon size={20} className={card.color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 오늘 수업 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">오늘 수업 일정</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.todayLessons.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">
              오늘 예정된 수업이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.todayLessons.map((lesson: Record<string, unknown>) => (
                <div
                  key={lesson.id as number}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {lesson.class_name as string}
                    </p>
                    <p className="text-xs text-gray-500">
                      {String(lesson.start_time).slice(0, 5)} ~{" "}
                      {String(lesson.end_time).slice(0, 5)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {lesson.topic as string ?? "주제 미설정"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
