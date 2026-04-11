"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  BarChart2,
  MessageCircle,
  CreditCard,
  Bell,
  MessageSquare,
  LogOut,
  UserCog,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "대시보드" },
  { href: "/admin/students", icon: Users, label: "학생 관리" },
  { href: "/admin/parents", icon: UserCog, label: "학부모 관리" },
  { href: "/admin/classes", icon: BookOpen, label: "반 관리" },
  { href: "/admin/lessons", icon: Calendar, label: "수업 일정" },
  { href: "/admin/attendance", icon: ClipboardCheck, label: "출결 관리" },
  { href: "/admin/scores", icon: BarChart2, label: "성적 관리" },
  { href: "/admin/consultations", icon: MessageCircle, label: "면담 관리" },
  { href: "/admin/tuition", icon: CreditCard, label: "수업료" },
  { href: "/admin/notices", icon: Bell, label: "알림장" },
  { href: "/admin/inquiries", icon: MessageSquare, label: "신규 상담 문의" }, // 기존
  { href: "/admin/parent-inquiries", icon: MessageSquare, label: "학부모 문의 관리" }, // 새로 추가된 메뉴
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("로그아웃 되었습니다.");
    router.push("/login");
  }

  return (
    <>
      {/* 모바일 오버레이 */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 min-h-screen bg-white border-r flex flex-col transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* 헤더 */}
        <div className="p-5 border-b flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <span className="text-2xl">📚</span>
            <div>
              <span className="font-bold text-indigo-700 text-base block">수학 공부방</span>
              <span className="text-xs text-gray-400">선생님 관리 페이지</span>
            </div>
          </Link>
          {/* 모바일 닫기 버튼 */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
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
    </>
  );
}