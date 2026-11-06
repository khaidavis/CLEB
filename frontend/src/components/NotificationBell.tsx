"use client";

import { API_URL } from "@/lib/api";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Notif = { id: number; message: string; link: string; readFlag: boolean; createdAt: string };

export default function NotificationBell() {
  const router = useRouter();
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
  const unread = items.filter((n) => !n.readFlag).length;

  async function load() {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, { headers: authHeader() });
      if (res.ok) setItems(await res.json());
    } catch {}
  }

  // Load now, then poll every 20s so new notifications appear without a refresh.
  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  // Close the dropdown when clicking outside it.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function openPanel() {
    setOpen((o) => !o);
    if (!open && unread > 0) {
      await fetch(`${API_URL}/api/notifications/read-all`, { method: "POST", headers: authHeader() });
      setItems((prev) => prev.map((n) => ({ ...n, readFlag: true })));
    }
  }

  function go(link: string) { setOpen(false); router.push(link); }

  return (
    <div className="relative" ref={boxRef}>
      <button onClick={openPanel} aria-label="Notifications"
        className="relative rounded-md border border-slate-700 px-2.5 py-1.5 text-slate-200 transition hover:bg-slate-800">
        <span aria-hidden>🔔</span>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notifications
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">You're all caught up.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.slice(0, 15).map((n) => (
                <li key={n.id}>
                  <button onClick={() => go(n.link)}
                    className="block w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50">
                    {n.message}
                    <span className="mt-0.5 block text-xs text-slate-400">
                      {new Date(n.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
