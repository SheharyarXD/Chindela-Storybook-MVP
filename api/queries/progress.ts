import { eq, and, desc } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";

export async function findProgressByChildAndStory(childId: number, storyId: number) {
  return getDb().query.childProgress.findFirst({
    where: and(eq(schema.childProgress.childId, childId), eq(schema.childProgress.storyId, storyId)),
  });
}

export async function findProgressByChild(childId: number) {
  return getDb().query.childProgress.findMany({
    where: eq(schema.childProgress.childId, childId),
    orderBy: [desc(schema.childProgress.updatedAt)],
    with: { story: true },
  });
}

export async function findBookmarksByChild(childId: number) {
  return getDb().query.childProgress.findMany({
    where: and(eq(schema.childProgress.childId, childId), eq(schema.childProgress.isBookmarked, true)),
    orderBy: [desc(schema.childProgress.updatedAt)],
    with: { story: true },
  });
}

export async function upsertProgress(params: {
  childId: number;
  storyId: number;
  lessonId?: number;
  progress: number;
  lastPageIndex: number;
  isCompleted: boolean;
}) {
  const existing = await findProgressByChildAndStory(params.childId, params.storyId);
  const db = getDb();
  if (existing) {
    await db
      .update(schema.childProgress)
      .set({
        lessonId: params.lessonId,
        progress: params.progress,
        lastPageIndex: params.lastPageIndex,
        isCompleted: params.isCompleted,
        completedAt: params.isCompleted && !existing.isCompleted ? new Date() : existing.completedAt,
      })
      .where(eq(schema.childProgress.id, existing.id));
    return findProgressByChildAndStory(params.childId, params.storyId);
  }
  await db.insert(schema.childProgress).values({
    childId: params.childId,
    storyId: params.storyId,
    lessonId: params.lessonId,
    progress: params.progress,
    lastPageIndex: params.lastPageIndex,
    isCompleted: params.isCompleted,
    completedAt: params.isCompleted ? new Date() : undefined,
  });
  return findProgressByChildAndStory(params.childId, params.storyId);
}

export async function toggleBookmark(childId: number, storyId: number) {
  const existing = await findProgressByChildAndStory(childId, storyId);
  const db = getDb();
  if (existing) {
    await db.update(schema.childProgress).set({ isBookmarked: !existing.isBookmarked }).where(eq(schema.childProgress.id, existing.id));
  } else {
    await db.insert(schema.childProgress).values({ childId, storyId, isBookmarked: true });
  }
  return findProgressByChildAndStory(childId, storyId);
}
