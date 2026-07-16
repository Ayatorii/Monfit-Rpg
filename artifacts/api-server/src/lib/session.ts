import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";

const PgSession = connectPgSimple(session);

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set.");
}

// Frontend and API are served through the same reverse proxy (same origin)
// on both Replit and Vercel, so SameSite=Lax is correct everywhere.
// Secure is only required in production (HTTPS); dev runs over plain HTTP.
const isProduction = process.env.NODE_ENV === "production";

export const sessionMiddleware = session({
  store: new PgSession({
    pool,
    tableName: "session",
    // The `session` table is created by a Drizzle migration (see
    // @workspace/db's sessions schema), not by connect-pg-simple itself.
    createTableIfMissing: false,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "monfit.sid",
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  },
});
