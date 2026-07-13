import { eq, and, isNull, gte } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";

export async function createSession(data: {
  userId?: number;
  childId?: number;
  tokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  rememberMe?: boolean;
  expiresAt: Date;
}) {
  await getDb().insert(schema.sessions).values(data);
}

export async function findActiveSessionByTokenHash(tokenHash: string) {
  return getDb().query.sessions.findFirst({
    where: and(
      eq(schema.sessions.tokenHash, tokenHash),
      isNull(schema.sessions.revokedAt),
      gte(schema.sessions.expiresAt, new Date()),
    ),
  });
}

export async function touchSession(id: number) {
  await getDb().update(schema.sessions).set({ lastSeenAt: new Date() }).where(eq(schema.sessions.id, id));
}

export async function extendSession(id: number, expiresAt: Date, tokenHash: string) {
  await getDb().update(schema.sessions).set({ expiresAt, tokenHash, lastSeenAt: new Date() }).where(eq(schema.sessions.id, id));
}

export async function revokeSession(id: number) {
  await getDb().update(schema.sessions).set({ revokedAt: new Date() }).where(eq(schema.sessions.id, id));
}

export async function revokeSessionByTokenHash(tokenHash: string) {
  await getDb().update(schema.sessions).set({ revokedAt: new Date() }).where(eq(schema.sessions.tokenHash, tokenHash));
}

export async function revokeAllSessionsForUser(userId: number) {
  await getDb()
    .update(schema.sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(schema.sessions.userId, userId), isNull(schema.sessions.revokedAt)));
}

export async function listActiveSessionsForUser(userId: number) {
  return getDb().query.sessions.findMany({
    where: and(eq(schema.sessions.userId, userId), isNull(schema.sessions.revokedAt), gte(schema.sessions.expiresAt, new Date())),
    orderBy: (s, { desc }) => [desc(s.lastSeenAt)],
  });
}

export async function findSessionById(id: number) {
  return getDb().query.sessions.findFirst({ where: eq(schema.sessions.id, id) });
}
