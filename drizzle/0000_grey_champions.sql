CREATE TABLE `answers` (
	`id` text PRIMARY KEY NOT NULL,
	`room_code` text NOT NULL,
	`player_id` text NOT NULL,
	`question` integer NOT NULL,
	`choice` integer NOT NULL,
	`earned` integer NOT NULL,
	`submitted_at` integer NOT NULL,
	FOREIGN KEY (`room_code`) REFERENCES `rooms`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `answers_once` ON `answers` (`room_code`,`player_id`,`question`);--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`room_code` text NOT NULL,
	`name` text NOT NULL,
	`token_hash` text NOT NULL,
	`joined_at` integer NOT NULL,
	`bot` integer DEFAULT 0 NOT NULL,
	`wallet` text,
	`challenge` text,
	`challenge_expires` integer,
	`claim_tx` text,
	FOREIGN KEY (`room_code`) REFERENCES `rooms`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `players_room_name` ON `players` (`room_code`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `players_room_wallet` ON `players` (`room_code`,`wallet`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`host_hash` text NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`sponsor` text NOT NULL,
	`pack` text NOT NULL,
	`mode` text NOT NULL,
	`seconds` integer NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`questions` text NOT NULL,
	`created_at` integer NOT NULL,
	`started_at` integer,
	`pool_wei` text DEFAULT '0' NOT NULL,
	`escrow` text,
	`funding_tx` text,
	`finalized_tx` text,
	`finalize_before` integer,
	`claim_until` integer,
	`refund_tx` text
);
