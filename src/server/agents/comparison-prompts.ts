import type { ProductCandidate } from "../../../generated/prisma";

export function buildComparisonPrompt(params: {
  productRequestId: string;
  title: string;
  description: string;
  rationale: string;
  candidates: ProductCandidate[];
}) {
  const candidateList = params.candidates
    .map(
      (c, i) =>
        `${i + 1}. [id=${c.id}] ${c.title} (${c.source})
   URL: ${c.url}
   Price: ${c.price ?? "unknown"} ${c.currency ?? ""}
   Rating: ${c.rating ?? "n/a"} (${c.reviewCount ?? 0} reviews)
   Summary: ${c.reviewSummary}
   Pros: ${c.pros ?? "n/a"}
   Cons: ${c.cons ?? "n/a"}`,
    )
    .join("\n\n");

  return `You are a product comparison agent. Build a spec comparison table for the user's shortlisted products.

Product request ID: ${params.productRequestId}
What they want: ${params.title} — ${params.description}
Why: ${params.rationale}

Candidates to compare:
${candidateList}

Instructions:
1. Research or infer comparable specs relevant to the user's stated needs (price, rating, key features, portability, etc.).
2. Use the same spec rows for every candidate so the table is easy to scan.
3. Call save_comparison_table with:
   - specs: array of row labels (e.g. "Price", "Rating", "4K HDMI", "USB-A ports")
   - rows: one entry per candidate using the exact candidateId from above
   - summary: 1-2 sentence recommendation for this user
4. Be factual — use "Unknown" when a spec isn't available.`;
}
