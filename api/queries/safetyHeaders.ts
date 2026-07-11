import { eq, and } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertSafetyHeader } from "@db/schema";
import { getDb } from "./connection";

export async function findAllSafetyHeaders() {
  return getDb().query.safetyHeaders.findMany({
    orderBy: (sh, { desc }) => [desc(sh.createdAt)],
  });
}

export async function findActiveSafetyHeaders(ageGroupId?: number) {
  if (ageGroupId) {
    return getDb().query.safetyHeaders.findMany({
      where: and(
        eq(schema.safetyHeaders.isActive, true),
        eq(schema.safetyHeaders.ageGroupId, ageGroupId)
      ),
    });
  }
  
  return getDb().query.safetyHeaders.findMany({
    where: and(
      eq(schema.safetyHeaders.isActive, true),
      eq(schema.safetyHeaders.isGlobal, true)
    ),
  });
}

export async function createSafetyHeader(data: InsertSafetyHeader) {
  const [result] = await getDb()
    .insert(schema.safetyHeaders)
    .values(data)
    .$returningId();
  return result.id;
}

export async function updateSafetyHeader(id: number, data: Partial<InsertSafetyHeader>) {
  await getDb()
    .update(schema.safetyHeaders)
    .set(data)
    .where(eq(schema.safetyHeaders.id, id));
}

export async function deleteSafetyHeader(id: number) {
  await getDb()
    .update(schema.safetyHeaders)
    .set({ isActive: false })
    .where(eq(schema.safetyHeaders.id, id));
}
