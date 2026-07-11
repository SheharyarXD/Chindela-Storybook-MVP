import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findAllSafetyHeaders,
  findActiveSafetyHeaders,
  createSafetyHeader,
  updateSafetyHeader,
  deleteSafetyHeader,
} from "./queries/safetyHeaders";

export const safetyRouter = createRouter({
  list: publicQuery.query(async () => {
    return findAllSafetyHeaders();
  }),

  active: publicQuery
    .input(z.object({ ageGroupId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return findActiveSafetyHeaders(input?.ageGroupId);
    }),

  create: adminQuery
    .input(
      z.object({
        message: z.string().min(1),
        ageGroupId: z.number().optional(),
        isGlobal: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      return createSafetyHeader(input);
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        message: z.string().min(1).optional(),
        ageGroupId: z.number().optional(),
        isGlobal: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateSafetyHeader(id, data);
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteSafetyHeader(input.id);
      return { success: true };
    }),
});
