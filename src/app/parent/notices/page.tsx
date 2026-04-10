import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function ParentNoticesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const notices = await sql`
    SELECT * FROM notices WHERE is_published = true
    ORDER BY published_at DESC
  `;

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
          {notices.map((n: Record<string, unknown>) => (
            <Card key={n.id as number}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{n.title as string}</CardTitle>
                <p className="text-xs text-gray-400">
                  {formatDate(n.published_at as string ?? n.created_at as string)}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {n.content as string}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
