import { sqliteTable, text, integer, primaryKey, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const rooms = sqliteTable('rooms', {
 code: text('code').primaryKey(), title: text('title').notNull(), pack: text('pack').notNull(), host: text('host').notNull(), created: integer('created').notNull(), started: integer('started'), practice: integer('practice').notNull(), sponsored: integer('sponsored').notNull().default(0), contract: text('contract'), fundTx: text('fund_tx'), settleTx: text('settle_tx'), pool: text('pool'), sponsor: text('sponsor')
});
export const players = sqliteTable('players', {
 id: text('id').primaryKey(), room: text('room').notNull(), session: text('session').notNull(), name: text('name').notNull(), wallet: text('wallet'), joined: integer('joined').notNull()
}, t => [uniqueIndex('player_session').on(t.room,t.session), uniqueIndex('player_wallet').on(t.room,t.wallet)]);
export const answers = sqliteTable('answers', {
 player: text('player').notNull(), room: text('room').notNull(), question: integer('question').notNull(), choice: integer('choice').notNull(), correct: integer('correct').notNull(), points: integer('points').notNull(), at: integer('at').notNull()
}, t => [primaryKey({columns:[t.player,t.question]})]);
