DROP TABLE IF EXISTS `analyses`;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `analyses` (
	`user_id` text NOT NULL,
	`arxiv_id` text NOT NULL,
	`model` text NOT NULL,
	`briefing` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `arxiv_id`, `model`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `analyses_user_idx` ON `analyses` (`user_id`);
