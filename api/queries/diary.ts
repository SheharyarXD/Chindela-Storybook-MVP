import { eq, desc, and } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertDiaryEntry, InsertAIFeedback } from "@db/schema";
import { getDb } from "./connection";

export async function findDiaryEntriesByChild(childId: number) {
  return getDb().query.diaryEntries.findMany({
    where: eq(schema.diaryEntries.childId, childId),
    orderBy: [desc(schema.diaryEntries.createdAt)],
    with: {
      story: true,
      lesson: true,
    },
  });
}

export async function findDiaryEntryById(id: number) {
  return getDb().query.diaryEntries.findFirst({
    where: eq(schema.diaryEntries.id, id),
    with: {
      child: true,
      story: true,
    },
  });
}

export async function createDiaryEntry(data: InsertDiaryEntry) {
  const [result] = await getDb()
    .insert(schema.diaryEntries)
    .values(data)
    .$returningId();
  return findDiaryEntryById(result.id);
}

export async function markEntryAsRead(id: number) {
  await getDb()
    .update(schema.diaryEntries)
    .set({ isRead: true })
    .where(eq(schema.diaryEntries.id, id));
}

export async function updateDiaryEntryContent(
  id: number,
  data: Pick<InsertDiaryEntry, "textContent" | "imageUrl" | "audioUrl">,
) {
  await getDb().update(schema.diaryEntries).set(data).where(eq(schema.diaryEntries.id, id));
  return findDiaryEntryById(id);
}

// ============== AI FEEDBACK ==============

export async function findAIFeedbackByChild(childId: number) {
  return getDb().query.aiFeedback.findMany({
    where: eq(schema.aiFeedback.childId, childId),
    orderBy: [desc(schema.aiFeedback.createdAt)],
  });
}

// Full attempt/conversation history for one diary entry, oldest first.
export async function findAIFeedbackByEntry(entryId: number) {
  return getDb().query.aiFeedback.findMany({
    where: eq(schema.aiFeedback.entryId, entryId),
    orderBy: (f, { asc }) => [asc(f.attemptNumber)],
  });
}

export async function findLatestAttemptNumber(entryId: number) {
  const attempts = await getDb().query.aiFeedback.findMany({
    where: eq(schema.aiFeedback.entryId, entryId),
    columns: { attemptNumber: true },
    orderBy: (f, { desc }) => [desc(f.attemptNumber)],
    limit: 1,
  });
  return attempts.at(0)?.attemptNumber ?? 0;
}

export async function findUndeliveredFeedback(childId: number) {
  return getDb().query.aiFeedback.findMany({
    where: and(
      eq(schema.aiFeedback.childId, childId),
      eq(schema.aiFeedback.isDelivered, false)
    ),
    orderBy: [desc(schema.aiFeedback.createdAt)],
  });
}

export async function createAIFeedback(data: InsertAIFeedback) {
  const [result] = await getDb()
    .insert(schema.aiFeedback)
    .values(data)
    .$returningId();
  return findAIFeedbackById(result.id);
}

export async function findAIFeedbackById(id: number) {
  return getDb().query.aiFeedback.findFirst({
    where: eq(schema.aiFeedback.id, id),
  });
}

export async function markFeedbackAsDelivered(id: number) {
  await getDb()
    .update(schema.aiFeedback)
    .set({ isDelivered: true })
    .where(eq(schema.aiFeedback.id, id));
}
