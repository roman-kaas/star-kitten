import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const shared = {
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at'),
};

export const users = sqliteTable('users', {
  id: integer().primaryKey().unique().notNull(),
  discordID: text('discord_id').unique().notNull(),
  mainCharacter: integer('main_character'),
  ...shared,
}, (table) => [
  index('idx_discord_id').on(table.discordID),
  index('idx_main_character').on(table.mainCharacter),
]);

export const usersRelations = relations(users, ({ one, many }) => ({
  characters: many(characters),
  main: one(characters, {
    fields: [users.mainCharacter],
    references: [characters.id]
  }),
}));


export const characters = sqliteTable('characters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eveID: integer('eve_id').notNull(),
  userID: integer('user_id').notNull(),
  name: text().notNull(),
  accessToken: text('access_token').notNull(),
  expiresAt: integer('expires_at').notNull(),
  refreshToken: text('refresh_token').notNull(),
  ...shared,
}, (table) => [
  index('idx_user_id').on(table.userID),
  index('idx_eve_id').on(table.eveID),
]);

export const charactersRelations = relations(characters, ({ one }) => ({
  user: one(users, {
    fields: [characters.userID],
    references: [users.id],
  }),
}));


export const resumeCommands = sqliteTable('resumecommands', {
  id: text().primaryKey(),
  command: text().notNull(),
  params: text().notNull(),
  context: text().notNull(),
  ...shared,
});



