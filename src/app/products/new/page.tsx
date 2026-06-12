"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { MobileHeader } from "~/components/mobile-header";
import { api } from "~/trpc/react";

export default function NewProductPage() {
  const router = useRouter();
  const utils = api.useUtils();

  const [title, setTitle] = useState("USB-C hub with 4K HDMI");
  const [description, setDescription] = useState(
    "Compact travel hub with 4K HDMI, 100W pass-through charging, and at least 2 USB-A ports.",
  );
  const [rationale, setRationale] = useState(
    "I travel for work and need one adapter for hotel monitors and charging my laptop.",
  );

  const create = api.product.create.useMutation();
  const startSearch = api.product.startSearch.useMutation();

  const submit = async (andSearch: boolean) => {
    const product = await create.mutateAsync({ title, description, rationale });
    await utils.product.invalidate();
    if (andSearch) {
      await startSearch.mutateAsync({ id: product.id });
    }
    router.push(`/products/${product.id}`);
  };

  const busy = create.isPending || startSearch.isPending;

  return (
    <div className="min-h-dvh pb-8">
      <MobileHeader title="New request" backHref="/" />

      <main className="mx-auto max-w-lg px-4 py-6">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void submit(false);
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">
              Title
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-h-[48px] w-full rounded-xl border border-zinc-300 px-4 text-base"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">
              What do you want?
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-base"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">
              Why do you want it?
            </span>
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-base"
              required
            />
          </label>

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit(true)}
              className="min-h-[48px] rounded-xl bg-zinc-900 text-sm font-semibold text-white disabled:opacity-50"
            >
              Create & start search
            </button>
            <button
              type="submit"
              disabled={busy}
              className="min-h-[48px] rounded-xl border border-zinc-300 text-sm font-medium text-zinc-700 disabled:opacity-50"
            >
              Save as draft
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
