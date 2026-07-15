import { pgTable, varchar, json, timestamp, index } from "drizzle-orm/pg-core";

/**
 * Backing store for express-session via connect-pg-simple.
 * Column names/shapes (sid/sess/expire) match connect-pg-simple's defaults —
 * do not rename them without updating the session store config in api-server.
 */
export const sessionsTable = pgTable(
  "session",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire", { withTimezone: false, precision: 6 }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export type SessionRow = typeof sessionsTable.$inferSelect;
