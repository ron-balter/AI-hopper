import { db } from "~/server/db";
import { buildCustomTools, recordStreamEvent } from "~/server/agents/tools";

const MOCK_CANDIDATES = [
  {
    source: "AMAZON" as const,
    title: "Osprey Daylite Plus 20L",
    url: "https://www.amazon.com/dp/B07HCF1Z9H",
    price: "75.00",
    currency: "USD",
    rating: 4.7,
    reviewCount: 4200,
    reviewSummary:
      "Popular daypack with breathable back panel and hydration sleeve. Great for day hikes.",
    pros: "Lightweight, comfortable hip belt, durable",
    cons: "Limited organization pockets",
    rank: 1,
  },
  {
    source: "EBAY" as const,
    title: "Deuter Speed Lite 21 Backpack — New with Tags",
    url: "https://www.ebay.com/itm/265489012345",
    price: "68.50",
    currency: "USD",
    rating: 4.8,
    reviewCount: 156,
    reviewSummary:
      "Seller with 99.2% positive feedback. Same model retails higher elsewhere.",
    pros: "Below retail, reputable seller",
    cons: "Limited color options in this listing",
    rank: 2,
  },
  {
    source: "ALIEXPRESS" as const,
    title: "Naturehike 30L Lightweight Hiking Backpack",
    url: "https://www.aliexpress.com/item/1005005123456789.html",
    price: "34.99",
    currency: "USD",
    rating: 4.6,
    reviewCount: 2100,
    reviewSummary:
      "Budget ultralight pack with rain cover included. Solid reviews for weekend trips.",
    pros: "Low price, includes rain cover",
    cons: "Longer shipping, thinner straps",
    rank: 3,
  },
  {
    source: "SHOPIFY" as const,
    title: "Topo Designs Rover Pack Mini",
    url: "https://topodesigns.com/products/rover-pack-mini",
    price: "89.00",
    currency: "USD",
    rating: 4.5,
    reviewCount: 320,
    reviewSummary:
      "Durable daypack from a DTC outdoor brand. Clean design, made for daily carry and light hikes.",
    pros: "Quality materials, US brand warranty",
    cons: "Smaller capacity than 30L options",
    rank: 4,
  },
];

const DEMO_STEPS = [
  { delay: 800, type: "status", label: "Agent initialized — starting product search" },
  { delay: 1000, type: "task", label: "Delegating to amazon-researcher subagent" },
  { delay: 1500, type: "tool_call", label: "Searching Amazon for matching products..." },
  { delay: 1000, type: "task", label: "Delegating to ebay-researcher subagent" },
  { delay: 1500, type: "tool_call", label: "Searching eBay for new and used listings..." },
  { delay: 1000, type: "task", label: "Delegating to aliexpress-researcher subagent" },
  { delay: 1500, type: "tool_call", label: "Searching AliExpress for budget options..." },
  { delay: 1000, type: "task", label: "Delegating to shopify-researcher subagent" },
  { delay: 1500, type: "tool_call", label: "Searching Shopify stores for DTC brands..." },
  { delay: 1200, type: "thinking", label: "Comparing value, shipping, and review quality across marketplaces..." },
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
    await tools.save_product_candidate!.execute({ ...candidate }, {});
  }

  await sleep(400);
  await tools.complete_search!.execute(
    {
      summary: `Found ${MOCK_CANDIDATES.length} strong candidates across Amazon, eBay, AliExpress, and Shopify. Review and pick your favorite.`,
    },
    {},
  );

  await db.productRequest.update({
    where: { id: productRequestId },
    data: { durationMs: 18000 },
  });

  return { runId, agentId: `agent-demo-${productRequestId.slice(0, 8)}` };
}
