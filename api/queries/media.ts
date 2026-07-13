import { and, eq, like, or, count, desc } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertMedia } from "@db/schema";
import { getDb } from "./connection";

export async function createMedia(data: InsertMedia) {
  const [result] = await getDb().insert(schema.media).values(data).$returningId();
  return getDb().query.media.findFirst({ where: eq(schema.media.id, result.id) });
}

export async function findMediaById(id: number) {
  return getDb().query.media.findFirst({ where: eq(schema.media.id, id) });
}

export async function findMediaPaginated(params: {
  type?: "image" | "audio" | "video" | "pdf" | "document";
  search?: string;
  page: number;
  pageSize: number;
}) {
  const db = getDb();
  const conditions = [
    params.type ? eq(schema.media.type, params.type) : undefined,
    params.search
      ? or(like(schema.media.originalName, `%${params.search}%`), like(schema.media.filename, `%${params.search}%`))
      : undefined,
  ].filter((c): c is NonNullable<typeof c> => Boolean(c));
  const where = conditions.length ? and(...conditions) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db.query.media.findMany({
      where,
      orderBy: [desc(schema.media.createdAt)],
      limit: params.pageSize,
      offset: (params.page - 1) * params.pageSize,
    }),
    db.select({ total: count() }).from(schema.media).where(where),
  ]);

  return { items, total, page: params.page, pageSize: params.pageSize };
}

export async function updateMedia(id: number, data: Partial<InsertMedia>) {
  await getDb().update(schema.media).set(data).where(eq(schema.media.id, id));
  return findMediaById(id);
}

export async function deleteMedia(id: number) {
  await getDb().delete(schema.media).where(eq(schema.media.id, id));
}
