import { db } from "~/server/db";
import { buildCustomTools, recordStreamEvent } from "~/server/agents/tools";

const MOCK_CANDIDATES = [
  {
    source: "AMAZON" as const,
    title: "Anker 555 USB-C Hub (8-in-1)",
    url: "https://www.amazon.com/dp/B09JQ5K4BP",
    price: "49.99",
    currency: "USD",
    rating: 4.6,
    reviewCount: 12400,
    reviewSummary:
      "Reliable travel hub with 4K HDMI and 100W pass-through charging. Reviewers praise build quality.",
    pros: "Compact, stable HDMI output, trusted brand",
    cons: "Runs warm under heavy load",
    rank: 1,
  },
  {
    source: "AMAZON" as const,
    title: "UGREEN Revodok Pro 209 USB-C Hub",
    url: "https://www.amazon.com/dp/B0BHNWD9B5",
    price: "39.99",
    currency: "USD",
    rating: 4.5,
    reviewCount: 3200,
    reviewSummary:
      "Strong value pick with dual HDMI and ethernet. Good for desk setups.",
    pros: "Dual display support, ethernet included",
    cons: "Larger than pocket-sized hubs",
    rank: 2,
  },
  {
    source: "ALIEXPRESS" as const,
    title: "Baseus 8-in-1 USB-C Hub Adapter",
    url: "https://www.aliexpress.com/item/1005005123456789.html",
    price: "22.99",
    currency: "USD",
    rating: 4.7,
    reviewCount: 890,
    reviewSummary:
      "Budget-friendly with solid reviews for basic travel use. Shipping takes longer.",
    pros: "Low price, many ports",
    cons: "Mixed long-term durability reports",
    rank: 3,
  },
];

const DEMO_STEPS = [
  { delay: 800, type: "status", label: "Agent initialized — starting product search" },
  { delay: 1200, type: "task", label: "Delegating to amazon-researcher subagent" },
  { delay: 2000, type: "tool_call", label: "Searching Amazon for matching products..." },
  { delay: 1500, type: "thinking", label: "Analyzing Amazon reviews and ratings..." },
  { delay: 1200, type: "task", label: "Delegating to aliexpress-researcher subagent" },
  { delay: 1800, type: "tool_call", label: "Searching AliExpress for budget alternatives..." },
  { delay: 1500, type: "thinking", label: "Comparing value vs. reliability tradeoffs..." },
  { delay: 1000, type: "assistant", label: "Ranking top candidates for your requirements..." },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runDemoSearch(productRequestId: string) {
  const runId = `demo-run-${Date.now()}`;
  const tools = buildCustomTools(productRequestId, runId);

  await db.productRequest.update({
    where: { id: productRequestId },
    data: {
      status: "SEARCHING",
      agentId: `agent-demo-${productRequestId.slice(0, 8)}`,
      lastRunId: runId,
      lastRequestId: `req-demo-${Date.now()}`,
      comparisonStatus: "NONE",
      comparisonTableJson: null,
      comparisonSummary: null,
      comparisonAgentId: null,
    },
  });

  await db.agentEvent.deleteMany({ where: { productRequestId } });
  await db.productCandidate.deleteMany({ where: { productRequestId } });

  for (const step of DEMO_STEPS) {
    await sleep(step.delay);
    await recordStreamEvent(productRequestId, runId, step);
  }

  for (const candidate of MOCK_CANDIDATES) {
    await sleep(600);
    await tools.save_product_candidate!.execute(
      { ...candidate },
      {},
    );
  }

  await sleep(400);
  await tools.complete_search!.execute(
    {
      summary: `Found ${MOCK_CANDIDATES.length} strong candidates across Amazon and AliExpress. Review and pick your favorite.`,
    },
    {},
  );

  await db.productRequest.update({
    where: { id: productRequestId },
    data: { durationMs: 12000 },
  });

  return { runId, agentId: `agent-demo-${productRequestId.slice(0, 8)}` };
}
