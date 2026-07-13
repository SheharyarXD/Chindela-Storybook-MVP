import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertAgeGroup } from "@db/schema";
import { getDb } from "./connection";

export async function findAllAgeGroups() {
  return getDb().query.ageGroups.findMany({
    orderBy: (ag, { asc }) => [asc(ag.minAge)],
  });
}

export async function findAgeGroupById(id: number) {
  return getDb().query.ageGroups.findFirst({
    where: eq(schema.ageGroups.id, id),
  });
}

export async function createAgeGroup(data: InsertAgeGroup) {
  const [result] = await getDb().insert(schema.ageGroups).values(data).$returningId();
  return findAgeGroupById(result.id);
}

export async function updateAgeGroup(id: number, data: Partial<InsertAgeGroup>) {
  await getDb().update(schema.ageGroups).set(data).where(eq(schema.ageGroups.id, id));
  return findAgeGroupById(id);
}

export async function deleteAgeGroup(id: number) {
  await getDb().delete(schema.ageGroups).where(eq(schema.ageGroups.id, id));
}
