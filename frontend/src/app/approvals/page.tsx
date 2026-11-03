"use client";

import { API_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import StatusBadge from "@/components/StatusBadge";

type Reservation = {
  id: number; status: string; startTime: string; endTime: string;
  resource: { name: string } | null; user: { fullName: string } | null;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function ApprovalsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/"); return; }
    (async () => {
      try {
        const meRes = await fetch(`${API_URL}/api/auth/me`, { headers: authHeader() });
        if (!meRes.ok) { router.push("/"); return; }
        const me = await meRes.json();
        if (me.role !== "TECHNICIAN" && me.role !== "ADMIN") { router.push("/dashboard"); return; }
        setRole(me.role);

        const res = await fetch(`${API_URL}/api/reservations`, { headers: authHeader() });
        if (!res.ok) { setError("Couldn't load reservations."); return; }
        const all: Reservation[] = await res.json();
        setItems(all.filter((r) => r.status === "PENDING_TECH" || r.status === "PENDING_ADMIN"));
      } catch {
        setError("Can't reach the server.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const canAct = (status: string) =>
    role === "ADMIN" || (role === "TECHNICIAN" && status === "PENDING_TECH");

  async function decide(id: number, approve: boolean) {
    setMsg("");
    const res = await fetch(`${API_URL}/api/reservations/${id}/${approve ? "approve" : "reject"}`, {
      method: "POST", headers: authHeader(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg(data.error ?? "Action failed."); return; }
    // keep only items still pending after the change
    setItems((prev) =>
      prev.map((r) => (r.id === id ? data : r))
          .filter((r) => r.status === "PENDING_TECH" || r.status === "PENDING_ADMIN"));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Workflow</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Approvals</h1>
          <p className="mt-1 text-sm text-slate-500">Reservations awaiting review.</p>
        </div>

        {msg && <p className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{msg}</p>}
        {loading && <p className="text-sm text-slate-500">Loading...</p>}
        {error && <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        {!loading && !error && (items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">Nothing pending. All caught up.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((r, i) => (
              <div key={r.id} style={{ animationDelay: `${i * 50}ms` }}
                className="animate-fade-up flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.resource?.name ?? "\u2014"}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{fmt(r.startTime)} \u2192 {fmt(r.endTime)}</p>
                  {r.user && <p className="mt-0.5 text-xs text-slate-400">Requested by {r.user.fullName}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  {canAct(r.status) && (
                    <>
                      <button onClick={() => decide(r.id, true)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700">
                        Approve
                      </button>
                      <button onClick={() => decide(r.id, false)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100">
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
