// app/entry.worker.ts
self.addEventListener("install", (event) => {
  console.log("Service worker installed");
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", (event) => {
  console.log("Service worker activated");
  event.waitUntil(self.clients.claim());
});
self.addEventListener("push", (event) => {
  var _a;
  let notification = (_a = event.data) == null ? void 0 : _a.text();
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
