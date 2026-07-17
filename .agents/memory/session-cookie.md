---
name: Session cookie config
description: Why MONFIT RPG uses SameSite=Lax + Secure only in production for the session cookie.
---

The rule: `sameSite: "lax"`, `secure: isProd` (i.e. `process.env.NODE_ENV === "production"`).

**Why `secure: false` in dev:** The API server runs on plain HTTP (localhost:8080). Even though Replit's HTTPS proxy terminates TLS before forwarding to Express, `req.secure` is false on the loopback interface. Express-session with `secure: true` silently skips the `Set-Cookie` header when `req.secure` is false — the client never receives the session cookie, so every verify request creates a fresh empty session. Symptom: `GET /api/auth/nonce` takes ~1.5s (DB write succeeds), but `POST /api/auth/verify` returns 401 in ~7ms (no DB read — brand new session).

**Why `sameSite: "lax"` not `"none"`:** In both dev and production, the frontend and API share the same origin. Replit's path-based proxy routes `/api/*` to the Express server and everything else to the frontend (Vite dev server in dev; Express static files in prod). From the browser's perspective, they are the same-site, so `SameSite=Lax` is sufficient and correct. `SameSite=None` requires `Secure=true` — setting both in dev re-introduces the dropped-cookie bug.

**How to apply:** In `artifacts/api-server/src/lib/session.ts`, the cookie config is:
```js
const isProd = process.env.NODE_ENV === "production";
cookie: { httpOnly: true, secure: isProd, sameSite: "lax", maxAge: ... }
```
Do not change this to `secure: true` always — it will break dev sign-in.
