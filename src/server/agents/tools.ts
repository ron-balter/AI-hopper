import type { SDKCustomTool } from "@cursor/sdk";

import { db } from "~/server/db";
import { maybeStartComparison } from "~/server/agents/comparison-dispatcher";
import { agentEventBus } from "~/server/agents/event-emitter";

function str(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

async function persistAgentEvent(
  productRequestId: string,
  eventType: string,
  label: string,
  runId?: string,
  payload?: unknown,
) {
  const event = await db.agentEvent.create({
    data: {
      productRequestId,
      runId: runId ?? null,
      eventType,
      label,
      payload: payload ? JSON.stringify(payload) : null,
    },
  });
  agentEventBus.emitEvent(event);
  return event;
}

export function buildCustomTools(
  productRequestId: string,
  runId?: string,
): Record<string, SDKCustomTool> {
  return {
    save_product_candidate: {
      description:
        "Save a product listing found during research. Call once per candidate.",
      inputSchema: {
        type: "object",
        properties: {
          source: { type: "string", enum: ["AMAZON", "ALIEXPRESS"] },
          title: { type: "string" },
          url: { type: "string" },
          price: { type: "string" },
          currency: { type: "string" },
          rating: { type: "number" },
          reviewCount: { type: "number" },
          reviewSummary: { type: "string" },
          pros: { type: "string" },
          cons: { type: "string" },
          imageUrl: { type: "string" },
          rank: { type: "number" },
        },
        required: ["source", "title", "url", "reviewSummary"],
      },
      async execute(args) {
        const source = str(args.source, "AMAZON").toUpperCase();
        const marketplace = source === "ALIEXPRESS" ? "ALIEXPRESS" : "AMAZON";
        const url = str(args.url);
        const title = str(args.title);

        const candidate = await db.productCandidate.upsert({
          where: {
            productRequestId_url: {
              productRequestId,
              url,
            },
          },
          create: {
            productRequestId,
            source: marketplace,
            title,
            url,
            price: str(args.price) || null,
            currency: str(args.currency) || null,
            rating: typeof args.rating === "number" ? args.rating : null,
            reviewCount:
              typeof args.reviewCount === "number" ? args.reviewCount : null,
            reviewSummary: str(args.reviewSummary),
            pros: str(args.pros) || null,
            cons: str(args.cons) || null,
            imageUrl: str(args.imageUrl) || null,
            rank: typeof args.rank === "number" ? args.rank : null,
          },
          update: {
            title,
            price: str(args.price) || null,
            currency: str(args.currency) || null,
            rating: typeof args.rating === "number" ? args.rating : null,
            reviewCount:
              typeof args.reviewCount === "number" ? args.reviewCount : null,
            reviewSummary: str(args.reviewSummary),
            pros: str(args.pros) || null,
            cons: str(args.cons) || null,
            imageUrl: str(args.imageUrl) || null,
            rank: typeof args.rank === "number" ? args.rank : null,
          },
        });

        await persistAgentEvent(
          productRequestId,
          "tool_call",
          `Saved candidate: ${candidate.title}`,
          runId,
          { tool: "save_product_candidate", candidateId: candidate.id },
        );

        return { success: true, candidateId: candidate.id };
      },
    },
    complete_search: {
      description:
        "Mark the search complete and notify the user to review candidates.",
      inputSchema: {
        type: "object",
        properties: {
          summary: { type: "string" },
        },
        required: ["summary"],
      },
      async execute(args) {
        await db.productRequest.update({
          where: { id: productRequestId },
          data: { status: "READY_FOR_REVIEW" },
        });

        await db.notification.create({
          data: {
            type: "CANDIDATES_READY",
            message: str(args.summary, "Candidates are ready for review."),
            productRequestId,
          },
        });

        await persistAgentEvent(
          productRequestId,
          "status",
          "Search complete — ready for review",
          runId,
        );

        maybeStartComparison(productRequestId);

        return { success: true };
      },
    },
    report_search_failure: {
      description: "Report that the search failed.",
      inputSchema: {
        type: "object",
        properties: {
          reason: { type: "string" },
        },
        required: ["reason"],
      },
      async execute(args) {
        const reason = str(args.reason, "Unknown error");

        await db.productRequest.update({
          where: { id: productRequestId },
          data: { status: "FAILED" },
        });

        await db.notification.create({
          data: {
            type: "SEARCH_FAILED",
            message: reason,
            productRequestId,
          },
        });

        await persistAgentEvent(
          productRequestId,
          "status",
          `Search failed: ${reason}`,
          runId,
        );

        return { success: true };
      },
    },
  };
}

export async function recordStreamEvent(
  productRequestId: string,
  runId: string,
  event: { type: string; label: string; payload?: unknown },
) {
  return persistAgentEvent(
    productRequestId,
    event.type,
    event.label,
    runId,
    event.payload,
  );
}
