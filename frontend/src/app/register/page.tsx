"use client";

import { API_URL } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError("");
    if (!fullName || !email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) { setError(data.error ?? "That email is already registered."); return; }
      if (!res.ok) { setError(data.error ?? "Couldn't create your account."); return; }

      // Auto-login right after a successful registration.
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (loginRes.ok) {
        const { token } = await loginRes.json();
        localStorage.setItem("token", token);
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch {
      setError("Can't reach the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-base font-bold text-white">C</div>
          <div className="leading-tight">
            <p className="text-base font-semibold text-slate-900">CLEB</p>
            <p className="text-xs text-slate-500">Campus Lab &amp; Equipment Booking</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">Sign up to start booking labs and equipment.</p>

          <div className="mt-6">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Full name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="Kai Davis" />
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@utech.edu.jm" />
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="********" />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-blue-700 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-800 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/" className="font-medium text-blue-700 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
