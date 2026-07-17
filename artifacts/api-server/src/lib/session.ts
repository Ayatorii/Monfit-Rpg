import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";

const PgSession = connectPgSimple(session);

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set.");
}

// SameSite=None is required because the Replit dev workspace embeds the app
// preview in an iframe at *.replit.dev inside replit.com.  Chrome treats any
// fetch from a page whose top-level ancestor is on a different eTLD+1 as
// cross-site, so SameSite=Lax silently drops the session cookie on POST
// requests (e.g. /api/auth/verify) even though the iframe and API share the
// same *.replit.dev domain.
//
// SameSite=None requires the Secure attribute to be valid in browsers.  We
// use secure:"auto" (an express-session built-in) so that:
//   • the Set-Cookie header is ALWAYS emitted (unlike secure:true, which
//     silently skips the header when req.secure is false),
//   • the Secure attribute is added only when the connection is actually
//     HTTPS (req.secure = true, set correctly because app.ts uses
//     trust proxy: true to honour Replit's X-Forwarded-Proto: https header).
//
// Net result:
//   Browser via Replit HTTPS proxy → req.secure=true → Secure + SameSite=None → works ✓
//   curl on localhost (HTTP)        → req.secure=false → no Secure flag → SameSite=None
//     treated as Lax by browsers but cookie is still set for server-side testing ✓

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
    // "auto" → always emits Set-Cookie; adds Secure attribute only when
    // req.secure is true (i.e. when behind the Replit HTTPS proxy).
    secure: "auto" as unknown as boolean,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  },
});
