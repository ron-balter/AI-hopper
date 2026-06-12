import "server-only";

import { db } from "~/server/db";
import { agentEventBus } from "~/server/agents/event-emitter";

const STREAMABLE_TYPES = new Set(["thinking", "assistant"]);

type StreamEvent = {
  type: string;
  text?: string;
  name?: string;
  status?: string;
  message?: { content?: Array<{ type: string; text?: string }> };
  [key: string]: unknown;
};

type StreamBuffer = {
  eventType: string;
  eventId: string;
  label: string;
};

function streamChunk(event: StreamEvent): string | null {
  if (event.type === "thinking" && event.text) {
    return String(event.text);
  }
  if (event.type === "assistant" && event.message?.content) {
    const text = event.message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("");
    return text || null;
  }
  return null;
}

function streamLabel(event: StreamEvent): string | null {
  const chunk = streamChunk(event);
  if (chunk) return chunk;

  if (event.type === "tool_call") {
    return `[tool] ${event.name ?? "unknown"} (${event.status ?? "running"})`;
  }
  if (event.type === "status") {
    return `Status: ${event.status ?? "update"}`;
  }
  if (event.type === "task" && event.text) {
    return String(event.text);
  }
  return null;
}

function appendText(existing: string, chunk: string): string {
  if (!chunk) return existing;
  if (!existing) return chunk;
  if (chunk.startsWith(existing)) return chunk;
  if (existing.endsWith(chunk) || existing.includes(chunk)) return existing;

  const needsSpace =
    !/\s$/.test(existing) &&
    !/^\s/.test(chunk) &&
    !/^[,.;:!?)]/.test(chunk);

  return existing + (needsSpace ? " " : "") + chunk;
}

async function createEvent(
  productRequestId: string,
  runId: string,
  eventType: string,
  label: string,
  payload?: unknown,
) {
  const event = await db.agentEvent.create({
    data: {
      productRequestId,
      runId,
      eventType,
      label,
      payload: payload ? JSON.stringify(payload) : null,
    },
  });
  agentEventBus.emitEvent(event);
  return event;
}

async function updateEvent(
  eventId: string,
  label: string,
  payload?: unknown,
) {
  const event = await db.agentEvent.update({
    where: { id: eventId },
    data: {
      label,
      payload: payload ? JSON.stringify(payload) : null,
    },
  });
  agentEventBus.emitEvent(event);
  return event;
}

async function flushBuffer(
  productRequestId: string,
  runId: string,
  buffer: StreamBuffer | null,
  payload?: unknown,
) {
  if (!buffer) return null;

  await updateEvent(buffer.eventId, buffer.label, payload);
  return null;
}

async function appendStreamable(
  productRequestId: string,
  runId: string,
  event: StreamEvent,
  buffer: StreamBuffer | null,
): Promise<StreamBuffer> {
  const chunk = streamChunk(event);
  if (!chunk) {
    throw new Error("appendStreamable called without stream chunk");
  }

  if (buffer?.eventType === event.type) {
    const label = appendText(buffer.label, chunk);
    await updateEvent(buffer.eventId, label, event);
    return { ...buffer, label };
  }

  const created = await createEvent(
    productRequestId,
    runId,
    event.type,
    chunk,
    event,
  );
  return { eventType: event.type, eventId: created.id, label: chunk };
}

export async function persistAgentStream(
  productRequestId: string,
  runId: string,
  stream: AsyncIterable<{ type: string }>,
) {
  let buffer: StreamBuffer | null = null;

  for await (const raw of stream) {
    const event = raw as StreamEvent;
    if (STREAMABLE_TYPES.has(event.type)) {
      const chunk = streamChunk(event);
      if (!chunk) continue;
      buffer = await appendStreamable(productRequestId, runId, event, buffer);
      continue;
    }

    buffer = await flushBuffer(productRequestId, runId, buffer);

    const label = streamLabel(event);
    if (!label) continue;

    await createEvent(productRequestId, runId, event.type, label, event);
  }

  await flushBuffer(productRequestId, runId, buffer);
}
