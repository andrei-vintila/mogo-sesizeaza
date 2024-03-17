CREATE TABLE `sesizare_votes` (
	`sesizare_id` text NOT NULL,
	`voter_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`sesizare_id`) REFERENCES `sesizari`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`voter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sesizare_votes_sesizare_id_voter_id_unique` ON `sesizare_votes` (`sesizare_id`,`voter_id`);