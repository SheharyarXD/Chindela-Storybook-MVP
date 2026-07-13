import { eq, and, gte } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertSubscription, InsertPayment } from "@db/schema";
import { getDb, type DbOrTx } from "./connection";

export async function findSubscriptionsByParent(parentId: number) {
  return getDb().query.subscriptions.findMany({
    where: eq(schema.subscriptions.parentId, parentId),
    orderBy: (s, { desc }) => [desc(s.createdAt)],
    with: {
      child: true,
      ageGroup: true,
      payments: true,
    },
  });
}

export async function findActiveSubscription(childId: number, ageGroupId: number) {
  return getDb().query.subscriptions.findFirst({
    where: and(
      eq(schema.subscriptions.childId, childId),
      eq(schema.subscriptions.ageGroupId, ageGroupId),
      eq(schema.subscriptions.status, "active"),
      gte(schema.subscriptions.endDate, new Date()),
    ),
    with: {
      ageGroup: true,
    },
  });
}

export async function hasActiveEntitlement(childId: number, ageGroupId: number) {
  return Boolean(await findActiveSubscription(childId, ageGroupId));
}

export async function createSubscription(data: InsertSubscription) {
  const [result] = await getDb()
    .insert(schema.subscriptions)
    .values(data)
    .$returningId();
  return findSubscriptionById(result.id);
}

export async function findSubscriptionById(id: number, db: DbOrTx = getDb()) {
  return db.query.subscriptions.findFirst({
    where: eq(schema.subscriptions.id, id),
    with: {
      child: true,
      ageGroup: true,
      payments: true,
    },
  });
}

export async function findSubscriptionByStripeId(stripeSubscriptionId: string, db: DbOrTx = getDb()) {
  return db.query.subscriptions.findFirst({
    where: eq(schema.subscriptions.stripeSubscriptionId, stripeSubscriptionId),
    with: {
      child: true,
      ageGroup: true,
      payments: true,
    },
  });
}

export async function updateSubscription(id: number, data: Partial<InsertSubscription>, db: DbOrTx = getDb()) {
  await db
    .update(schema.subscriptions)
    .set(data)
    .where(eq(schema.subscriptions.id, id));
  return findSubscriptionById(id, db);
}

export async function cancelSubscription(id: number) {
  return updateSubscription(id, { status: "cancelled" });
}

// ============== PAYMENTS ==============

export async function createPayment(data: InsertPayment, db: DbOrTx = getDb()) {
  const [result] = await db
    .insert(schema.payments)
    .values(data)
    .$returningId();
  return result.id;
}

export async function findPaymentsByParent(parentId: number) {
  return getDb().query.payments.findMany({
    where: eq(schema.payments.parentId, parentId),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });
}

export async function updatePaymentStatus(
  id: number,
  status: "pending" | "completed" | "failed" | "refunded",
  extra?: { paidAt?: Date; failureReason?: string }
) {
  await getDb()
    .update(schema.payments)
    .set({ status, ...extra })
    .where(eq(schema.payments.id, id));
}
