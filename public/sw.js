// 수학 공부방 웹 푸시 Service Worker
// 메시지 페이로드 형식: { title: string, body: string, url: string }

self.addEventListener("install", (event) => {
  // 새 SW가 곧바로 활성화되도록 (대기 단계 스킵)
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // 모든 클라이언트에 즉시 제어권 획득
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "알림", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "수학 공부방";
  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    data: { url: data.url || "/" },
    tag: data.tag || undefined,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      // 이미 열린 탭이 같은 origin이면 포커스 + 해당 URL로 이동
      for (const client of allClients) {
        if ("focus" in client) {
          try {
            await client.navigate(url);
            return client.focus();
          } catch {
            // navigate 실패 시 fallback: 새 창
          }
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })()
  );
});
