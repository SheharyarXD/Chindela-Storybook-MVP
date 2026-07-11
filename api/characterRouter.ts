import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findAllCharacters,
  findCharacterById,
  findCharacterBySlug,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from "./queries/characters";

export const characterRouter = createRouter({
  list: publicQuery.query(async () => {
    return findAllCharacters();
  }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findCharacterById(input.id);
    }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return findCharacterBySlug(input.slug);
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        color: z.string().optional(),
        personality: z.string().optional(),
        catchphrase: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createCharacter(input);
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        color: z.string().optional(),
        personality: z.string().optional(),
        catchphrase: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateCharacter(id, data);
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteCharacter(input.id);
      return { success: true };
    }),
});
