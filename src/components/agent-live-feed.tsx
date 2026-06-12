"use client";

import { useEffect, useRef } from "react";

import { api } from "~/trpc/react";

const iconForType: Record<string, string> = {
  status: "●",
  tool_call: "⚙",
  thinking: "💭",
  assistant: "🤖",
  task: "→",
};

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events?.length]);

  if (!events?.length && !isSearching) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800 px-4 py-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
        Live agent feed
      </div>
      <div className="max-h-56 overflow-y-auto p-3 font-mono text-xs leading-relaxed md:max-h-72">
        {events?.map((event) => (
          <div key={event.id} className="mb-2 flex gap-2">
            <span className="shrink-0 text-zinc-500">
              {iconForType[event.eventType] ?? "·"}
            </span>
            <span className="text-zinc-200">{event.label}</span>
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
