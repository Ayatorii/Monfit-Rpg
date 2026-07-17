import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";

const PgSession = connectPgSimple(session);

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set.");
}

// In both dev and production the frontend and API share the same origin
// (Replit's path-based proxy routes /api/* to Express, everything else to
// the Vite dev server or the built SPA).  Same-site means SameSite=Lax is
// sufficient — no need for SameSite=None.
//
// The Secure flag must match what the browser actually sees:
//   dev  — Express is reached over plain HTTP (localhost), even though the
//           browser accesses it via Replit's HTTPS proxy.  Setting secure:true
//           here makes express-session silently skip the Set-Cookie header
//           (because req.secure is false on the loopback interface), so the
//           client never receives a session cookie.
//   prod — Replit Autoscale terminates TLS and forwards to Express; the
//           browser is on HTTPS, so the Secure flag is correct and required.
const isProd = process.env.NODE_ENV === "production";

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
    secure: isProd,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  },
});
