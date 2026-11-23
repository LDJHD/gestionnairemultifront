// utils/pushNotifications.js
const API_URL = import.meta.env.VITE_API_URL;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function getVapidPublicKey() {
  const r = await fetch(`${API_URL}/api/v1/push/vapid-public-key`);
  if (!r.ok) throw new Error("VAPID key unavailable");
  const d = await r.json();
  return d.publicKey;
}

export async function subscribeToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push non supporté");
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, permission };

  const registration = await navigator.serviceWorker.ready;
  const publicKey = await getVapidPublicKey();
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const token = localStorage.getItem("token");
  await fetch(`${API_URL}/api/v1/push/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ subscription }),
  });
  return { ok: true, permission };
}

export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const sub = await registration.pushManager.getSubscription();
  if (sub) {
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/api/v1/push/unsubscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
    await sub.unsubscribe();
  }
  return { ok: true };
}
