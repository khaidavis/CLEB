"use client";
import { API_URL } from "@/lib/api";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import StatusBadge from "@/components/StatusBadge";

const API = `${API_URL}/api`;

type Resource = { id: number; name: string; status: string; lab: { name: string } | null };
type Reservation = {
  id: number; resourceName: string; labName: string;
  startTime: string; endTime: string; status: string;
};
// The form's state machine, written as a type
type FormState = "idle" | "submitting" | "success" | "conflict" | "error";

function fmt(iso: string) {
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function ReservationsPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [resourceId, setResourceId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  // One helper for every API call: adds the token, handles expired sessions
  const authFetch = useCallback(async (path: string, init: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); throw new Error("auth"); }
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      router.push("/");
      throw new Error("auth");
    }
    return res;
  }, [router]);

  const loadReservations = useCallback(async () => {
    const res = await authFetch("/reservations/mine");
    setReservations(await res.json());
  }, [authFetch]);

  useEffect(() => {
    async function load() {
      try {
        const res = await authFetch("/resources");
        setResources(await res.json());
        await loadReservations();
      } catch (e) {
        if (e instanceof Error && e.message === "auth") return;
        setLoadError("Can't reach the server. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authFetch, loadReservations]);

  // Client-side checks: fast feedback (the server still checks too)
  function validate(): string {
    if (!resourceId) return "Choose a resource.";
    if (!start || !end) return "Pick a start and end time.";
    const s = new Date(start), e = new Date(end);
    if (s <= new Date()) return "Start time must be in the future.";
    if (e <= s) return "End time must be after start time.";
    return "";
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    const problem = validate();
    if (problem) { setFormState("error"); setMessage(problem); return; }

    setFormState("submitting");
    setMessage("");
    try {
      const res = await authFetch("/reservations", {
        method: "POST",
        body: JSON.stringify({
          resourceId: Number(resourceId),
          startTime: new Date(start).toISOString(), // local time → UTC
          endTime: new Date(end).toISOString(),
        }),
      });
      if (res.ok) {
        setFormState("success");
        setMessage("Booked! Waiting for technician approval.");
        setStart(""); setEnd("");
        await loadReservations();
        return;
      }
      const body = await res.json().catch(() => ({}));
      setFormState(res.status === 409 ? "conflict" : "error");
      setMessage(body.error ?? "Something went wrong. Try again.");
    } catch (e) {
      if (e instanceof Error && e.message === "auth") return;
      setFormState("error");
      setMessage("Can't reach the server.");
    }
  }

  const msgStyle =
    formState === "success" ? "bg-emerald-50 text-emerald-700"
    : formState === "conflict" ? "bg-amber-50 text-amber-800"
    : "bg-rose-50 text-rose-700";

  const input =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20";

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Bookings</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Reservations</h1>
          <p className="mt-1 text-sm text-slate-500">Book equipment and track your requests.</p>
        </div>

        {loadError && <p className="mb-6 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{loadError}</p>}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Booking form */}
          <form onSubmit={handleSubmit} className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
            <h2 className="text-base font-semibold text-slate-900">New booking</h2>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Resource
              <select value={resourceId} onChange={(e) => setResourceId(e.target.value)} className={input}>
                <option value="">Select…</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id} disabled={r.status !== "AVAILABLE"}>
                    {r.name}{r.lab ? ` · ${r.lab.name}` : ""}{r.status !== "AVAILABLE" ? " (unavailable)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Start
              <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className={input} />
            </label>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              End
              <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className={input} />
            </label>

            {message && <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msgStyle}`}>{message}</p>}

            <button
              type="submit"
              disabled={formState === "submitting"}
              className="mt-5 w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {formState === "submitting" ? "Booking…" : "Book resource"}
            </button>
          </form>

          {/* My reservations */}
          <section className="lg:col-span-2">
            <h2 className="mb-3 text-base font-semibold text-slate-900">My reservations</h2>

            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white" />
                ))}
              </div>
            )}

            {!loading && !loadError && (reservations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <p className="text-sm text-slate-500">No bookings yet. Use the form to make your first one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.map((r, i) => (
                  <div
                    key={r.id}
                    style={{ animationDelay: `${i * 70}ms` }}
                    className="animate-fade-up rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{r.resourceName}</p>
                        <p className="text-xs text-slate-500">{r.labName}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{fmt(r.startTime)} → {fmt(r.endTime)}</p>
                  </div>
                ))}
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
