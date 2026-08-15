CREATE TABLE IF NOT EXISTS `collection_papers` (
	`collection_id` text NOT NULL,
	`arxiv_id` text NOT NULL,
	`added_at` integer NOT NULL,
	PRIMARY KEY(`collection_id`, `arxiv_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`share_token` text,
	`description` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `collections_user_idx` ON `collections` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `collections_user_slug_idx` ON `collections` (`user_id`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `collections_share_token_idx` ON `collections` (`share_token`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `library_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`arxiv_id` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `library_user_paper_idx` ON `library_items` (`user_id`,`arxiv_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `library_user_idx` ON `library_items` (`user_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `paper_cache` (
	`arxiv_id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`fetched_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`interests` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
