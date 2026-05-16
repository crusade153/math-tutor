"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

interface ListResponse {
  data: NotificationItem[];
  unread_count: number;
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function NotificationBell() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=20", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = (await res.json()) as ListResponse;
      setItems(json.data ?? []);
      setUnread(json.unread_count ?? 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void fetchList();
    const onFocus = () => void fetchList();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchList]);

  async function markRead(id: number) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnread((c) => Math.max(0, c - 1));
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  }

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
    await fetch("/api/notifications", { method: "PATCH" });
  }

  function handleClick(n: NotificationItem) {
    if (!n.is_read) void markRead(n.id);
    setOpen(false);
    if (n.link_url) router.push(n.link_url);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="알림"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* 백드롭 — 바깥 클릭 시 닫기 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 mt-2 w-80 max-h-[28rem] overflow-auto bg-white border rounded-xl shadow-lg z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white">
              <span className="font-semibold text-sm text-gray-800">알림</span>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                >
                  <Check size={14} />
                  모두 읽음
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-400">
                알림이 없습니다.
              </div>
            ) : (
              <ul className="divide-y">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleClick(n)}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors",
                        !n.is_read && "bg-indigo-50/50"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!n.is_read && (
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {n.title}
                          </div>
                          {n.body && (
                            <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                              {n.body}
                            </div>
                          )}
                          <div className="text-[11px] text-gray-400 mt-1">
                            {timeAgo(n.created_at)}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
