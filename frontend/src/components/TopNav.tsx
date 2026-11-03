"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();

  function signOut() {
    localStorage.removeItem("token");
    router.push("/");
  }

  const links = [
    { href: "/dashboard", label: "Labs" },
    { href: "/resources", label: "Resources" },
    { href: "/reservations", label: "Reservations" },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">C</div>
            <p className="text-sm font-semibold text-white">CLEB</p>
          </div>
          <nav className="flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  pathname === l.href ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={signOut}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
