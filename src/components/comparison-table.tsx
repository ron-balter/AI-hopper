"use client";

import { buildCartAction } from "~/lib/marketplace-cart";
import type { ComparisonTable } from "~/lib/comparison-types";

type TableCandidate = {
  id: string;
  url: string;
  source: string;
};

const cartLinkClass =
  "inline-flex min-h-[40px] w-full items-center justify-center rounded-lg bg-zinc-900 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-zinc-800 md:text-sm";

export function ComparisonTableView({
  table,
  comparing,
  candidates = [],
  onPickCandidate,
  selectedCandidateId,
}: {
  table: ComparisonTable | null;
  comparing?: boolean;
  candidates?: TableCandidate[];
  onPickCandidate?: (candidateId: string) => void;
  selectedCandidateId?: string | null;
}) {
  if (comparing) {
    return (
      <section className="rounded-2xl border border-violet-200 bg-violet-50 p-4 md:p-6">
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

  const candidateById = new Map(candidates.map((c) => [c.id, c]));

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 md:p-6">
      <h2 className="mb-1 text-lg font-semibold text-zinc-900">
        Spec comparison
      </h2>
      {table.summary && (
        <p className="mb-4 text-sm text-zinc-600">{table.summary}</p>
      )}

      <div className="w-full overflow-x-auto rounded-xl border border-zinc-100">
        <table className="w-full min-w-full table-auto border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="sticky left-0 z-10 min-w-[10rem] bg-zinc-50 py-3 pr-6 pl-4 text-left font-medium text-zinc-500 md:min-w-[12rem]">
                Spec
              </th>
              {table.rows.map((row) => (
                <th
                  key={row.candidateId}
                  className="min-w-[11rem] px-4 py-3 text-left font-medium text-zinc-900 md:min-w-[14rem] lg:min-w-[16rem]"
                >
                  <span className="block text-xs font-normal text-zinc-500">
                    {row.source === "AMAZON" ? "Amazon" : "AliExpress"}
                  </span>
                  <span className="block leading-snug">{row.title}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.specs.map((spec) => (
              <tr key={spec} className="border-b border-zinc-100">
                <td className="sticky left-0 z-10 bg-white py-3 pr-6 pl-4 font-medium text-zinc-700">
                  {spec}
                </td>
                {table.rows.map((row) => (
                  <td
                    key={`${row.candidateId}-${spec}`}
                    className="px-4 py-3 align-top text-zinc-600"
                  >
                    {row.values[spec] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-200 bg-zinc-50">
              <td className="sticky left-0 z-10 bg-zinc-50 py-4 pr-6 pl-4 align-middle font-medium text-zinc-700">
                Add to cart
              </td>
              {table.rows.map((row) => {
                const candidate = candidateById.get(row.candidateId);
                if (!candidate) {
                  return (
                    <td key={`cart-${row.candidateId}`} className="px-4 py-4">
                      —
                    </td>
                  );
                }

                const cartAction = buildCartAction(
                  candidate.source as "AMAZON" | "ALIEXPRESS",
                  candidate.url,
                );
                const isSelected = selectedCandidateId === candidate.id;

                return (
                  <td
                    key={`cart-${row.candidateId}`}
                    className="px-4 py-4 align-middle"
                  >
                    <a
                      href={cartAction.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={cartAction.hint}
                      onClick={() => onPickCandidate?.(candidate.id)}
                      className={`${cartLinkClass} ${isSelected ? "bg-emerald-700 hover:bg-emerald-600" : ""}`}
                    >
                      {cartAction.buttonLabel}
                    </a>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
