"use client";

import { useEffect, useMemo, useRef } from "react";

import { api } from "~/trpc/react";

const iconForType: Record<string, string> = {
  status: "●",
  tool_call: "⚙",
  thinking: "💭",
  assistant: "🤖",
  task: "→",
};

const STREAMABLE_TYPES = new Set(["thinking", "assistant"]);

type FeedEvent = {
  id: string;
  eventType: string;
  label: string;
};

function appendLabel(existing: string, chunk: string): string {
  if (!chunk) return existing;
  if (!existing) return chunk;
  if (chunk.startsWith(existing)) return chunk;
  if (existing.endsWith(chunk) || existing.includes(chunk)) return existing;

  const needsSpace =
    !/\s$/.test(existing) &&
    !/^\s/.test(chunk) &&
    !/^[,.;:!?)]/.test(chunk);

  return existing + (needsSpace ? " " : "") + chunk;
}

function groupStreamEvents(
  events: Array<{ id: string; eventType: string; label: string }>,
): FeedEvent[] {
  const grouped: FeedEvent[] = [];

  for (const event of events) {
    const last = grouped[grouped.length - 1];

    if (
      last &&
      STREAMABLE_TYPES.has(event.eventType) &&
      last.eventType === event.eventType
    ) {
      last.label = appendLabel(last.label, event.label);
      continue;
    }

    grouped.push({
      id: event.id,
      eventType: event.eventType,
      label: event.label,
    });
  }

  return grouped;
}

export function AgentLiveFeed({
  productRequestId,
  isSearching,
}: {
  productRequestId: string;
  isSearching: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: events } = api.agent.getEvents.useQuery(
    { productRequestId },
    { refetchInterval: isSearching ? 1000 : false },
  );

  const feed = useMemo(() => groupStreamEvents(events ?? []), [events]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [feed.length, feed[feed.length - 1]?.label]);

  if (!feed.length && !isSearching) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800 px-4 py-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
        Live agent feed
      </div>
      <div className="max-h-56 overflow-y-auto p-3 font-mono text-xs leading-relaxed md:max-h-72">
        {feed.map((event) => (
          <div key={event.id} className="mb-3 flex gap-2">
            <span className="shrink-0 text-zinc-500">
              {iconForType[event.eventType] ?? "·"}
            </span>
            <span className="whitespace-pre-wrap text-zinc-200">
              {event.label}
            </span>
          </div>
        ))}
        {isSearching && (
          <div className="animate-pulse text-zinc-500">Agent working…</div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
