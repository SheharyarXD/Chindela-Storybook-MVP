// Read-only diagnostic: reports any rows whose foreign-key column points at a
// row that no longer exists. Never modifies data. Run before applying a new
// migration that adds/tightens a foreign key constraint, so orphans can be
// reviewed and resolved deliberately rather than failing the migration (or
// being silently swallowed by an ON DELETE rule) at apply time.
import { getDb } from "../../api/queries/connection";
import { sql } from "drizzle-orm";

type Check = { table: string; column: string; references: string };

const checks: Check[] = [
  { table: "children", column: "parent_id", references: "users" },
  { table: "children", column: "age_group_id", references: "age_groups" },
  { table: "stories", column: "age_group_id", references: "age_groups" },
  { table: "stories", column: "content_year_id", references: "content_years" },
  { table: "stories", column: "character_id", references: "characters" },
  { table: "stories", column: "created_by", references: "users" },
  { table: "lessons", column: "story_id", references: "stories" },
  { table: "safety_headers", column: "age_group_id", references: "age_groups" },
  { table: "media", column: "story_id", references: "stories" },
  { table: "media", column: "lesson_id", references: "lessons" },
  { table: "media", column: "character_id", references: "characters" },
  { table: "media", column: "uploaded_by", references: "users" },
  { table: "diary_entries", column: "child_id", references: "children" },
  { table: "diary_entries", column: "story_id", references: "stories" },
  { table: "diary_entries", column: "lesson_id", references: "lessons" },
  { table: "ai_feedback", column: "entry_id", references: "diary_entries" },
  { table: "ai_feedback", column: "child_id", references: "children" },
  { table: "notifications", column: "user_id", references: "users" },
  { table: "notifications", column: "child_id", references: "children" },
  { table: "subscriptions", column: "parent_id", references: "users" },
  { table: "subscriptions", column: "child_id", references: "children" },
  { table: "subscriptions", column: "age_group_id", references: "age_groups" },
  { table: "payments", column: "subscription_id", references: "subscriptions" },
  { table: "payments", column: "parent_id", references: "users" },
  { table: "child_progress", column: "child_id", references: "children" },
  { table: "child_progress", column: "story_id", references: "stories" },
  { table: "child_progress", column: "lesson_id", references: "lessons" },
];

async function main() {
  const db = getDb();
  let orphanCount = 0;
  for (const { table, column, references } of checks) {
    const query = sql.raw(
      `SELECT COUNT(*) as c FROM \`${table}\` WHERE \`${column}\` IS NOT NULL AND \`${column}\` NOT IN (SELECT id FROM \`${references}\`)`,
    );
    const [rows] = (await db.execute(query)) as unknown as [{ c: number }[]];
    const count = Number(rows[0]?.c ?? 0);
    if (count > 0) {
      orphanCount += count;
      console.log(`ORPHANS: ${table}.${column} -> ${references}.id : ${count} row(s)`);
    }
  }
  console.log(orphanCount === 0 ? "No orphaned foreign-key values found." : `Total orphaned rows found: ${orphanCount}`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
