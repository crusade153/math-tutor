import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { BarChart2, Bell } from "lucide-react";

export default async function ParentNoticesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // 개인화 필터링: 자신의 자녀와 관련된 공지만 표시
  const notices = await sql`
    SELECT n.* FROM notices n
    WHERE n.is_published = true
      AND (
        n.target = 'all'
        OR (
          n.target = 'individual'
          AND n.target_id IN (
            SELECT id FROM students
            WHERE parent_id = ${session.userId} AND deleted_at IS NULL
          )
        )
        OR (
          n.target = 'class'
          AND n.target_id IN (
            SELECT cs.class_id
            FROM class_students cs
            JOIN students s ON s.id = cs.student_id
            WHERE s.parent_id = ${session.userId} AND s.deleted_at IS NULL
          )
        )
      )
    ORDER BY n.published_at DESC
  `;

  const isFeedback = (title: string) => title.startsWith("[성적 피드백]");

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">알림장</h1>

      {notices.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-400 text-sm">
            등록된 알림장이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(notices as Record<string, unknown>[]).map((n) => {
            const title = n.title as string;
            const feedback = isFeedback(title);

            return (
              <Card
                key={n.id as number}
                className={feedback ? "border-amber-200 bg-amber-50/40" : ""}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    {feedback ? (
                      <BarChart2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    ) : (
                      <Bell size={16} className="text-blue-400 mt-0.5 shrink-0" />
                    )}
                    <CardTitle className="text-base leading-snug flex-1">
                      {feedback
                        ? title.replace("[성적 피드백] ", "")
                        : title}
                    </CardTitle>
                    {feedback && (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[11px] shrink-0">
                        성적 피드백
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 ml-6">
                    {formatDate((n.published_at as string) ?? (n.created_at as string))}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {n.content as string}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
