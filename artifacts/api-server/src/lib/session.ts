import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";

const PgSession = connectPgSimple(session);

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set.");
}

// On Replit the preview iframe is cross-origin, so SameSite=None is required.
// SameSite=None *must* be paired with Secure=true in all modern browsers —
// the cookie is simply dropped otherwise. Replit's dev preview is served over
// HTTPS, so Secure=true is safe in every environment here.
export const sessionMiddleware = session({
  store: new PgSession({
    pool,
    tableName: "session",
    createTableIfMissing: false,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "monfit.sid",
  cookie: {
    httpOnly: true,
    secure: true,       // required for SameSite=None — Replit is always HTTPS
    sameSite: "none",   // required for cross-origin iframe on Replit dev
    maxAge: 1000 * 60 * 60 * 24 * 30,
  },
});
