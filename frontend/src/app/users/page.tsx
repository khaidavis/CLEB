"use client";

import { API_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";

type U = { id: number; email: string; fullName: string; role: string };
const ROLES = ["STUDENT", "TECHNICIAN", "ADMIN"];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<U[]>([]);
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
        if (me.role !== "ADMIN") { router.push("/dashboard"); return; }
        const res = await fetch(`${API_URL}/api/users`, { headers: authHeader() });
        if (!res.ok) { setError("Couldn't load users."); return; }
        setUsers(await res.json());
      } catch { setError("Can't reach the server."); }
      finally { setLoading(false); }
    })();
  }, [router]);

  async function changeRole(id: number, role: string) {
    setMsg("");
    const res = await fetch(`${API_URL}/api/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg(data.error ?? "Couldn't update role."); return; }
    setUsers((prev) => prev.map((u) => (u.id === id ? data : u)));
    setMsg(`Updated ${data.fullName} to ${role.toLowerCase()}.`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Administration</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Promote members to technician or admin.</p>
        </div>

        {msg && <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</p>}
        {loading && <p className="text-sm text-slate-500">Loading...</p>}
        {error && <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        {!loading && !error && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Role</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-3 font-medium text-slate-900">{u.fullName}</td>
                    <td className="px-5 py-3 text-slate-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                        {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
