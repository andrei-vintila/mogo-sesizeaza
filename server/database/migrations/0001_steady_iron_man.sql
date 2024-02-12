CREATE TABLE `sesizari` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`labels` text,
	`status` text DEFAULT 'new',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`reporter`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
