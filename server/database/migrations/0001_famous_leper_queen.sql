ALTER TABLE `sesizari` ADD `media` text;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_oauth_accounts` (
	`provider_id` text NOT NULL,
	`provider_user_id` text,
	`user_id` text NOT NULL,
	`access_token` text NOT NULL,
	`refresh_token` text,
	`expires_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `provider_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_oauth_accounts`("provider_id", "provider_user_id", "user_id", "access_token", "refresh_token", "expires_at") SELECT "provider_id", "provider_user_id", "user_id", "access_token", "refresh_token", "expires_at" FROM `oauth_accounts`;--> statement-breakpoint
DROP TABLE `oauth_accounts`;--> statement-breakpoint
ALTER TABLE `__new_oauth_accounts` RENAME TO `oauth_accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;