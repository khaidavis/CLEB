"use client";

import { API_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import StatusBadge from "@/components/StatusBadge";

type Resource = { id: number; name: string };
type Reservation = {
  id: number; status: string; startTime: string; endTime: string;
  resource: Resource | null; user: { fullName: string } | null;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [resourceId, setResourceId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [formMsg, setFormMsg] = useState("");
  const [booking, setBooking] = useState(false);

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  async function loadAll() {
    try {
      const [rRes, resRes] = await Promise.all([
        fetch(`${API_URL}/api/reservations`, { headers: authHeader() }),
        fetch(`${API_URL}/api/resources`, { headers: authHeader() }),
      ]);
      // NOTE: on an error we show a message — we do NOT clear the token or log out.
      if (!rRes.ok || !resRes.ok) { setError("Couldn't load reservations."); return; }
      setReservations(await rRes.json());
      setResources(await resRes.json());
    } catch {
      setError("Can't reach the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/"); return; }
    loadAll();
  }, [router]);

  async function book() {
    setFormMsg("");
    if (!resourceId || !start || !end) { setFormMsg("Pick a resource and both times."); return; }
    setBooking(true);
    try {
      const res = await fetch(`${API_URL}/api/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          resourceId: Number(resourceId),
          startTime: new Date(start).toISOString(),
          endTime: new Date(end).toISOString(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) { setFormMsg(data.error ?? "That slot is already booked."); return; }
      if (res.status === 400) { setFormMsg(data.error ?? "Check your times."); return; }
      if (!res.ok) { setFormMsg("Couldn't book. Try again."); return; }
      setReservations((prev) => [data, ...prev]);
      setResourceId(""); setStart(""); setEnd("");
      setFormMsg("Booked \u2713");
    } catch {
      setFormMsg("Can't reach the server.");
    } finally {
      setBooking(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Bookings</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Reservations</h1>
          <p className="mt-1 text-sm text-slate-500">Book a resource and track its approval status.</p>
        </div>

        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">New booking</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Resource</label>
              <select value={resourceId} onChange={(e) => setResourceId(e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {resources.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Start</label>
              <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">End</label>
              <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={book} disabled={booking}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60">
              {booking ? "Booking..." : "Book"}
            </button>
            {formMsg && (
              <span className={`text-sm ${formMsg.includes("\u2713") ? "text-emerald-700" : "text-rose-700"}`}>{formMsg}</span>
            )}
          </div>
        </div>

        {loading && <p className="text-sm text-slate-500">Loading...</p>}
        {error && <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        {!loading && !error && (reservations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">No reservations yet. Book one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((r, i) => (
              <div key={r.id} style={{ animationDelay: `${i * 50}ms` }}
                className="animate-fade-up flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.resource ? r.resource.name : "\u2014"}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{fmt(r.startTime)} \u2192 {fmt(r.endTime)}</p>
                  {r.user && <p className="mt-0.5 text-xs text-slate-400">Booked by {r.user.fullName}</p>}
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
