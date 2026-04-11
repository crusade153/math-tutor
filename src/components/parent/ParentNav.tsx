"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ClipboardCheck, MessageCircle, Bell, LogOut } from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { href: "/parent/dashboard", icon: LayoutDashboard, label: "홈" },
  { href: "/parent/attendance", icon: ClipboardCheck, label: "출결" },
  { href: "/parent/consultations", icon: MessageCircle, label: "면담" },
  { href: "/parent/notices", icon: Bell, label: "알림장" },
];

interface ParentNavProps {
  userName?: string;
}

export default function ParentNav({ userName }: ParentNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("로그아웃 되었습니다.");
    router.push("/login");
  }

  return (
    <>
      {/* 데스크탑 사이드바 */}
      <aside className="hidden md:flex w-56 min-h-screen bg-white border-r flex-col sticky top-0 h-screen">
        {/* 로고 */}
        <div className="p-5 border-b">
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <div>
              <span className="font-bold text-indigo-700 text-sm block">수학 공부방</span>
              <span className="text-xs text-gray-400">학부모 페이지</span>
            </div>
          </div>
          {userName && (
            <div className="mt-3 px-3 py-2 rounded-xl bg-indigo-50 text-xs text-indigo-700 font-medium">
              {userName} 학부모님 환영합니다
            </div>
          )}
        </div>

        {/* 메뉴 */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 로그아웃 */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors w-full px-1 py-2"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* 모바일 하단 탭 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-10 safe-area-inset-bottom">
        <div className="grid grid-cols-5 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-xs transition-colors",
                  isActive ? "text-indigo-600" : "text-gray-400"
                )}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 py-3 text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            나가기
          </button>
        </div>
      </nav>
    </>
  );
}
