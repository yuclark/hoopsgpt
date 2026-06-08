import { pgTable, serial, varchar, integer, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Players Table
export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  position: varchar('position', { length: 50 }),
  age: integer('age'),
  currentTeam: varchar('current_team', { length: 100 }),
});

// Player Seasons Table
export const playerSeasons = pgTable('player_seasons', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id')
    .notNull()
    .references(() => players.id, { onDelete: 'cascade' }),
  seasonYear: integer('season_year').notNull(),
  gamesPlayed: integer('games_played'),
  minutesPerGame: real('minutes_per_game'),
  pointsPerGame: real('points_per_game'),
  assistsPerGame: real('assists_per_game'),
  reboundsPerGame: real('rebounds_per_game'),
});

// Advanced Stats Table
export const advancedStats = pgTable('advanced_stats', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id')
    .notNull()
    .references(() => players.id, { onDelete: 'cascade' }),
  seasonYear: integer('season_year').notNull(),
  trueShootingPercentage: real('true_shooting_percentage'),
  usagePercentage: real('usage_percentage'),
  playerEfficiencyRating: real('player_efficiency_rating'),
  winShares: real('win_shares'),
});

// Relations
export const playersRelations = relations(players, ({ many }) => ({
  seasons: many(playerSeasons),
  advancedStats: many(advancedStats),
}));

export const playerSeasonsRelations = relations(playerSeasons, ({ one }) => ({
  player: one(players, {
    fields: [playerSeasons.playerId],
    references: [players.id],
  }),
}));

export const advancedStatsRelations = relations(advancedStats, ({ one }) => ({
  player: one(players, {
    fields: [advancedStats.playerId],
    references: [players.id],
  }),
}));
