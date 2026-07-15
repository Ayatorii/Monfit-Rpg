import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const playerItemsTable = pgTable("player_items", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  itemId: text("item_id").notNull(),
  slot: text("slot").notNull(),
  equipped: boolean("equipped").notNull().default(false),
  obtainedAt: timestamp("obtained_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPlayerItemSchema = createInsertSchema(playerItemsTable).omit({
  id: true,
  obtainedAt: true,
});
export type InsertPlayerItem = z.infer<typeof insertPlayerItemSchema>;
export type PlayerItemRow = typeof playerItemsTable.$inferSelect;
