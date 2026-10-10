import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
export const rooms = sqliteTable("rooms", {
 code: text("code").primaryKey(), hostHash: text("host_hash").notNull(), ownerId: text("owner_id").notNull(), title: text("title").notNull(), sponsor: text("sponsor").notNull(), pack: text("pack").notNull(), mode: text("mode").notNull(), seconds: integer("seconds").notNull(), status: text("status").notNull().default("waiting"), questions: text("questions").notNull(), createdAt: integer("created_at").notNull(), startedAt: integer("started_at"), poolWei: text("pool_wei").notNull().default("0"), escrow: text("escrow"), fundingTx: text("funding_tx"), finalizedTx: text("finalized_tx"), finalizeBefore: integer("finalize_before"), claimUntil: integer("claim_until"), refundTx: text("refund_tx"),
});
export const players = sqliteTable("players", {
 id: text("id").primaryKey(), roomCode: text("room_code").notNull().references(() => rooms.code), name: text("name").notNull(), tokenHash: text("token_hash").notNull(), joinedAt: integer("joined_at").notNull(), bot: integer("bot").notNull().default(0), wallet: text("wallet"), challenge: text("challenge"), challengeExpires: integer("challenge_expires"), claimTx: text("claim_tx"),
}, t => [uniqueIndex("players_room_name").on(t.roomCode,t.name),uniqueIndex("players_room_wallet").on(t.roomCode,t.wallet)]);
export const answers = sqliteTable("answers", {
 id: text("id").primaryKey(), roomCode: text("room_code").notNull().references(() => rooms.code), playerId: text("player_id").notNull().references(() => players.id), question: integer("question").notNull(), choice: integer("choice").notNull(), earned: integer("earned").notNull(), submittedAt: integer("submitted_at").notNull(),
}, t => [uniqueIndex("answers_once").on(t.roomCode,t.playerId,t.question)]);
