import { pgTable, varchar, json, timestamp, index } from "drizzle-orm/pg-core";

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
