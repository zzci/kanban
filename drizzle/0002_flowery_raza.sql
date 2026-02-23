CREATE TABLE `projects` (
	`name` text NOT NULL,
	`description` text,
	`directory` text,
	`repository_url` text,
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL
);
