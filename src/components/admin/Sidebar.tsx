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
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "대시보드" },
  { href: "/admin/students", icon: Users, label: "학생 관리" },
  { href: "/admin/classes", icon: BookOpen, label: "반 관리" },
  { href: "/admin/lessons", icon: Calendar, label: "수업 일정" },
  { href: "/admin/attendance", icon: ClipboardCheck, label: "출결 관리" },
  { href: "/admin/scores", icon: BarChart2, label: "성적 관리" },
  { href: "/admin/consultations", icon: MessageCircle, label: "면담 관리" },
  { href: "/admin/tuition", icon: CreditCard, label: "수업료" },
  { href: "/admin/notices", icon: Bell, label: "알림장" },
  { href: "/admin/inquiries", icon: MessageSquare, label: "상담 문의" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("로그아웃 되었습니다.");
    router.push("/login");
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col">
      <div className="p-5 border-b">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">📐</span>
          <span className="font-bold text-blue-600 text-lg">수학 과외</span>
        </Link>
        <p className="text-xs text-gray-400 mt-1">선생님 관리 페이지</p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

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
  );
}
