import Link from "next/link";

import { NotificationBell } from "~/components/notification-bell";
import { ActiveAgentsBadge } from "~/components/active-agents-badge";

export function MobileHeader({
  title,
  backHref,
}: {
  title: string;
  backHref?: string;
}) {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {backHref ? (
            <Link
              href={backHref}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg text-zinc-600 hover:bg-zinc-100"
              aria-label="Back"
            >
              ←
            </Link>
          ) : (
            <Link href="/" className="text-sm font-semibold text-zinc-900">
              Hopper
            </Link>
          )}
          <h1 className="truncate text-base font-semibold text-zinc-900">
            {title}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isDemo && (
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
              Demo
            </span>
          )}
          <ActiveAgentsBadge />
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
