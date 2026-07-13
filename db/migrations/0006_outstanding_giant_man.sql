-- The new non-unique index must exist before the old unique index is dropped:
-- InnoDB requires the entry_id -> diary_entries FK to always have a backing
-- index, so dropping ai_feedback_entry_id_unique first (with nothing else
-- indexing entry_id yet) fails with "needed in a foreign key constraint".
CREATE INDEX `ai_feedback_entry_id_idx` ON `ai_feedback` (`entry_id`);--> statement-breakpoint
ALTER TABLE `ai_feedback` DROP INDEX `ai_feedback_entry_id_unique`;--> statement-breakpoint
ALTER TABLE `ai_feedback` ADD `attempt_number` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `ai_feedback` ADD `submitted_text` text;--> statement-breakpoint
ALTER TABLE `ai_feedback` ADD `mistakes_explained` text;--> statement-breakpoint
ALTER TABLE `ai_feedback` ADD `hints` text;--> statement-breakpoint
UPDATE `ai_feedback` af INNER JOIN `diary_entries` de ON de.id = af.entry_id SET af.submitted_text = COALESCE(de.text_content, '') WHERE af.submitted_text IS NULL;--> statement-breakpoint
ALTER TABLE `ai_feedback` MODIFY COLUMN `submitted_text` text NOT NULL;