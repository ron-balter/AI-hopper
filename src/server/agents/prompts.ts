import {
  MARKETPLACE_AGENTS,
  MARKETPLACE_LABELS,
  MARKETPLACES,
} from "~/lib/marketplaces";

const platformAgentList = MARKETPLACES.map(
  (p) => `${MARKETPLACE_AGENTS[p]} (${MARKETPLACE_LABELS[p]} only)`,
).join(", ");

export function buildSearchPrompt(params: {
  productRequestId: string;
  title: string;
  description: string;
  rationale: string;
}) {
  return `You are the orchestrator for a multi-marketplace product search. There is exactly ONE dedicated subagent per platform — delegate to each exactly once.

Product request ID (use in every tool call): ${params.productRequestId}

Title: ${params.title}
What they want: ${params.description}
Why they want it: ${params.rationale}

Platform agents (use all four, one agent per platform):
- ${platformAgentList}

Instructions:
1. Delegate in parallel to amazon-researcher, aliexpress-researcher, ebay-researcher, and shopify-researcher — each agent searches ONLY its own marketplace.
2. Wait for all four platform agents before ranking. Do not search any marketplace yourself; only the dedicated subagent may search that platform.
3. Each saved candidate must use the correct source: AMAZON, ALIEXPRESS, EBAY, or SHOPIFY matching the listing URL.
4. Save 4-8 best candidates using save_product_candidate (at least one per platform when listings exist; include honest pros/cons).
5. Call complete_search with a brief summary when done.
6. Never invent URLs — only save products actually found online.
7. For Shopify, only save URLs from real Shopify storefronts (/products/ paths).
8. If you cannot complete the search, call report_search_failure with the reason.`;
}

export function buildResumePrompt(params: {
  productRequestId: string;
  title: string;
  description: string;
  rationale: string;
}) {
  return `Continue researching for the same product request. The user wants a fresh search.

Product request ID: ${params.productRequestId}
Title: ${params.title}
What they want: ${params.description}
Why: ${params.rationale}

Re-delegate to all four platform agents (one per marketplace): amazon-researcher, aliexpress-researcher, ebay-researcher, shopify-researcher. Clear previous assumptions. Save new top candidates and call complete_search when done.`;
}

const platformOnly = (name: string, platform: keyof typeof MARKETPLACE_LABELS) =>
  `You are the dedicated ${MARKETPLACE_LABELS[platform]} agent (${name}). Search ONLY ${MARKETPLACE_LABELS[platform]}. Every listing you return must be from ${MARKETPLACE_LABELS[platform]} with a real ${MARKETPLACE_LABELS[platform]} URL. When saving via the parent agent, source must be ${platform}.`;

export const subagentDefinitions = {
  [MARKETPLACE_AGENTS.AMAZON]: {
    description: "Dedicated Amazon-only researcher.",
    prompt: `${platformOnly("amazon-researcher", "AMAZON")} Return title, URL, price, rating, review count, and review summary for top options.`,
    model: "inherit" as const,
  },
  [MARKETPLACE_AGENTS.ALIEXPRESS]: {
    description: "Dedicated AliExpress-only researcher.",
    prompt: `${platformOnly("aliexpress-researcher", "ALIEXPRESS")} Return title, URL, price, rating, review count, and review summary for top options.`,
    model: "inherit" as const,
  },
  [MARKETPLACE_AGENTS.EBAY]: {
    description: "Dedicated eBay-only researcher.",
    prompt: `${platformOnly("ebay-researcher", "EBAY")} Prefer reputable sellers with strong feedback. Return title, URL, price, rating, review count, and review summary for top options.`,
    model: "inherit" as const,
  },
  [MARKETPLACE_AGENTS.SHOPIFY]: {
    description: "Dedicated Shopify-store-only researcher.",
    prompt: `${platformOnly("shopify-researcher", "SHOPIFY")} Find Shopify /products/ pages on myshopify.com or DTC brand sites. Return title, URL, price, and review summary when available.`,
    model: "inherit" as const,
  },
};
