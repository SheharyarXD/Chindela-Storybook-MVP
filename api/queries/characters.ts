import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertCharacter } from "@db/schema";
import { getDb } from "./connection";

export async function findAllCharacters() {
  return getDb().query.characters.findMany({
    orderBy: (c, { asc }) => [asc(c.name)],
  });
}

export async function findCharacterById(id: number) {
  return getDb().query.characters.findFirst({
    where: eq(schema.characters.id, id),
  });
}

export async function findCharacterBySlug(slug: string) {
  return getDb().query.characters.findFirst({
    where: eq(schema.characters.slug, slug),
  });
}

export async function createCharacter(data: InsertCharacter) {
  const [result] = await getDb()
    .insert(schema.characters)
    .values(data)
    .$returningId();
  return findCharacterById(result.id);
}

export async function updateCharacter(id: number, data: Partial<InsertCharacter>) {
  await getDb()
    .update(schema.characters)
    .set(data)
    .where(eq(schema.characters.id, id));
  return findCharacterById(id);
}

export async function deleteCharacter(id: number) {
  await getDb()
    .update(schema.characters)
    .set({ isActive: false })
    .where(eq(schema.characters.id, id));
}
