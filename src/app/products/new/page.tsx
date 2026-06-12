"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { MobileHeader } from "~/components/mobile-header";
import { pickRandomRequestExample } from "~/lib/request-examples";
import { api } from "~/trpc/react";

export default function NewProductPage() {
  const router = useRouter();
  const utils = api.useUtils();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rationale, setRationale] = useState("");

  const create = api.product.create.useMutation();
  const startSearch = api.product.startSearch.useMutation();

  const fillRandomExample = () => {
    const example = pickRandomRequestExample();
    setTitle(example.title);
    setDescription(example.description);
    setRationale(example.rationale);
  };

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
          <button
            type="button"
            onClick={fillRandomExample}
            className="min-h-[44px] w-full rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-100"
          >
            Fill random example
          </button>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">
              Title
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short name for what you're looking for"
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
              placeholder="Specs, size, budget, materials — be as specific as you like"
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
              placeholder="How you'll use it and what problem it solves"
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
