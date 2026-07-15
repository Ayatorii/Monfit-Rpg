import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";

const PgSession = connectPgSimple(session);

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set.");
}

/**
 * Cross-origin cookie config: the Replit preview iframe serves the frontend
 * and this API from different origins, so the session cookie must be
 * SameSite=None + Secure, and every client fetch must send
 * `credentials: "include"` (see lib/api-client-react/src/custom-fetch.ts).
 */
export const sessionMiddleware = session({
  store: new PgSession({
    pool,
    tableName: "session",
    // The `session` table is created by a Drizzle schema/push (see
    // @workspace/db's `sessions` schema), not by connect-pg-simple itself.
    createTableIfMissing: false,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "monfit.sid",
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  },
});
