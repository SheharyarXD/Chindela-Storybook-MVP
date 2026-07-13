import { eq, and, lt, desc } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertChild } from "@db/schema";
import { getDb } from "./connection";

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function findChildrenByParentId(parentId: number) {
  return getDb().query.children.findMany({
    where: eq(schema.children.parentId, parentId),
    with: {
      ageGroup: true,
    },
  });
}

export async function findChildById(id: number) {
  return getDb().query.children.findFirst({
    where: eq(schema.children.id, id),
    with: {
      ageGroup: true,
      parent: true,
    },
  });
}

export async function findChildForLogin(id: number) {
  return getDb().query.children.findFirst({
    where: and(eq(schema.children.id, id), eq(schema.children.isActive, true)),
    with: {
      ageGroup: true,
    },
  });
}

export async function createChild(data: InsertChild) {
  const [result] = await getDb()
    .insert(schema.children)
    .values(data)
    .$returningId();
  return findChildById(result.id);
}

export async function updateChild(id: number, data: Partial<InsertChild>) {
  await getDb()
    .update(schema.children)
    .set(data)
    .where(eq(schema.children.id, id));
  return findChildById(id);
}

export async function deleteChild(id: number) {
  await getDb()
    .update(schema.children)
    .set({ isActive: false })
    .where(eq(schema.children.id, id));
}

// Increments totalEntries and updates the daily streak for a new diary entry.
// Streak logic: consecutive calendar days with at least one entry increments
// the streak; a skipped day resets it to 1; multiple entries on the same day
// don't inflate it further.
export async function incrementChildStats(childId: number, entryDate: Date) {
  const child = await findChildById(childId);
  if (!child) return null;

  const today = startOfDay(entryDate);
  const priorEntry = await getDb().query.diaryEntries.findFirst({
    where: and(eq(schema.diaryEntries.childId, childId), lt(schema.diaryEntries.entryDate, today)),
    orderBy: [desc(schema.diaryEntries.entryDate)],
  });

  let streakDays = child.streakDays || 0;
  if (!priorEntry) {
    streakDays = 1;
  } else {
    const diffDays = Math.round((today.getTime() - startOfDay(new Date(priorEntry.entryDate)).getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays === 1) streakDays += 1;
    else if (diffDays > 1) streakDays = 1;
    else if (streakDays === 0) streakDays = 1; // first entry ever recorded today, defensive fallback
  }

  return updateChild(childId, {
    totalEntries: (child.totalEntries || 0) + 1,
    streakDays,
  });
}
