ALTER TABLE `child_progress` ADD `last_page_index` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `child_progress` ADD `is_bookmarked` boolean DEFAULT false NOT NULL;