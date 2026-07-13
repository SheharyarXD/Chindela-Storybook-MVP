import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findAllContentYears,
  findActiveContentYears,
  findContentYearById,
  createContentYear,
  updateContentYear,
  deleteContentYear,
} from "./queries/contentYears";

export const contentYearRouter = createRouter({
  list: publicQuery.query(async () => {
    return findAllContentYears();
  }),

  active: publicQuery.query(async () => {
    return findActiveContentYears();
  }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findContentYearById(input.id);
    }),

  create: adminQuery
    .input(
      z.object({
        year: z.number(),
        label: z.string().min(1),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      return createContentYear(input);
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        year: z.number().optional(),
        label: z.string().min(1).optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateContentYear(id, data);
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await deleteContentYear(input.id);
      } catch {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This content year still has stories linked to it. Reassign or delete those stories first.",
        });
      }
      return { success: true };
    }),
});
