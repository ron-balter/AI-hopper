import { EventEmitter } from "events";

export type AgentEventPayload = {
  id: string;
  productRequestId: string;
  runId: string | null;
  eventType: string;
  label: string;
  payload: string | null;
  createdAt: Date;
};

class AgentEventBus extends EventEmitter {
  emitEvent(event: AgentEventPayload) {
    this.emit(`request:${event.productRequestId}`, event);
    this.emit("event", event);
  }
}

export const agentEventBus = new AgentEventBus();
