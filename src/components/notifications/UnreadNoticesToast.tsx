"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SESSION_KEY = "notice_toast_shown_v1";

interface Props {
  /** 클릭 시 이동할 공지 목록 경로 (예: '/parent/notices', '/admin/notices') */
  noticesUrl: string;
}

/**
 * 로그인한 사용자의 첫 진입 시 1회, 미읽음 공지가 있으면 토스트로 안내.
 * sessionStorage 사용 — 탭/세션 종료 시 다시 표시.
 */
export default function UnreadNoticesToast({ noticesUrl }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // sessionStorage 사용 불가한 환경(시크릿/SSR 등)에서는 매번 표시되어도 무방
    }

    (async () => {
      try {
        const res = await fetch(
          "/api/notifications?type=notice&unread=true&limit=100",
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const json = (await res.json()) as { data?: unknown[] };
        const count = json.data?.length ?? 0;
        if (count > 0) {
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {}
          toast.info(`읽지 않은 알림장이 ${count}건 있습니다.`, {
            action: {
              label: "보러가기",
              onClick: () => router.push(noticesUrl),
            },
            duration: 8000,
          });
        }
      } catch {
        // 네트워크 실패 시 조용히 무시
      }
    })();
  }, [noticesUrl, router]);

  return null;
}
