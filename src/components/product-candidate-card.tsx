"use client";

import { buildCartAction } from "~/lib/marketplace-cart";
import { StatusBadge } from "~/components/status-badge";

type Candidate = {
  id: string;
  source: string;
  title: string;
  url: string;
  price: string | null;
  currency: string | null;
  rating: number | null;
  reviewCount: number | null;
  reviewSummary: string;
  pros: string | null;
  cons: string | null;
  rank: number | null;
};

const cartLinkClass =
  "flex min-h-[44px] flex-1 items-center justify-center rounded-xl px-4 text-sm font-medium text-white";

export function ProductCandidateCard({
  candidate,
  selected,
  onPick,
  disabled,
}: {
  candidate: Candidate;
  selected?: boolean;
  onPick?: () => void;
  disabled?: boolean;
}) {
  const cartAction = buildCartAction(
    candidate.source as "AMAZON" | "ALIEXPRESS",
    candidate.url,
  );

  const sourceColor =
    candidate.source === "AMAZON"
      ? "bg-orange-100 text-orange-800"
      : "bg-red-100 text-red-800";

  return (
    <article
      className={`flex h-full flex-col rounded-2xl border p-4 ${selected ? "border-emerald-500 bg-emerald-50/50" : "border-zinc-200 bg-white"}`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${sourceColor}`}
        >
          {candidate.source === "AMAZON" ? "Amazon" : "AliExpress"}
        </span>
        {candidate.rank != null && (
          <span className="text-xs text-zinc-500">#{candidate.rank}</span>
        )}
        {selected && <StatusBadge status="SELECTED" />}
      </div>

      <h3 className="mb-2 text-base font-semibold text-zinc-900">
        {candidate.title}
      </h3>

      <div className="mb-3 flex flex-wrap gap-3 text-sm text-zinc-600">
        {candidate.price && (
          <span className="font-medium text-zinc-900">
            {candidate.currency ?? "$"}
            {candidate.price}
          </span>
        )}
        {candidate.rating != null && (
          <span>
            ★ {candidate.rating}
            {candidate.reviewCount != null &&
              ` (${candidate.reviewCount.toLocaleString()})`}
          </span>
        )}
      </div>

      <p className="mb-3 text-sm text-zinc-600">{candidate.reviewSummary}</p>

      {candidate.pros && (
        <p className="mb-1 text-sm text-emerald-700">
          <span className="font-medium">Pros:</span> {candidate.pros}
        </p>
      )}
      {candidate.cons && (
        <p className="mb-3 text-sm text-red-700">
          <span className="font-medium">Cons:</span> {candidate.cons}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row">
        <a
          href={candidate.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-zinc-300 px-4 text-sm font-medium text-zinc-700"
        >
          View listing
        </a>
        {(onPick || selected) && (
          <a
            href={disabled ? undefined : cartAction.url}
            target="_blank"
            rel="noopener noreferrer"
            title={cartAction.hint}
            aria-disabled={disabled}
            onClick={(e) => {
              if (disabled) {
                e.preventDefault();
                return;
              }
              onPick?.();
            }}
            className={`${cartLinkClass} ${
              selected
                ? "bg-emerald-700 hover:bg-emerald-600"
                : "bg-zinc-900 hover:bg-zinc-800"
            } ${disabled ? "pointer-events-none opacity-50" : ""}`}
          >
            {onPick
              ? cartAction.buttonLabel
              : `${cartAction.buttonLabel} again`}
          </a>
        )}
      </div>
    </article>
  );
}
