import type { SDKCustomTool } from "@cursor/sdk";

import { db } from "~/server/db";
import { recordStreamEvent } from "~/server/agents/tools";
import type { ComparisonTable } from "~/lib/comparison-types";

function str(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

export function buildComparisonTools(
  productRequestId: string,
  runId?: string,
): Record<string, SDKCustomTool> {
  return {
    save_comparison_table: {
      description:
        "Save a spec comparison table across all product candidates. Call once when the table is complete.",
      inputSchema: {
        type: "object",
        properties: {
          specs: {
            type: "array",
            items: { type: "string" },
            description: "Column headers for comparable specs",
          },
          rows: {
            type: "array",
            items: {
              type: "object",
              properties: {
                candidateId: { type: "string" },
                title: { type: "string" },
                source: { type: "string" },
                values: {
                  type: "object",
                  additionalProperties: { type: "string" },
                },
              },
              required: ["candidateId", "title", "source", "values"],
            },
          },
          summary: {
            type: "string",
            description: "Brief recommendation based on the comparison",
          },
        },
        required: ["specs", "rows", "summary"],
      },
      async execute(args) {
        const specs = Array.isArray(args.specs)
          ? args.specs.map((s) => str(s)).filter(Boolean)
          : [];
        const rows = Array.isArray(args.rows)
          ? args.rows.map((row) => {
              const r = row as Record<string, unknown>;
              const values =
                r.values && typeof r.values === "object" && !Array.isArray(r.values)
                  ? Object.fromEntries(
                      Object.entries(r.values as Record<string, unknown>).map(
                        ([k, v]) => [k, str(v)],
                      ),
                    )
                  : {};
              return {
                candidateId: str(r.candidateId),
                title: str(r.title),
                source: str(r.source),
                values,
              };
            })
          : [];

        const table: ComparisonTable = {
          specs,
          rows,
          summary: str(args.summary),
        };

        await db.productRequest.update({
          where: { id: productRequestId },
          data: {
            comparisonStatus: "READY",
            comparisonTableJson: JSON.stringify(table),
            comparisonSummary: table.summary ?? null,
          },
        });

        await db.notification.create({
          data: {
            type: "COMPARISON_READY",
            message: table.summary ?? "Spec comparison table is ready.",
            productRequestId,
          },
        });

        await recordStreamEvent(productRequestId, runId ?? "comparison", {
          type: "status",
          label: "Comparison table saved",
          payload: { specs: specs.length, rows: rows.length },
        });

        return { success: true };
      },
    },
  };
}
