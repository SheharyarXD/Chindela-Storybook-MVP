import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findAllStories,
  findStoriesByAgeGroup,
  findStoryById,
  createStory,
  updateStory,
  deleteStory,
  findLessonsByStory,
  findLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from "./queries/stories";

export const storyRouter = createRouter({
  // Public
  list: publicQuery.query(async () => {
    return findAllStories();
  }),

  byAgeGroup: publicQuery
    .input(z.object({ ageGroupId: z.number() }))
    .query(async ({ input }) => {
      return findStoriesByAgeGroup(input.ageGroupId);
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findStoryById(input.id);
    }),

  // Lessons
  lessons: publicQuery
    .input(z.object({ storyId: z.number() }))
    .query(async ({ input }) => {
      return findLessonsByStory(input.storyId);
    }),

  lessonById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findLessonById(input.id);
    }),

  // Admin CRUD
  create: adminQuery
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        ageGroupId: z.number(),
        contentYearId: z.number(),
        characterId: z.number().optional(),
        dayNumber: z.number().min(1).max(365),
        coverImage: z.string().optional(),
        theme: z.string().optional(),
        moralLesson: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return createStory({
        ...input,
        createdBy: ctx.user.id,
      });
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        ageGroupId: z.number().optional(),
        contentYearId: z.number().optional(),
        characterId: z.number().optional(),
        dayNumber: z.number().min(1).max(365).optional(),
        coverImage: z.string().optional(),
        theme: z.string().optional(),
        moralLesson: z.string().optional(),
        isActive: z.boolean().optional(),
        isArchived: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateStory(id, data);
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteStory(input.id);
      return { success: true };
    }),

  // Lesson CRUD
  createLesson: adminQuery
    .input(
      z.object({
        storyId: z.number(),
        title: z.string().min(1),
        content: z.string().min(1),
        pageNumber: z.number().min(1),
        imageUrl: z.string().optional(),
        audioUrl: z.string().optional(),
        characterDialogue: z.string().optional(),
        interactiveElement: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createLesson(input);
    }),

  updateLesson: adminQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        content: z.string().optional(),
        pageNumber: z.number().optional(),
        imageUrl: z.string().optional(),
        audioUrl: z.string().optional(),
        characterDialogue: z.string().optional(),
        interactiveElement: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateLesson(id, data);
    }),

  deleteLesson: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteLesson(input.id);
      return { success: true };
    }),
});
