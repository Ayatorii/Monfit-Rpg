---
name: Session cookie config
description: Why MONFIT RPG uses SameSite=None; Secure=true on the session cookie even in dev.
---

The rule: `sameSite: "none"` and `secure: true` — always, not just in production.

**Why:** Replit's dev preview renders the frontend inside an iframe served from a different subdomain than the API server. This makes every fetch cross-origin in the browser's view. `SameSite=Lax` (the default) silently drops the session cookie on cross-origin requests, causing the nonce/verify flow to see no session and return 401.

**How to apply:** In `artifacts/api-server/src/lib/session.ts`, the cookie config must always have `sameSite: "none"` and `secure: true`. Do not gate `secure` on `NODE_ENV === "production"` — Replit is always HTTPS even in the dev workspace preview. The custom fetch in `lib/api-client-react/src/custom-fetch.ts` must always pass `credentials: "include"`.
