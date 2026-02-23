ALTER TABLE `projects` ADD `slug` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);