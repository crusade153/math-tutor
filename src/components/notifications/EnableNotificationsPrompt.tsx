"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const ASKED_KEY = "notif_prompt_asked_v1";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function registerAndSubscribe(): Promise<boolean> {
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublic) {
    console.warn("[notif] NEXT_PUBLIC_VAPID_PUBLIC_KEY 환경변수 누락");
    return false;
  }
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    // 기존 구독이 있으면 그대로 사용
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublic),
      });
    }
    const res = await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    });
    return res.ok;
  } catch (err) {
    console.error("[notif] subscribe failed:", err);
    return false;
  }
}

/**
 * 로그인한 사용자에게 알림 권한을 1회 요청.
 * - 이미 허용된 상태면 자동으로 SW 등록 + 구독 갱신 (재로그인/기기 변경 대비)
 * - default 상태면 toast로 안내 후 사용자가 "허용" 클릭 시 권한 요청
 * - 거부됐거나 이미 물어봤으면 아무것도 안 함
 */
export default function EnableNotificationsPrompt() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    const permission = Notification.permission;

    // 이미 허용 → 조용히 구독 동기화
    if (permission === "granted") {
      void registerAndSubscribe();
      return;
    }

    // 명시적 거부 → 아무것도 하지 않음
    if (permission === "denied") return;

    // default — 이미 한 번 물어봤으면 패스
    if (typeof localStorage !== "undefined" && localStorage.getItem(ASKED_KEY)) {
      return;
    }

    const t = setTimeout(() => {
      toast("알림을 받으시겠어요?", {
        description:
          "결석/면담/공지 등 중요 소식을 잠금화면 알림으로 받을 수 있어요.",
        duration: 15000,
        action: {
          label: "허용",
          onClick: async () => {
            const result = await Notification.requestPermission();
            if (result !== "granted") {
              toast.info("알림을 받지 않도록 설정되었습니다.");
              return;
            }
            const ok = await registerAndSubscribe();
            if (ok) {
              toast.success("알림이 활성화되었습니다.");
            } else {
              toast.error("알림 구독에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
          },
        },
        cancel: {
          label: "나중에",
          onClick: () => {
            // 다시 묻지 않음 마킹
            try {
              localStorage.setItem(ASKED_KEY, "1");
            } catch {}
          },
        },
        onDismiss: () => {
          try {
            localStorage.setItem(ASKED_KEY, "1");
          } catch {}
        },
      });
    }, 1500);

    return () => clearTimeout(t);
  }, []);

  return null;
}
