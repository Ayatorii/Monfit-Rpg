# MONFIT RPG

A fitness-meets-crypto RPG on Monad Testnet. Players train, fight arena battles, and earn XP and gold — progress stored in PostgreSQL keyed by wallet address.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vite + React 19, Tailwind CSS v4, shadcn/ui, wouter, RainbowKit, wagmi, viem
- API: Express 5, pino logging
- DB: PostgreSQL + Drizzle ORM (node-postgres pool)
- Auth: SIWE (Sign-In With Ethereum) — wallet address is the primary key
- Build: esbuild (API), Vite (frontend)

## Getting started after import

1. The Replit-managed PostgreSQL database is provisioned automatically — no setup needed.
2. Ensure the following secrets are set in **Tools → Secrets**:
   - `SESSION_SECRET` — any random string (e.g. `openssl rand -hex 32`)
   - `VITE_WALLETCONNECT_PROJECT_ID` — from [cloud.walletconnect.com](https://cloud.walletconnect.com)
3. Click **Run**. The "Project" workflow starts both services in parallel:
   - `API Server` — Express backend on port 8080
   - `artifacts/monfit-rpg: web` — Vite frontend on port 26223 (proxies /api → 8080)
4. The Preview pane will show the MONFIT RPG loading screen. Connect a wallet to play.

Optional secrets (leave unset to disable those features):
- `DEPLOYER_PRIVATE_KEY` — Monad wallet private key for on-chain trophy minting
- `VITE_TROPHY_CONTRACT_ADDRESS` / `SEASON_TROPHY_ADDRESS` — trophy NFT contracts
- `MINT_ADMIN_SECRET` — shared secret for the admin mint endpoint
- `CURRENT_SEASON` — season identifier string

## Run & Operate

Two artifact-managed workflows handle the app. Use the Run button or the workflow panel:

| Workflow | What it runs | Port |
|---|---|---|
| `artifacts/api-server: API Server` | Express API (build → start) | 8080 |
| `artifacts/monfit-rpg: web` | Vite dev server | 26223 → preview at / |

Do **not** create manual workflows for these services — the artifact workflows inject `PORT`, `BASE_PATH`, and proxy routing automatically.

Useful commands:
```bash
pnpm run typecheck                        # typecheck all packages
pnpm --filter @workspace/db run push     # push DB schema changes (dev only)
pnpm --filter @workspace/api-spec run codegen  # regenerate API hooks from openapi.yaml
```

## Where things live

| Path | Contents |
|---|---|
| `artifacts/monfit-rpg/src/` | React frontend — pages, components, game/auth context |
| `artifacts/monfit-rpg/src/App.tsx` | wouter router with all game routes |
| `artifacts/api-server/src/routes/` | Express route handlers (auth, arena, players, leaderboard) |
| `lib/db/src/schema/` | Drizzle schema — players, matches, player_items, sessions |
| `lib/api-spec/openapi.yaml` | OpenAPI contract (source of truth for API shape) |
| `lib/api-client-react/` | Generated React Query hooks consumed by the frontend |
| `attached_assets/` | Logo and brand images |

## Architecture notes

- **Vite + React, not Next.js** — Replit runs a persistent server; client-side routing via wouter
- **Plain `pg` pool** in `lib/db` — long-running server benefits from persistent TCP connections
- **Wallet-keyed players** — no traditional auth; wallet address is the primary key for all game state
- **Session cookies** — `SameSite=None; Secure` with `trust proxy` enabled for Replit's cross-origin iframe proxy

## User preferences

<!-- Add project-specific agent preferences here -->
