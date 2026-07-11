import { eq, desc } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertContentYear } from "@db/schema";
import { getDb } from "./connection";

export async function findAllContentYears() {
  return getDb().query.contentYears.findMany({
    orderBy: [desc(schema.contentYears.year)],
  });
}

export async function findActiveContentYears() {
  return getDb().query.contentYears.findMany({
    where: eq(schema.contentYears.isActive, true),
    orderBy: [desc(schema.contentYears.year)],
  });
}

export async function findContentYearById(id: number) {
  return getDb().query.contentYears.findFirst({
    where: eq(schema.contentYears.id, id),
  });
}

export async function createContentYear(data: InsertContentYear) {
  const [result] = await getDb()
    .insert(schema.contentYears)
    .values(data)
    .$returningId();
  return findContentYearById(result.id);
}

export async function updateContentYear(id: number, data: Partial<InsertContentYear>) {
  await getDb()
    .update(schema.contentYears)
    .set(data)
    .where(eq(schema.contentYears.id, id));
  return findContentYearById(id);
}
