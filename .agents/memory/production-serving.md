---
name: Production single-process architecture
description: How MONFIT RPG serves both API and frontend from a single Express process in Replit Deployments.
---

The rule: in production, Express serves the built Vite SPA as static files in addition to /api routes. In dev, the Vite dev server runs as a separate workflow with HMR.

**Why:** Replit Deployments (Autoscale) expect a single process binding to `0.0.0.0:PORT`. Running two separate services in production requires two deployments; single-process is simpler and the recommended Replit pattern.

**How to apply:**
- `artifacts/api-server/src/app.ts` — `if (NODE_ENV === "production")` block uses `express.static` on `artifacts/monfit-rpg/dist/public` and a `*` SPA fallback for wouter client-side routing.
- `artifacts/api-server/.replit-artifact/artifact.toml` — production build runs `BASE_PATH=/ pnpm --filter @workspace/monfit-rpg run build` before the API server build. Production run does NOT hardcode PORT (platform provides it).
- The `artifacts/monfit-rpg` artifact still has its own dev workflow (`artifacts/monfit-rpg: web`) for Vite HMR during development. Do not remove it.
