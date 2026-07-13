import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

type Database = ReturnType<typeof drizzle<typeof fullSchema>>;

let instance: Database;

export function getDb() {
  if (!instance) {
    instance = drizzle(env.databaseUrl, {
      mode: "default",
      schema: fullSchema,
    });
  }
  return instance;
}

// Accepted by query helpers so callers can run several writes inside a single
// getDb().transaction(async (tx) => { ... }) block for all-or-nothing commits.
export type DbOrTx = Database | Parameters<Parameters<Database["transaction"]>[0]>[0];
