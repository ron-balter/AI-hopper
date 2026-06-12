import { observable } from "@trpc/server/observable";
import { z } from "zod";

import { agentEventBus } from "~/server/agents/event-emitter";
import { getActiveComparisonCount } from "~/server/agents/comparison-dispatcher";
import {
  getActiveSearchCount,
  getSdkActiveAgentCount,
} from "~/server/agents/dispatcher";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const agentRouter = createTRPCRouter({
  getEvents: publicProcedure
    .input(z.object({ productRequestId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.agentEvent.findMany({
        where: { productRequestId: input.productRequestId },
        orderBy: { createdAt: "asc" },
      });
    }),

  getActiveCount: publicProcedure.query(async () => {
    const [searches, comparisons, sdk] = await Promise.all([
      Promise.resolve(getActiveSearchCount()),
      Promise.resolve(getActiveComparisonCount()),
      getSdkActiveAgentCount(),
    ]);
    const local = searches + comparisons;
    return { local, sdk, searches, comparisons, total: Math.max(local, sdk) };
  }),

  subscribeEvents: publicProcedure
    .input(z.object({ productRequestId: z.string() }))
    .subscription(({ input }) => {
      return observable<{
        id: string;
        productRequestId: string;
        runId: string | null;
        eventType: string;
        label: string;
        payload: string | null;
        createdAt: Date;
      }>((emit) => {
        const channel = `request:${input.productRequestId}`;

        const onEvent = (event: {
          id: string;
          productRequestId: string;
          runId: string | null;
          eventType: string;
          label: string;
          payload: string | null;
          createdAt: Date;
        }) => {
          if (event.productRequestId === input.productRequestId) {
            emit.next(event);
          }
        };

        agentEventBus.on(channel, onEvent);

        return () => {
          agentEventBus.off(channel, onEvent);
        };
      });
    }),
});
