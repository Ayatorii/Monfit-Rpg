import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";

const PgSession = connectPgSimple(session);

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set.");
}

// On Vercel the frontend and API share the same origin, so SameSite=Lax is
// correct and simpler.  On Replit the preview iframe is cross-origin, so
// SameSite=None (+ Secure) is required.  In local dev (no VERCEL flag, not
// production) we drop Secure so plain HTTP works.
const isVercel = Boolean(process.env.VERCEL);
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
    // Secure only in production; allows local HTTP dev without extra config.
    secure: isProduction,
    // Vercel: same-origin → lax.  Replit / other cross-origin envs → none.
    sameSite: isVercel ? "lax" : "none",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  },
});
