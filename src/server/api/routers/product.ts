import { z } from "zod";

import {
  searchAgain,
  startSearch,
} from "~/server/agents/dispatcher";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const productRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        rationale: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.productRequest.create({
        data: {
          title: input.title,
          description: input.description,
          rationale: input.rationale,
          status: "DRAFT",
        },
      });
    }),

  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.productRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { candidates: true } },
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.productRequest.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          candidates: { orderBy: [{ rank: "asc" }, { createdAt: "asc" }] },
        },
      });
    }),

  startSearch: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.productRequest.findUniqueOrThrow({
        where: { id: input.id },
      });

      if (request.status !== "DRAFT" && request.status !== "FAILED") {
        throw new Error(`Cannot start search from status ${request.status}`);
      }

      void startSearch(input.id);
      return { started: true };
    }),

  selectCandidate: publicProcedure
    .input(
      z.object({
        productRequestId: z.string(),
        candidateId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.productCandidate.findFirstOrThrow({
        where: {
          id: input.candidateId,
          productRequestId: input.productRequestId,
        },
      });

      const updated = await ctx.db.productRequest.update({
        where: { id: input.productRequestId },
        data: {
          status: "SELECTED",
          selectedCandidateId: input.candidateId,
        },
      });

      await ctx.db.notification.updateMany({
        where: { productRequestId: input.productRequestId, read: false },
        data: { read: true },
      });

      return updated;
    }),

  searchAgain: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.productRequest.findUniqueOrThrow({
        where: { id: input.id },
      });

      if (
        request.status !== "READY_FOR_REVIEW" &&
        request.status !== "SELECTED" &&
        request.status !== "FAILED"
      ) {
        throw new Error(`Cannot search again from status ${request.status}`);
      }

      void searchAgain(input.id);
      return { started: true };
    }),
});
