import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * One row per completed arena match.
 * `result` is from the player's perspective: "win", "loss", or "draw".
 */
export const matchesTable = pgTable("matches", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  opponentId: text("opponent_id").notNull(),
  opponentName: text("opponent_name").notNull(),
  result: text("result").notNull(), // "win" | "loss" | "draw"
  xpEarned: integer("xp_earned").notNull().default(0),
  goldEarned: integer("gold_earned").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matchesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matchesTable.$inferSelect;
