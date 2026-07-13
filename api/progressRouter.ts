import { z } from "zod";
import { createRouter, authedQuery, childQuery } from "./middleware";
import { findProgressByChild, findBookmarksByChild, upsertProgress, toggleBookmark } from "./queries/progress";

export const progressRouter = createRouter({
  myProgress: childQuery.query(async ({ ctx }) => findProgressByChild(ctx.child.id)),
  myBookmarks: childQuery.query(async ({ ctx }) => findBookmarksByChild(ctx.child.id)),

  save: childQuery
    .input(
      z.object({
        storyId: z.number(),
        lessonId: z.number().optional(),
        pageIndex: z.number().int().min(0),
        totalPages: z.number().int().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const progress = Math.min(100, Math.round(((input.pageIndex + 1) / input.totalPages) * 100));
      return upsertProgress({
        childId: ctx.child.id,
        storyId: input.storyId,
        lessonId: input.lessonId,
        progress,
        lastPageIndex: input.pageIndex,
        isCompleted: input.pageIndex >= input.totalPages - 1,
      });
    }),

  toggleBookmark: childQuery
    .input(z.object({ storyId: z.number() }))
    .mutation(async ({ input, ctx }) => toggleBookmark(ctx.child.id, input.storyId)),

  // Parent-facing: reading progress / completed lessons analytics for one child.
  byChild: authedQuery
    .input(z.object({ childId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { findChildById } = await import("./queries/children");
      const child = await findChildById(input.childId);
      if (!child || child.parentId !== ctx.user.id) throw new Error("Unauthorized");
      return findProgressByChild(input.childId);
    }),
});
