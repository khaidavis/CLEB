"use client";
import { API_URL } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";

type Lab = { id: number; name: string; location: string; capacity: number };

export default function DashboardPage() {
  const router = useRouter();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    async function loadLabs() {
      try {
        const res = await fetch(`${API_URL}/api/labs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setError("Your session has expired. Sign in again.");
          return;
        }
        setLabs(await res.json());
      } catch {
        setError("Can't reach the server. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }
    loadLabs();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Overview</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Labs</h1>
          <p className="mt-1 text-sm text-slate-500">Rooms available for booking across campus.</p>
        </div>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white" />
            ))}
          </div>
        )}

        {error && <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        {!loading && !error && (labs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">No labs to show yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {labs.map((lab, i) => (
              <div
                key={lab.id}
                style={{ animationDelay: `${i * 70}ms` }}
                className="animate-fade-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <rect x="4" y="3" width="16" height="18" rx="1" />
                    <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-slate-900">{lab.name}</h2>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21s-6-5.686-6-10a6 6 0 1112 0c0 4.314-6 10-6 10z" />
                    <circle cx="12" cy="11" r="2" />
                  </svg>
                  {lab.location}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs uppercase tracking-wide text-slate-400">Capacity</span>
                  <span className="text-sm font-medium text-slate-900">{lab.capacity} seats</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
