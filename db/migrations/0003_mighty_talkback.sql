CREATE TABLE `contributions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`parent_id` bigint unsigned NOT NULL,
	`subscription_id` bigint unsigned,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'GBP',
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`stripe_checkout_session_id` varchar(255),
	`stripe_payment_intent_id` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contributions` ADD CONSTRAINT `contributions_parent_id_users_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contributions` ADD CONSTRAINT `contributions_subscription_id_subscriptions_id_fk` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `contributions_parent_id_idx` ON `contributions` (`parent_id`);--> statement-breakpoint
CREATE INDEX `contributions_subscription_id_idx` ON `contributions` (`subscription_id`);--> statement-breakpoint
CREATE INDEX `contributions_status_idx` ON `contributions` (`status`);