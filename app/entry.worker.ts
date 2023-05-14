/// <reference lib="WebWorker" />

// Service Workers are quite broken in ts, this is a workaround
export type {};
declare let self: ServiceWorkerGlobalScope;

self.addEventListener("install", (event: ExtendableEvent) => {
  console.log("Service worker installed");
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  console.log("Service worker activated");
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let notification = event.data?.text();

  // console.log(notification, "sss");
  
  self.registration.showNotification(
    "Remix Push Notifications",
    {
      body: notification,
      icon: "/favicon.ico",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    }
  );
});