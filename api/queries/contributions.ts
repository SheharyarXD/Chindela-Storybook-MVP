import { eq, sum, count } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertContribution } from "@db/schema";
import { getDb, type DbOrTx } from "./connection";

export async function createContribution(data: InsertContribution, db: DbOrTx = getDb()) {
  const [result] = await db.insert(schema.contributions).values(data).$returningId();
  return result.id;
}

export async function findContributionById(id: number, db: DbOrTx = getDb()) {
  return db.query.contributions.findFirst({
    where: eq(schema.contributions.id, id),
  });
}

export async function updateContributionStatus(
  id: number,
  status: "pending" | "completed" | "failed" | "refunded",
  extra?: { stripePaymentIntentId?: string },
  db: DbOrTx = getDb(),
) {
  await db
    .update(schema.contributions)
    .set({ status, ...extra })
    .where(eq(schema.contributions.id, id));
}

export async function findContributionsByParent(parentId: number) {
  return getDb().query.contributions.findMany({
    where: eq(schema.contributions.parentId, parentId),
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });
}

export async function findAllContributions() {
  return getDb().query.contributions.findMany({
    orderBy: (c, { desc }) => [desc(c.createdAt)],
    with: { parent: true, subscription: true },
  });
}

export async function contributionTotals() {
  const db = getDb();
  const [totals] = await db
    .select({
      totalAmount: sum(schema.contributions.amount),
      count: count(),
    })
    .from(schema.contributions)
    .where(eq(schema.contributions.status, "completed"));

  return {
    totalAmount: Number(totals?.totalAmount ?? 0),
    count: totals?.count ?? 0,
  };
}
