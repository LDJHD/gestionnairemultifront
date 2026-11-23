import { useEffect, useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { subscribeToPush } from "@/utils/pushNotifications";

export default function PushPrompt() {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!("Notification" in window)) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    if (Notification.permission === "default") setShow(true);
  }, []);

  if (!show) return null;

  const activer = async () => {
    try {
      const r = await subscribeToPush();
      if (r.permission === "granted") {
        setStatus("Notifications activées !");
        setTimeout(() => setShow(false), 2000);
      } else {
        setStatus("Permission refusée.");
        setTimeout(() => setShow(false), 2000);
      }
    } catch (e) {
      setStatus("Erreur : " + (e.message || ""));
      setTimeout(() => setShow(false), 2000);
    }
  };

  return (
    <div className="fixed bottom-24 left-1/2 z-[55] -translate-x-1/2 rounded-2xl border border-ink-200 bg-white px-5 py-3 shadow-lift">
      <div className="flex items-center gap-3">
        <BellIcon className="h-5 w-5 text-brand-600" />
        <span className="text-sm text-ink-700">Recevoir les notifications même hors app ?</span>
        <button onClick={activer} className="lg-btn-primary lg-btn-sm">Activer</button>
        <button onClick={() => setShow(false)} className="text-ink-400 hover:text-ink-700">✕</button>
      </div>
      {status && <p className="mt-1 text-[12px] text-ink-500">{status}</p>}
    </div>
  );
}
