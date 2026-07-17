import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";

const PgSession = connectPgSimple(session);

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set.");
}

// Replit dev preview serves frontend and API on different origins (iframe-based),
// so SameSite=None is required for the session cookie to be sent cross-origin.
// Secure=true is safe here because Replit always serves over HTTPS — both in the
// dev workspace preview and in production deployments.
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
    // Must be true for SameSite=None to work, and Replit is always HTTPS.
    secure: true,
    // Required for cross-origin cookies in Replit's iframe-based dev preview
    // and for Replit Deployments where frontend and API have different origins.
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  },
});
