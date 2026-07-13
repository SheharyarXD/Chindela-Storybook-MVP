import { sql } from "drizzle-orm";
import { getDb } from "../queries/connection";

const DB_CHECK_TIMEOUT_MS = 3_000;

// A real connectivity check, not just "the process is alive" -- lets an
// orchestrator (k8s/ECS/etc.) know when to stop routing traffic to an
// instance whose database connection has dropped, and when to restart it.
export async function checkHealth(): Promise<{ ok: boolean; database: boolean }> {
  try {
    await Promise.race([
      getDb().execute(sql`SELECT 1`),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), DB_CHECK_TIMEOUT_MS)),
    ]);
    return { ok: true, database: true };
  } catch {
    return { ok: false, database: false };
  }
}
