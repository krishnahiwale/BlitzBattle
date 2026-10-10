CREATE TABLE `answers` (
	`player` text NOT NULL,
	`room` text NOT NULL,
	`question` integer NOT NULL,
	`choice` integer NOT NULL,
	`correct` integer NOT NULL,
	`points` integer NOT NULL,
	`at` integer NOT NULL,
	PRIMARY KEY(`player`, `question`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`session` text NOT NULL,
	`name` text NOT NULL,
	`wallet` text,
	`joined` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `player_session` ON `players` (`room`,`session`);--> statement-breakpoint
CREATE UNIQUE INDEX `player_wallet` ON `players` (`room`,`wallet`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`pack` text NOT NULL,
	`host` text NOT NULL,
	`created` integer NOT NULL,
	`started` integer,
	`practice` integer NOT NULL,
	`sponsored` integer DEFAULT 0 NOT NULL,
	`contract` text,
	`fund_tx` text,
	`settle_tx` text,
	`pool` text,
	`sponsor` text
);
