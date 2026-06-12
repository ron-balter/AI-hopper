"use client";

import { useState } from "react";

export function SdkMetadataBar({
  agentId,
  lastRunId,
  lastRequestId,
  durationMs,
}: {
  agentId?: string | null;
  lastRunId?: string | null;
  lastRequestId?: string | null;
  durationMs?: number | null;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!agentId && !lastRunId && !lastRequestId) return null;

  const copy = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const chips = [
    agentId ? { label: "agentId", value: agentId } : null,
    lastRunId ? { label: "runId", value: lastRunId } : null,
    lastRequestId ? { label: "requestId", value: lastRequestId } : null,
    durationMs != null
      ? { label: "duration", value: `${durationMs}ms` }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Cursor SDK
      </p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => copy(chip.label, chip.value)}
            className="max-w-full truncate rounded-lg bg-white px-2.5 py-1.5 font-mono text-xs text-zinc-700 ring-1 ring-zinc-200"
          >
            {chip.label}: {chip.value.slice(0, 24)}
            {chip.value.length > 24 ? "…" : ""}
            {copied === chip.label ? " ✓" : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
