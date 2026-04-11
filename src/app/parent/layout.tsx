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
    <div className="min-h-screen bg-gray-50 flex">
      {/* 데스크탑 사이드바 (ParentNav 내부에서 처리) */}
      <ParentNav userName={session.name} />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 모바일 상단 헤더 */}
        <header className="md:hidden sticky top-0 z-20 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">📚</span>
            <span className="font-bold text-indigo-700">수학 공부방</span>
          </div>
          <span className="text-sm text-gray-500">{session.name} 학부모님</span>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="flex-1 px-4 py-5 md:p-6 pb-24 md:pb-6 max-w-2xl md:max-w-3xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
