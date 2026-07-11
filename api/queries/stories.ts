import { eq, and } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertStory, InsertLesson } from "@db/schema";
import { getDb } from "./connection";

export async function findAllStories() {
  return getDb().query.stories.findMany({
    orderBy: (s, { desc }) => [desc(s.createdAt)],
    with: {
      ageGroup: true,
      contentYear: true,
      character: true,
    },
  });
}

export async function findStoriesByAgeGroup(ageGroupId: number) {
  return getDb().query.stories.findMany({
    where: and(
      eq(schema.stories.ageGroupId, ageGroupId),
      eq(schema.stories.isActive, true),
      eq(schema.stories.isArchived, false)
    ),
    orderBy: (s, { asc }) => [asc(s.dayNumber)],
    with: {
      ageGroup: true,
      character: true,
    },
  });
}

export async function findStoryById(id: number) {
  return getDb().query.stories.findFirst({
    where: eq(schema.stories.id, id),
    with: {
      ageGroup: true,
      contentYear: true,
      character: true,
      lessons: true,
    },
  });
}

export async function createStory(data: InsertStory) {
  const [result] = await getDb()
    .insert(schema.stories)
    .values(data)
    .$returningId();
  return findStoryById(result.id);
}

export async function updateStory(id: number, data: Partial<InsertStory>) {
  await getDb()
    .update(schema.stories)
    .set(data)
    .where(eq(schema.stories.id, id));
  return findStoryById(id);
}

export async function deleteStory(id: number) {
  await getDb()
    .update(schema.stories)
    .set({ isActive: false })
    .where(eq(schema.stories.id, id));
}

// ============== LESSONS ==============

export async function findLessonsByStory(storyId: number) {
  return getDb().query.lessons.findMany({
    where: and(
      eq(schema.lessons.storyId, storyId),
      eq(schema.lessons.isActive, true)
    ),
    orderBy: (l, { asc }) => [asc(l.pageNumber)],
  });
}

export async function findLessonById(id: number) {
  return getDb().query.lessons.findFirst({
    where: eq(schema.lessons.id, id),
  });
}

export async function createLesson(data: InsertLesson) {
  const [result] = await getDb()
    .insert(schema.lessons)
    .values(data)
    .$returningId();
  return findLessonById(result.id);
}

export async function updateLesson(id: number, data: Partial<InsertLesson>) {
  await getDb()
    .update(schema.lessons)
    .set(data)
    .where(eq(schema.lessons.id, id));
  return findLessonById(id);
}

export async function deleteLesson(id: number) {
  await getDb()
    .update(schema.lessons)
    .set({ isActive: false })
    .where(eq(schema.lessons.id, id));
}
