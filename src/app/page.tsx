"use client";

import Link from "next/link";

import { MobileHeader } from "~/components/mobile-header";
import { StatusBadge } from "~/components/status-badge";
import { api } from "~/trpc/react";

export default function HomePage() {
  const { data: products, isLoading } = api.product.list.useQuery(undefined, {
    refetchInterval: 3000,
  });

  return (
    <div className="min-h-dvh pb-24">
      <MobileHeader title="My products" />

      <main className="mx-auto max-w-2xl px-4 py-6">
        {isLoading && (
          <p className="text-center text-sm text-zinc-500">Loading…</p>
        )}

        {!isLoading && products?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
            <p className="mb-2 text-lg font-medium text-zinc-900">
              No product requests yet
            </p>
            <p className="mb-6 text-sm text-zinc-600">
              Describe what you want and let Cursor agents find the best options.
            </p>
            <Link
              href="/products/new"
              className="inline-flex min-h-[44px] items-center rounded-xl bg-zinc-900 px-6 text-sm font-medium text-white"
            >
              New request
            </Link>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {products?.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h2 className="font-semibold text-zinc-900">{product.title}</h2>
                <StatusBadge status={product.status} />
              </div>
              <p className="mb-3 line-clamp-2 text-sm text-zinc-600">
                {product.description}
              </p>
              <p className="text-xs text-zinc-500">
                {product._count.candidates} candidate
                {product._count.candidates === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white/95 p-4 backdrop-blur supports-[padding:env(safe-area-inset-bottom)]:pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/products/new"
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white"
          >
            + New product request
          </Link>
        </div>
      </div>
    </div>
  );
}
