import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const notificationRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.notification.findMany({
      orderBy: [{ read: "asc" }, { createdAt: "desc" }],
      take: 50,
    });
  }),

  unreadCount: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.notification.count({ where: { read: false } });
  }),

  markRead: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.notification.update({
        where: { id: input.id },
        data: { read: true },
      });
    }),

  markAllRead: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.db.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
    return { success: true };
  }),
});
