"use client";

import Link from "next/link";
import { useState } from "react";

import { api } from "~/trpc/react";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const { data: count = 0 } = api.notification.unreadCount.useQuery(undefined, {
    refetchInterval: 3000,
  });

  const { data: notifications } = api.notification.list.useQuery(undefined, {
    enabled: open,
    refetchInterval: open ? 3000 : false,
  });

  const markRead = api.notification.markRead.useMutation({
    onSuccess: () => void utils.notification.invalidate(),
  });

  const markAllRead = api.notification.markAllRead.useMutation({
    onSuccess: () => void utils.notification.invalidate(),
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-zinc-100"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-start sm:justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Close"
          />
          <div className="relative max-h-[80dvh] w-full overflow-hidden rounded-t-2xl bg-white shadow-xl sm:m-4 sm:max-w-sm sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <h2 className="font-semibold text-zinc-900">Notifications</h2>
              <div className="flex gap-2">
                {count > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllRead.mutate()}
                    className="text-xs text-blue-600"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm text-zinc-500"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="max-h-[60dvh] overflow-y-auto p-2">
              {notifications?.length === 0 && (
                <p className="p-4 text-center text-sm text-zinc-500">
                  No notifications yet
                </p>
              )}
              {notifications?.map((n) => (
                <Link
                  key={n.id}
                  href={n.productRequestId ? `/products/${n.productRequestId}` : "/"}
                  onClick={() => {
                    if (!n.read) markRead.mutate({ id: n.id });
                    setOpen(false);
                  }}
                  className={`mb-2 block rounded-xl p-4 ${n.read ? "bg-zinc-50" : "bg-blue-50"}`}
                >
                  <p className="text-sm font-medium text-zinc-900">{n.type}</p>
                  <p className="mt-1 text-sm text-zinc-600">{n.message}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
