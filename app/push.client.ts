const VAPID_PUBLIC_KEY =
  "BFkwCzCC2o6irBVr8ds3Tr4gBHoolPF1RIAl0JY7vBqO5_T4ioiByOgLZicqZnAR49FcFflQ9_If4yjXpEYoxAg";

/* Push notification logic. */

// add to `@remix-pwa/sw`
export async function unregisterServiceWorker() {
  const registration = await navigator.serviceWorker.getRegistration();
  await registration?.unregister();
}

export async function subscribeToPush() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
  });
  postToServer("/push", { subscription, type: "subscribe" });
}

export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  postToServer("/push", {
    endpoint: subscription!.endpoint,
    type: "unsubscribe",
  });
  await subscription?.unsubscribe();
}

export async function notifyMe() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  postToServer("/push", {
    endpoint: subscription!.endpoint,
    type: "notify-me",
  });
  console.log("Notified");
}

export async function notifyAll() {
  const response = await fetch("/push", {
    method: "POST",
  });
  if (response.status === 409) {
    document.getElementById("notification-status-message")!.textContent =
      "There are no subscribed endpoints to send messages to, yet.";
  }
}

/* Utility functions. */

// Convert a base64 string to Uint8Array.
// Must do this so the server can understand the VAPID_PUBLIC_KEY.
const urlB64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

async function postToServer(url: string, data: any): Promise<Response> {
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response;
}
