ALTER TABLE `media` MODIFY COLUMN `type` enum('image','audio','video','pdf','document') NOT NULL;--> statement-breakpoint
ALTER TABLE `media` ADD `storage_key` varchar(500) NOT NULL;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_storage_key_unique` UNIQUE(`storage_key`);