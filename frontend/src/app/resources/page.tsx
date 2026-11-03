"use client";
import { API_URL } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import StatusBadge from "@/components/StatusBadge";

type Lab = { id: number; name: string };
type Resource = { id: number; name: string; type: string; status: string; lab: Lab | null };

export default function ResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/resources`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { setError("Your session has expired. Sign in again."); return; }
        setResources(await res.json());
      } catch {
        setError("Can't reach the server. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Inventory</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Resources</h1>
          <p className="mt-1 text-sm text-slate-500">Equipment available across labs.</p>
        </div>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white" />
            ))}
          </div>
        )}

        {error && <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        {!loading && !error && (resources.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">No resources to show yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r, i) => (
              <div
                key={r.id}
                style={{ animationDelay: `${i * 70}ms` }}
                className="animate-fade-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-semibold text-slate-900">{r.name}</h2>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-1 text-sm capitalize text-slate-500">{r.type}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs uppercase tracking-wide text-slate-400">Lab</span>
                  <span className="text-sm font-medium text-slate-900">{r.lab ? r.lab.name : "—"}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
