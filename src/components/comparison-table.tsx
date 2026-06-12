"use client";

import type { ComparisonTable } from "~/lib/comparison-types";

export function ComparisonTableView({
  table,
  comparing,
}: {
  table: ComparisonTable | null;
  comparing?: boolean;
}) {
  if (comparing) {
    return (
      <section className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
        <h2 className="mb-2 text-lg font-semibold text-violet-900">
          Spec comparison
        </h2>
        <p className="animate-pulse text-sm text-violet-700">
          Comparison agent building table…
        </p>
      </section>
    );
  }

  if (!table?.rows.length) return null;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4">
      <h2 className="mb-1 text-lg font-semibold text-zinc-900">
        Spec comparison
      </h2>
      {table.summary && (
        <p className="mb-4 text-sm text-zinc-600">{table.summary}</p>
      )}

      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[32rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="sticky left-0 bg-white py-2 pr-4 text-left font-medium text-zinc-500">
                Spec
              </th>
              {table.rows.map((row) => (
                <th
                  key={row.candidateId}
                  className="min-w-[8rem] px-3 py-2 text-left font-medium text-zinc-900"
                >
                  <span className="block text-xs text-zinc-500">
                    {row.source === "AMAZON" ? "Amazon" : "AliExpress"}
                  </span>
                  <span className="line-clamp-2">{row.title}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.specs.map((spec) => (
              <tr key={spec} className="border-b border-zinc-100">
                <td className="sticky left-0 bg-white py-2.5 pr-4 font-medium text-zinc-700">
                  {spec}
                </td>
                {table.rows.map((row) => (
                  <td
                    key={`${row.candidateId}-${spec}`}
                    className="px-3 py-2.5 text-zinc-600"
                  >
                    {row.values[spec] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
