import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import QRScanner from "@/components/parent/QRScanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ScanPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "parent") redirect("/admin/attendance");

  const students = await sql`
    SELECT id, name, grade FROM students
    WHERE parent_id = ${session.userId} AND deleted_at IS NULL AND is_active = true
    ORDER BY name
  `;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-bold text-blue-600">
            📋 QR 출석 체크
          </CardTitle>
          <p className="text-sm text-gray-500">선생님이 보여주는 QR 코드를 스캔하세요</p>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              등록된 학생이 없습니다.
              <br />
              선생님께 문의해주세요.
            </p>
          ) : (
            <QRScanner students={students as { id: number; name: string; grade: string }[]} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
