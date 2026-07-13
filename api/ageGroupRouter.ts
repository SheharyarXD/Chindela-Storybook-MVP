import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findAllAgeGroups,
  findAgeGroupById,
  createAgeGroup,
  updateAgeGroup,
  deleteAgeGroup,
} from "./queries/ageGroups";

export const ageGroupRouter = createRouter({
  list: publicQuery.query(async () => {
    return findAllAgeGroups();
  }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findAgeGroupById(input.id);
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        minAge: z.number().int().min(0),
        maxAge: z.number().int().min(0),
        description: z.string().optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createAgeGroup(input);
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        minAge: z.number().int().min(0).optional(),
        maxAge: z.number().int().min(0).optional(),
        description: z.string().optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateAgeGroup(id, data);
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await deleteAgeGroup(input.id);
      } catch {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This age group still has children, stories, or subscriptions linked to it.",
        });
      }
      return { success: true };
    }),
});
