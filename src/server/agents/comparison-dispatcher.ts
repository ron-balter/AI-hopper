import "server-only";

import { Agent, CursorAgentError } from "@cursor/sdk";

import { env } from "~/env";
import { db } from "~/server/db";
import { buildComparisonPrompt } from "~/server/agents/comparison-prompts";
import { buildComparisonTools } from "~/server/agents/comparison-tools";
import type { ComparisonTable } from "~/lib/comparison-types";
import { persistAgentStream } from "~/server/agents/stream-events";
import { recordStreamEvent } from "~/server/agents/tools";

const MIN_CANDIDATES_FOR_COMPARISON = 2;
const activeComparisons = new Map<string, Promise<void>>();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildDemoComparisonTable(
  candidates: Array<{
    id: string;
    title: string;
    source: string;
    price: string | null;
    currency: string | null;
    rating: number | null;
    reviewCount: number | null;
    pros: string | null;
    cons: string | null;
  }>,
): ComparisonTable {
  const specs = [
    "Price",
    "Rating",
    "Reviews",
    "4K HDMI",
    "USB-A ports",
    "Pass-through charging",
    "Best for",
  ];

  const demoSpecs: Record<string, string>[] = [
    {
      Price: "$49.99",
      Rating: "4.6 ★",
      Reviews: "12,400",
      "4K HDMI": "Yes @ 60Hz",
      "USB-A ports": "2",
      "Pass-through charging": "100W",
      "Best for": "Travel, reliability",
    },
    {
      Price: "$39.99",
      Rating: "4.5 ★",
      Reviews: "3,200",
      "4K HDMI": "Dual display",
      "USB-A ports": "2",
      "Pass-through charging": "100W",
      "Best for": "Desk + travel",
    },
    {
      Price: "$22.99",
      Rating: "4.7 ★",
      Reviews: "890",
      "4K HDMI": "Yes @ 30Hz",
      "USB-A ports": "3",
      "Pass-through charging": "60W",
      "Best for": "Budget travel",
    },
  ];

  return {
    specs,
    rows: candidates.map((c, i) => {
      const preset = demoSpecs[i] ?? {
        Price: c.price ? `${c.currency ?? "$"}${c.price}` : "Unknown",
        Rating: c.rating != null ? `${c.rating} ★` : "Unknown",
        Reviews: c.reviewCount?.toLocaleString() ?? "Unknown",
        "4K HDMI": "Unknown",
        "USB-A ports": "Unknown",
        "Pass-through charging": "Unknown",
        "Best for": c.pros ?? "Unknown",
      };
      return {
        candidateId: c.id,
        title: c.title,
        source: c.source,
        values: preset,
      };
    }),
    summary:
      "Anker 555 is the best balance of reliability and travel size. UGREEN wins on desk setups with dual HDMI. Baseus is the budget pick if you can wait on shipping.",
  };
}

async function runDemoComparison(productRequestId: string) {
  const runId = `demo-compare-${Date.now()}`;
  const candidates = await db.productCandidate.findMany({
    where: { productRequestId },
    orderBy: [{ rank: "asc" }, { createdAt: "asc" }],
  });

  await db.productRequest.update({
    where: { id: productRequestId },
    data: {
      comparisonStatus: "COMPARING",
      comparisonAgentId: `agent-compare-demo-${productRequestId.slice(0, 6)}`,
      comparisonTableJson: null,
      comparisonSummary: null,
    },
  });

  const steps = [
    "Comparison agent started",
    "Analyzing candidate specs…",
    "Building comparison matrix…",
    "Ranking by user requirements…",
  ];

  for (const label of steps) {
    await sleep(800);
    await recordStreamEvent(productRequestId, runId, { type: "task", label });
  }

  const table = buildDemoComparisonTable(candidates);
  const tools = buildComparisonTools(productRequestId, runId);
  await tools.save_comparison_table!.execute(
    {
      specs: table.specs,
      rows: table.rows,
      summary: table.summary ?? "Comparison complete.",
    },
    {},
  );
}

async function runLiveComparison(productRequestId: string) {
  const request = await db.productRequest.findUniqueOrThrow({
    where: { id: productRequestId },
    include: {
      candidates: { orderBy: [{ rank: "asc" }, { createdAt: "asc" }] },
    },
  });

  await db.productRequest.update({
    where: { id: productRequestId },
    data: {
      comparisonStatus: "COMPARING",
      comparisonTableJson: null,
      comparisonSummary: null,
    },
  });

  const prompt = buildComparisonPrompt({
    productRequestId,
    title: request.title,
    description: request.description,
    rationale: request.rationale,
    candidates: request.candidates,
  });

  let agent: Awaited<ReturnType<typeof Agent.create>> | null = null;

  try {
    agent = await Agent.create({
      apiKey: env.CURSOR_API_KEY,
      name: `product-compare-${productRequestId.slice(0, 8)}`,
      model: { id: "composer-2.5" },
      local: {
        cwd: process.cwd(),
        customTools: buildComparisonTools(productRequestId),
      },
    });

    await db.productRequest.update({
      where: { id: productRequestId },
      data: { comparisonAgentId: agent.agentId },
    });

    const run = await agent.send(prompt);
    const runId = run.id;

    await persistAgentStream(productRequestId, runId, run.stream());

    const result = await run.wait();

    const current = await db.productRequest.findUnique({
      where: { id: productRequestId },
    });

    if (result.status === "error" || current?.comparisonStatus === "COMPARING") {
      await db.productRequest.update({
        where: { id: productRequestId },
        data: { comparisonStatus: "FAILED" },
      });
      await db.notification.create({
        data: {
          type: "COMPARISON_FAILED",
          message: "Comparison agent could not build the spec table.",
          productRequestId,
        },
      });
    }
  } catch (err) {
    const reason =
      err instanceof CursorAgentError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Unknown error";

    await db.productRequest.update({
      where: { id: productRequestId },
      data: { comparisonStatus: "FAILED" },
    });

    await recordStreamEvent(productRequestId, "comparison-error", {
      type: "status",
      label: `Comparison failed: ${reason}`,
    });
  } finally {
    if (agent) {
      await agent[Symbol.asyncDispose]().catch(() => undefined);
    }
  }
}

export function getActiveComparisonCount() {
  return activeComparisons.size;
}

export function maybeStartComparison(productRequestId: string) {
  void (async () => {
    const count = await db.productCandidate.count({
      where: { productRequestId },
    });

    if (count < MIN_CANDIDATES_FOR_COMPARISON) return;
    if (activeComparisons.has(productRequestId)) return;

    const promise = env.DEMO_MODE
      ? runDemoComparison(productRequestId)
      : runLiveComparison(productRequestId);

    const tracked = promise.finally(() => {
      activeComparisons.delete(productRequestId);
    });

    activeComparisons.set(productRequestId, tracked);
    await tracked;
  })();
}
