"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { AgentLiveFeed } from "~/components/agent-live-feed";
import { ComparisonTableView } from "~/components/comparison-table";
import { MobileHeader } from "~/components/mobile-header";
import { ProductCandidateCard } from "~/components/product-candidate-card";
import { SdkMetadataBar } from "~/components/sdk-metadata-bar";
import { StatusBadge } from "~/components/status-badge";
import { buildCartAction } from "~/lib/marketplace-cart";
import { parseComparisonTable } from "~/lib/comparison-types";
import { api } from "~/trpc/react";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const utils = api.useUtils();
  const [showTranscript, setShowTranscript] = useState(false);

  const { data: product } = api.product.getById.useQuery(
    { id },
    {
      refetchInterval: (q) => {
        const d = q.state.data;
        if (d?.status === "SEARCHING" || d?.comparisonStatus === "COMPARING") {
          return 1500;
        }
        return false;
      },
    },
  );

  const startSearch = api.product.startSearch.useMutation({
    onSuccess: () => void utils.product.invalidate(),
  });
  const searchAgain = api.product.searchAgain.useMutation({
    onSuccess: () => void utils.product.invalidate(),
  });
  const selectCandidate = api.product.selectCandidate.useMutation({
    onSuccess: () => void utils.product.invalidate(),
  });

  if (!product) {
    return (
      <div className="min-h-dvh">
        <MobileHeader title="Loading…" backHref="/" wide />
        <p className="p-8 text-center text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  const isSearching = product.status === "SEARCHING";
  const isComparing = product.comparisonStatus === "COMPARING";
  const comparisonTable = parseComparisonTable(product.comparisonTableJson);
  const canStart = product.status === "DRAFT" || product.status === "FAILED";
  const canSearchAgain =
    product.status === "READY_FOR_REVIEW" ||
    product.status === "SELECTED" ||
    product.status === "FAILED";

  const selectedCandidate = product.candidates.find(
    (c) => c.id === product.selectedCandidateId,
  );

  const pickCandidate = (candidateId: string) => {
    if (product.status === "SELECTED") return;
    void selectCandidate.mutate({ productRequestId: id, candidateId });
  };

  return (
    <div className="min-h-dvh pb-28">
      <MobileHeader title={product.title} backHref="/" wide />

      <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={product.status} />
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-medium text-zinc-500">What you want</h2>
          <p className="text-sm text-zinc-800">{product.description}</p>
          <h2 className="mb-2 mt-4 text-sm font-medium text-zinc-500">Why</h2>
          <p className="text-sm text-zinc-800">{product.rationale}</p>
        </section>

        <SdkMetadataBar
          agentId={product.agentId}
          lastRunId={product.lastRunId}
          lastRequestId={product.lastRequestId}
          durationMs={product.durationMs}
        />

        <AgentLiveFeed
          productRequestId={id}
          isSearching={isSearching || isComparing}
        />

        {(isComparing || comparisonTable) && product.candidates.length >= 2 && (
          <ComparisonTableView
            table={comparisonTable}
            comparing={isComparing}
            candidates={product.candidates.map((c) => ({
              id: c.id,
              url: c.url,
              source: c.source,
            }))}
            selectedCandidateId={product.selectedCandidateId}
            onPickCandidate={pickCandidate}
          />
        )}

        {canStart && (
          <button
            type="button"
            disabled={startSearch.isPending}
            onClick={() => startSearch.mutate({ id })}
            className="min-h-[48px] w-full rounded-xl bg-zinc-900 text-sm font-semibold text-white disabled:opacity-50"
          >
            Start search
          </button>
        )}

        {canSearchAgain && (
          <button
            type="button"
            disabled={searchAgain.isPending}
            onClick={() => searchAgain.mutate({ id })}
            className="min-h-[48px] w-full rounded-xl border border-zinc-300 text-sm font-medium text-zinc-700 disabled:opacity-50"
          >
            Search again (Agent.resume)
          </button>
        )}

        {selectedCandidate && (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <h2 className="mb-1 text-sm font-medium text-emerald-800">
              Your pick
            </h2>
            <p className="mb-3 text-sm text-emerald-900">
              {selectedCandidate.title}
            </p>
            <a
              href={
                buildCartAction(
                  selectedCandidate.source as "AMAZON" | "ALIEXPRESS",
                  selectedCandidate.url,
                ).url
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-emerald-700 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              {
                buildCartAction(
                  selectedCandidate.source as "AMAZON" | "ALIEXPRESS",
                  selectedCandidate.url,
                ).buttonLabel
              }
            </a>
          </section>
        )}

        {product.candidates.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">Candidates</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {product.candidates.map((candidate) => (
                <ProductCandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  selected={product.selectedCandidateId === candidate.id}
                  onPick={
                    product.status !== "SELECTED"
                      ? () => pickCandidate(candidate.id)
                      : undefined
                  }
                  disabled={selectCandidate.isPending}
                />
              ))}
            </div>
          </section>
        )}

        {product.transcriptJson && (
          <section>
            <button
              type="button"
              onClick={() => setShowTranscript((v) => !v)}
              className="text-sm font-medium text-blue-600"
            >
              {showTranscript ? "Hide" : "Show"} agent transcript
            </button>
            {showTranscript && (
              <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-zinc-950 p-3 text-xs text-zinc-300">
                {product.transcriptJson}
              </pre>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
