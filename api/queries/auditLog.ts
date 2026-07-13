import * as schema from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { getDb } from "./connection";

export type AuditAction =
  | "login_success"
  | "login_failed"
  | "register"
  | "logout"
  | "logout_all"
  | "child_login_success"
  | "child_login_failed"
  | "password_reset_requested"
  | "password_reset_completed"
  | "email_verified"
  | "session_revoked";

export async function logAuditEvent(data: {
  userId?: number;
  childId?: number;
  action: AuditAction;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  await getDb()
    .insert(schema.auditLogs)
    .values({
      userId: data.userId,
      childId: data.childId,
      action: data.action,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    });
}

export async function findAuditLogsForUser(userId: number, limit = 50) {
  return getDb().query.auditLogs.findMany({
    where: eq(schema.auditLogs.userId, userId),
    orderBy: [desc(schema.auditLogs.createdAt)],
    limit,
  });
}
