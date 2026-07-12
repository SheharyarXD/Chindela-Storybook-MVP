CREATE TABLE `age_groups` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`min_age` int NOT NULL,
	`max_age` int NOT NULL,
	`description` text,
	`color` varchar(20) DEFAULT '#FFB347',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `age_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_feedback` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`entry_id` bigint unsigned NOT NULL,
	`child_id` bigint unsigned NOT NULL,
	`positive_feedback` text NOT NULL,
	`reflection_guidance` text,
	`encouragement` text,
	`safe_suggestions` text,
	`character_name` varchar(100),
	`is_delivered` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_feedback_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_feedback_entry_id_unique` UNIQUE(`entry_id`)
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`image_url` text,
	`color` varchar(20) DEFAULT '#FFB347',
	`personality` text,
	`catchphrase` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `characters_id` PRIMARY KEY(`id`),
	CONSTRAINT `characters_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `child_progress` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`child_id` bigint unsigned NOT NULL,
	`story_id` bigint unsigned NOT NULL,
	`lesson_id` bigint unsigned,
	`progress` int NOT NULL DEFAULT 0,
	`is_completed` boolean NOT NULL DEFAULT false,
	`completed_at` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `child_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `children` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`parent_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`pin_hash` varchar(255) NOT NULL,
	`avatar` text,
	`age_group_id` bigint unsigned NOT NULL,
	`age` int NOT NULL,
	`favorite_character` varchar(100),
	`streak_days` int DEFAULT 0,
	`total_entries` int DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `children_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_years` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`year` int NOT NULL,
	`label` varchar(100) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_years_id` PRIMARY KEY(`id`),
	CONSTRAINT `content_years_year_unique` UNIQUE(`year`)
);
--> statement-breakpoint
CREATE TABLE `diary_entries` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`child_id` bigint unsigned NOT NULL,
	`story_id` bigint unsigned,
	`lesson_id` bigint unsigned,
	`text_content` text,
	`audio_url` text,
	`image_url` text,
	`mood` varchar(50),
	`entry_date` date NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diary_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`story_id` bigint unsigned NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`page_number` int NOT NULL,
	`image_url` text,
	`audio_url` text,
	`character_dialogue` text,
	`interactive_element` varchar(100),
	`is_active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`filename` varchar(255) NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`url` text NOT NULL,
	`size` bigint,
	`type` enum('image','audio','video') NOT NULL,
	`story_id` bigint unsigned,
	`lesson_id` bigint unsigned,
	`character_id` bigint unsigned,
	`uploaded_by` bigint unsigned NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`child_id` bigint unsigned,
	`type` enum('diary_entry','ai_feedback','subscription_expiry','safety_alert','milestone','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`is_email_sent` boolean NOT NULL DEFAULT false,
	`related_id` bigint unsigned,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`subscription_id` bigint unsigned NOT NULL,
	`parent_id` bigint unsigned NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'GBP',
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`stripe_payment_intent_id` varchar(255),
	`payment_method` varchar(100),
	`paid_at` timestamp,
	`failure_reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `safety_headers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`message` text NOT NULL,
	`age_group_id` bigint unsigned,
	`is_global` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `safety_headers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`age_group_id` bigint unsigned NOT NULL,
	`content_year_id` bigint unsigned NOT NULL,
	`character_id` bigint unsigned,
	`day_number` int NOT NULL,
	`cover_image` text,
	`theme` varchar(255),
	`moral_lesson` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`is_archived` boolean NOT NULL DEFAULT false,
	`created_by` bigint unsigned NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`parent_id` bigint unsigned NOT NULL,
	`child_id` bigint unsigned NOT NULL,
	`age_group_id` bigint unsigned NOT NULL,
	`duration` int NOT NULL,
	`price_per_month` decimal(10,2) NOT NULL,
	`total_price` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'GBP',
	`status` enum('active','expired','cancelled','pending') NOT NULL DEFAULT 'pending',
	`start_date` date,
	`end_date` date,
	`stripe_payment_intent_id` varchar(255),
	`is_auto_renew` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`email` varchar(320) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`email_verified_at` timestamp,
	`avatar` text,
	`role` enum('admin','parent') NOT NULL DEFAULT 'parent',
	`phone` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`lastSignInAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `ai_feedback` ADD CONSTRAINT `ai_feedback_entry_id_diary_entries_id_fk` FOREIGN KEY (`entry_id`) REFERENCES `diary_entries`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_feedback` ADD CONSTRAINT `ai_feedback_child_id_children_id_fk` FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `child_progress` ADD CONSTRAINT `child_progress_child_id_children_id_fk` FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `child_progress` ADD CONSTRAINT `child_progress_story_id_stories_id_fk` FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `child_progress` ADD CONSTRAINT `child_progress_lesson_id_lessons_id_fk` FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `children` ADD CONSTRAINT `children_parent_id_users_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `children` ADD CONSTRAINT `children_age_group_id_age_groups_id_fk` FOREIGN KEY (`age_group_id`) REFERENCES `age_groups`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `diary_entries` ADD CONSTRAINT `diary_entries_child_id_children_id_fk` FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `diary_entries` ADD CONSTRAINT `diary_entries_story_id_stories_id_fk` FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `diary_entries` ADD CONSTRAINT `diary_entries_lesson_id_lessons_id_fk` FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_story_id_stories_id_fk` FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_story_id_stories_id_fk` FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_lesson_id_lessons_id_fk` FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_character_id_characters_id_fk` FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_uploaded_by_users_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_child_id_children_id_fk` FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_subscription_id_subscriptions_id_fk` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_parent_id_users_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `safety_headers` ADD CONSTRAINT `safety_headers_age_group_id_age_groups_id_fk` FOREIGN KEY (`age_group_id`) REFERENCES `age_groups`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stories` ADD CONSTRAINT `stories_age_group_id_age_groups_id_fk` FOREIGN KEY (`age_group_id`) REFERENCES `age_groups`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stories` ADD CONSTRAINT `stories_content_year_id_content_years_id_fk` FOREIGN KEY (`content_year_id`) REFERENCES `content_years`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stories` ADD CONSTRAINT `stories_character_id_characters_id_fk` FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stories` ADD CONSTRAINT `stories_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_parent_id_users_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_child_id_children_id_fk` FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_age_group_id_age_groups_id_fk` FOREIGN KEY (`age_group_id`) REFERENCES `age_groups`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `ai_feedback_child_id_idx` ON `ai_feedback` (`child_id`);--> statement-breakpoint
CREATE INDEX `child_progress_child_id_idx` ON `child_progress` (`child_id`);--> statement-breakpoint
CREATE INDEX `child_progress_story_id_idx` ON `child_progress` (`story_id`);--> statement-breakpoint
CREATE INDEX `child_progress_lesson_id_idx` ON `child_progress` (`lesson_id`);--> statement-breakpoint
CREATE INDEX `children_parent_id_idx` ON `children` (`parent_id`);--> statement-breakpoint
CREATE INDEX `children_age_group_id_idx` ON `children` (`age_group_id`);--> statement-breakpoint
CREATE INDEX `diary_entries_child_id_idx` ON `diary_entries` (`child_id`);--> statement-breakpoint
CREATE INDEX `diary_entries_story_id_idx` ON `diary_entries` (`story_id`);--> statement-breakpoint
CREATE INDEX `diary_entries_lesson_id_idx` ON `diary_entries` (`lesson_id`);--> statement-breakpoint
CREATE INDEX `diary_entries_entry_date_idx` ON `diary_entries` (`entry_date`);--> statement-breakpoint
CREATE INDEX `lessons_story_id_idx` ON `lessons` (`story_id`);--> statement-breakpoint
CREATE INDEX `media_story_id_idx` ON `media` (`story_id`);--> statement-breakpoint
CREATE INDEX `media_lesson_id_idx` ON `media` (`lesson_id`);--> statement-breakpoint
CREATE INDEX `media_character_id_idx` ON `media` (`character_id`);--> statement-breakpoint
CREATE INDEX `media_uploaded_by_idx` ON `media` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `notifications_user_id_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_child_id_idx` ON `notifications` (`child_id`);--> statement-breakpoint
CREATE INDEX `notifications_related_id_idx` ON `notifications` (`related_id`);--> statement-breakpoint
CREATE INDEX `payments_subscription_id_idx` ON `payments` (`subscription_id`);--> statement-breakpoint
CREATE INDEX `payments_parent_id_idx` ON `payments` (`parent_id`);--> statement-breakpoint
CREATE INDEX `safety_headers_age_group_id_idx` ON `safety_headers` (`age_group_id`);--> statement-breakpoint
CREATE INDEX `stories_age_group_id_idx` ON `stories` (`age_group_id`);--> statement-breakpoint
CREATE INDEX `stories_content_year_id_idx` ON `stories` (`content_year_id`);--> statement-breakpoint
CREATE INDEX `stories_character_id_idx` ON `stories` (`character_id`);--> statement-breakpoint
CREATE INDEX `stories_created_by_idx` ON `stories` (`created_by`);--> statement-breakpoint
CREATE INDEX `subscriptions_parent_id_idx` ON `subscriptions` (`parent_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_child_id_idx` ON `subscriptions` (`child_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_age_group_id_idx` ON `subscriptions` (`age_group_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_status_end_date_idx` ON `subscriptions` (`status`,`end_date`);