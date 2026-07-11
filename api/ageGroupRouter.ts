import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findAllAgeGroups,
  findAgeGroupById,
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
});
