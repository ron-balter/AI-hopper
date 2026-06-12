import { agentRouter } from "~/server/api/routers/agent";
import { notificationRouter } from "~/server/api/routers/notification";
import { productRouter } from "~/server/api/routers/product";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  product: productRouter,
  notification: notificationRouter,
  agent: agentRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
