const styles: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700",
  SEARCHING: "bg-amber-100 text-amber-800",
  READY_FOR_REVIEW: "bg-blue-100 text-blue-800",
  SELECTED: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
};

const labels: Record<string, string> = {
  DRAFT: "Draft",
  SEARCHING: "Searching",
  READY_FOR_REVIEW: "Ready",
  SELECTED: "Selected",
  FAILED: "Failed",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex min-h-[28px] items-center rounded-full px-3 py-1 text-xs font-medium ${styles[status] ?? "bg-zinc-100 text-zinc-700"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
