import "server-only";

import { Agent, CursorAgentError } from "@cursor/sdk";

import { env } from "~/env";
import { db } from "~/server/db";
import { runDemoSearch } from "~/server/agents/demo-simulator";
import {
  buildCustomTools,
  recordStreamEvent,
} from "~/server/agents/tools";
import {
  buildResumePrompt,
  buildSearchPrompt,
  subagentDefinitions,
} from "~/server/agents/prompts";

type ActiveSearch = {
  productRequestId: string;
  promise: Promise<void>;
};

const activeSearches = new Map<string, ActiveSearch>();

function streamEventLabel(event: {
  type: string;
  name?: string;
  status?: string;
  text?: string;
  message?: { content?: Array<{ type: string; text?: string }> };
  [key: string]: unknown;
}): string {
  if (event.type === "tool_call") {
    return `[tool] ${event.name ?? "unknown"} (${event.status ?? "running"})`;
  }
  if (event.type === "thinking" && event.text) {
    return event.text.slice(0, 120);
  }
  if (event.type === "assistant" && event.message?.content) {
    const text = event.message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join(" ");
    return text.slice(0, 160) || "Assistant response";
  }
  if (event.type === "status") {
    return `Status: ${event.status ?? "update"}`;
  }
  if (event.type === "task" && event.text) {
    return event.text;
  }
  return `${event.type} event`;
}

async function persistStreamEvents(
  productRequestId: string,
  runId: string,
  stream: AsyncIterable<{ type: string }>,
) {
  for await (const event of stream) {
    const label = streamEventLabel(event);
    if (!label) continue;
    await recordStreamEvent(productRequestId, runId, {
      type: event.type,
      label,
      payload: event,
    });
  }
}

async function runLiveSearch(productRequestId: string, isResume: boolean) {
  const request = await db.productRequest.findUniqueOrThrow({
    where: { id: productRequestId },
  });

  await db.productRequest.update({
    where: { id: productRequestId },
    data: {
      status: "SEARCHING",
      comparisonStatus: "NONE",
      comparisonTableJson: null,
      comparisonSummary: null,
      comparisonAgentId: null,
    },
  });

  if (!isResume) {
    await db.agentEvent.deleteMany({ where: { productRequestId } });
    await db.productCandidate.deleteMany({ where: { productRequestId } });
  }

  const prompt = isResume
    ? buildResumePrompt({
        productRequestId,
        title: request.title,
        description: request.description,
        rationale: request.rationale,
      })
    : buildSearchPrompt({
        productRequestId,
        title: request.title,
        description: request.description,
        rationale: request.rationale,
      });

  let agent: Awaited<ReturnType<typeof Agent.create>> | null = null;

  try {
    if (isResume && request.agentId) {
      agent = await Agent.resume(request.agentId, {
        apiKey: env.CURSOR_API_KEY,
        model: { id: "composer-2.5" },
        local: {
          cwd: process.cwd(),
          customTools: buildCustomTools(productRequestId),
        },
        agents: subagentDefinitions,
      });
    } else {
      agent = await Agent.create({
        apiKey: env.CURSOR_API_KEY,
        name: `product-shopper-${productRequestId.slice(0, 8)}`,
        model: { id: "composer-2.5" },
        local: {
          cwd: process.cwd(),
          customTools: buildCustomTools(productRequestId),
        },
        agents: subagentDefinitions,
      });

      await db.productRequest.update({
        where: { id: productRequestId },
        data: { agentId: agent.agentId },
      });
    }

    const run = await agent.send(prompt);
    const runId = run.id;

    await db.productRequest.update({
      where: { id: productRequestId },
      data: {
        lastRunId: runId,
        lastRequestId: run.requestId ?? null,
      },
    });

    const streamPromise = persistStreamEvents(
      productRequestId,
      runId,
      run.stream(),
    );

    const result = await run.wait();
    await streamPromise.catch(() => undefined);

    const conversation = run.supports("conversation")
      ? await run.conversation()
      : null;

    const current = await db.productRequest.findUnique({
      where: { id: productRequestId },
    });

    await db.productRequest.update({
      where: { id: productRequestId },
      data: {
        durationMs: result.durationMs ?? null,
        lastRequestId: result.requestId ?? current?.lastRequestId,
        transcriptJson: conversation ? JSON.stringify(conversation) : null,
      },
    });

    if (result.status === "error") {
      const tools = buildCustomTools(productRequestId, runId);
      await tools.report_search_failure!.execute(
        { reason: "Agent run ended with an error." },
        {},
      );
    } else if (current?.status === "SEARCHING") {
      const tools = buildCustomTools(productRequestId, runId);
      await tools.report_search_failure!.execute(
        { reason: "Agent finished without calling complete_search." },
        {},
      );
    }
  } catch (err) {
    const reason =
      err instanceof CursorAgentError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Unknown error";

    const tools = buildCustomTools(productRequestId);
    await tools.report_search_failure!.execute({ reason }, {});
    throw err;
  } finally {
    if (agent) {
      await agent[Symbol.asyncDispose]().catch(() => undefined);
    }
  }
}

function trackSearch(productRequestId: string, promise: Promise<void>) {
  const wrapped = promise.finally(() => {
    activeSearches.delete(productRequestId);
  });
  activeSearches.set(productRequestId, {
    productRequestId,
    promise: wrapped,
  });
  return wrapped;
}

export function getActiveSearchCount() {
  return activeSearches.size;
}

export async function getSdkActiveAgentCount() {
  try {
    const { items } = await Agent.list({
      runtime: "local",
      cwd: process.cwd(),
      limit: 50,
    });
    return items.filter((a) => a.status === "running").length;
  } catch {
    return activeSearches.size;
  }
}

export function startSearch(productRequestId: string) {
  if (activeSearches.has(productRequestId)) {
    throw new Error("Search already in progress for this request.");
  }

  const promise = env.DEMO_MODE
    ? runDemoSearch(productRequestId).then(() => undefined)
    : runLiveSearch(productRequestId, false);

  return trackSearch(productRequestId, promise);
}

export function searchAgain(productRequestId: string) {
  if (activeSearches.has(productRequestId)) {
    throw new Error("Search already in progress for this request.");
  }

  const promise = env.DEMO_MODE
    ? runDemoSearch(productRequestId).then(() => undefined)
    : runLiveSearch(productRequestId, true);

  return trackSearch(productRequestId, promise);
}
