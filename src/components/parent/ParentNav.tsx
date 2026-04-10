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

export default function ParentNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("로그아웃 되었습니다.");
    router.push("/login");
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-10">
      <div className="grid grid-cols-5 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive ? "text-blue-600" : "text-gray-400"
              )}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-3 text-xs text-gray-400"
        >
          <LogOut size={20} />
          나가기
        </button>
      </div>
    </nav>
  );
}
