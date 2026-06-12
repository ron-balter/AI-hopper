export function buildSearchPrompt(params: {
  productRequestId: string;
  title: string;
  description: string;
  rationale: string;
}) {
  return `You are a product research agent. Find the best matching products on Amazon and AliExpress.

Product request ID (use in every tool call): ${params.productRequestId}

Title: ${params.title}
What they want: ${params.description}
Why they want it: ${params.rationale}

Instructions:
1. Delegate to amazon-researcher and aliexpress-researcher subagents to find real listings.
2. Compare reviews, ratings, and value for the user's stated needs.
3. Save 3-5 best candidates using save_product_candidate (include honest pros/cons).
4. Call complete_search with a brief summary when done.
5. Never invent URLs — only save products you actually found online.
6. If you cannot complete the search, call report_search_failure with the reason.`;
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

Search again on Amazon and AliExpress. Clear previous assumptions. Save new top candidates and call complete_search when done.`;
}

export const subagentDefinitions = {
  "amazon-researcher": {
    description:
      "Searches Amazon for products matching the user's requirements and summarizes reviews.",
    prompt:
      "Search Amazon for products matching the user's needs. Return title, URL, price, rating, review count, and review summary for top options.",
    model: "inherit" as const,
  },
  "aliexpress-researcher": {
    description:
      "Searches AliExpress for products matching the user's requirements and summarizes reviews.",
    prompt:
      "Search AliExpress for products matching the user's needs. Return title, URL, price, rating, review count, and review summary for top options.",
    model: "inherit" as const,
  },
};
