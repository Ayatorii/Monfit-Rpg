---
name: Session cookie config
description: Why MONFIT RPG uses SameSite=None + secure:"auto" + trust proxy:true for the session cookie.
---

The rule: `sameSite: "none"`, `secure: "auto"`, and `app.set("trust proxy", true)`.

**Why SameSite=None (not Lax):**
The Replit dev workspace embeds the app preview in an iframe at `*.replit.dev` inside `replit.com`. Chrome's SameSite enforcement compares the request URL's site against the *top-level browsing context's* eTLD+1. Because the top frame is `replit.com` and the API is on `replit.dev`, POST requests (like `/api/auth/verify`) are treated as cross-site, and `SameSite=Lax` drops the session cookie silently. `SameSite=None` is required to allow the cookie on cross-site POST requests.

**Why `secure: "auto"` (not `true`):**
`SameSite=None` requires the `Secure` attribute, and express-session with `secure: true` only emits `Set-Cookie` when `req.secure` is true. Express's `req.secure` is derived from `X-Forwarded-Proto` (when `trust proxy` is set). With `secure: "auto"`, express-session *always* emits `Set-Cookie` (no silent skipping), and adds the `Secure` attribute only when `req.secure` is true. This means:
- Browser via Replit HTTPS proxy → `X-Forwarded-Proto: https` → `req.secure=true` → `Secure` flag added → `SameSite=None; Secure` is valid → works ✓
- `curl` via HTTP localhost → no `X-Forwarded-Proto` → `req.secure=false` → no `Secure` flag → cookie still set, browser treats `SameSite=None` without `Secure` as `Lax` → server-side testing works ✓

**Why `trust proxy: true` (not `1`):**
Replit may use multiple internal proxy hops before the request reaches Express. `trust proxy: 1` only trusts the outermost hop. `trust proxy: true` trusts any `X-Forwarded-*` header, ensuring `req.secure` (and `req.ip`) are always correct regardless of proxy topology.

**How to apply:**
- `artifacts/api-server/src/app.ts`: `app.set("trust proxy", true)` (not `1`)
- `artifacts/api-server/src/lib/session.ts`: `cookie: { httpOnly: true, secure: "auto", sameSite: "none", maxAge: ... }`
- Cast `"auto"` to `boolean` for TypeScript: `secure: "auto" as unknown as boolean`
- Do NOT change `SameSite` to `lax` or `secure` to `true`/`false` — either will break sign-in in the Replit dev preview.
