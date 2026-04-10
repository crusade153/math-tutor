import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ParentNav from "@/components/parent/ParentNav";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "parent") redirect("/admin/dashboard");

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* 상단 헤더 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📐</span>
            <span className="font-bold text-blue-600">수학 과외</span>
          </div>
          <span className="text-sm text-gray-500">{session.name} 학부모님</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>

      {/* 모바일 하단 탭 네비게이션 */}
      <ParentNav />
    </div>
  );
}
