"use client";

import { API_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";

type Lab = { id: number; name: string };

export default function ManagePage() {
  const router = useRouter();
  const [labs, setLabs] = useState<Lab[]>([]);
  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  // Create-lab form
  const [labName, setLabName] = useState("");
  const [labLocation, setLabLocation] = useState("");
  const [labCapacity, setLabCapacity] = useState("");
  const [labMsg, setLabMsg] = useState("");

  // Create-resource form
  const [resName, setResName] = useState("");
  const [resType, setResType] = useState("");
  const [resLabId, setResLabId] = useState("");
  const [resMsg, setResMsg] = useState("");

  async function loadLabs() {
    const res = await fetch(`${API_URL}/api/labs`, { headers: authHeader() });
    if (res.ok) setLabs(await res.json());
  }

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/"); return; }
    (async () => {
      const me = await fetch(`${API_URL}/api/auth/me`, { headers: authHeader() });
      if (!me.ok) { router.push("/"); return; }
      if ((await me.json()).role !== "ADMIN") { router.push("/dashboard"); return; }
      loadLabs();
    })();
  }, [router]);

  async function createLab() {
    setLabMsg("");
    if (!labName || !labLocation || !labCapacity) { setLabMsg("Fill in all lab fields."); return; }
    const res = await fetch(`${API_URL}/api/labs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ name: labName, location: labLocation, capacity: Number(labCapacity) }),
    });
    if (!res.ok) { setLabMsg("Couldn't create the lab."); return; }
    setLabName(""); setLabLocation(""); setLabCapacity("");
    setLabMsg("Lab created \u2713");
    loadLabs();
  }

  async function createResource() {
    setResMsg("");
    if (!resName || !resType || !resLabId) { setResMsg("Fill in all equipment fields."); return; }
    const res = await fetch(`${API_URL}/api/resources?labId=${resLabId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ name: resName, type: resType }),
    });
    if (!res.ok) { setResMsg("Couldn't add the equipment."); return; }
    setResName(""); setResType(""); setResLabId("");
    setResMsg("Equipment added \u2713");
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  const labelCls = "mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500";

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Administration</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Manage inventory</h1>
          <p className="mt-1 text-sm text-slate-500">Add labs and the equipment that can be booked.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Create lab */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">New lab</h2>
            <div className="space-y-3">
              <div><label className={labelCls}>Name</label>
                <input value={labName} onChange={(e) => setLabName(e.target.value)} className={inputCls} placeholder="SCIT Software Lab" /></div>
              <div><label className={labelCls}>Location</label>
                <input value={labLocation} onChange={(e) => setLabLocation(e.target.value)} className={inputCls} placeholder="Building D" /></div>
              <div><label className={labelCls}>Capacity</label>
                <input type="number" value={labCapacity} onChange={(e) => setLabCapacity(e.target.value)} className={inputCls} placeholder="40" /></div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={createLab}
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 active:scale-[0.98]">
                Create lab
              </button>
              {labMsg && <span className={`text-sm ${labMsg.includes("\u2713") ? "text-emerald-700" : "text-rose-700"}`}>{labMsg}</span>}
            </div>
          </div>

          {/* Create resource */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">New equipment</h2>
            <div className="space-y-3">
              <div><label className={labelCls}>Name</label>
                <input value={resName} onChange={(e) => setResName(e.target.value)} className={inputCls} placeholder="Oscilloscope #3" /></div>
              <div><label className={labelCls}>Type</label>
                <input value={resType} onChange={(e) => setResType(e.target.value)} className={inputCls} placeholder="oscilloscope" /></div>
              <div><label className={labelCls}>Lab</label>
                <select value={resLabId} onChange={(e) => setResLabId(e.target.value)} className={inputCls}>
                  <option value="">Select a lab...</option>
                  {labs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select></div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={createResource}
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 active:scale-[0.98]">
                Add equipment
              </button>
              {resMsg && <span className={`text-sm ${resMsg.includes("\u2713") ? "text-emerald-700" : "text-rose-700"}`}>{resMsg}</span>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
