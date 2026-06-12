"use client";

import { api } from "~/trpc/react";

export function ActiveAgentsBadge() {
  const { data } = api.agent.getActiveCount.useQuery(undefined, {
    refetchInterval: 2000,
  });

  if (!data?.total) return null;

  return (
    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
      {data.total} agent{data.total === 1 ? "" : "s"}
    </span>
  );
}
