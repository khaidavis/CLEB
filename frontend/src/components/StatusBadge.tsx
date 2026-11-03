// One place that decides how every status looks. Reused on resources AND
// (later) reservations, so a status always wears the same color app-wide.
const STYLES: Record<string, string> = {
  AVAILABLE:     "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  MAINTENANCE:   "bg-amber-50 text-amber-700 ring-amber-600/20",
  PENDING_TECH:  "bg-amber-50 text-amber-700 ring-amber-600/20",
  PENDING_ADMIN: "bg-amber-50 text-amber-700 ring-amber-600/20",
  APPROVED:      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  REJECTED:      "bg-rose-50 text-rose-700 ring-rose-600/20",
  CANCELLED:     "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? "bg-slate-100 text-slate-600 ring-slate-500/20";
  const label = status.replace(/_/g, " ").toLowerCase();   // PENDING_TECH -> "pending tech"
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${style}`}>
      {label}
    </span>
  );
}
