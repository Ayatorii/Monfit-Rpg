# MONFIT RPG

A fitness-meets-crypto RPG on Monad Testnet. Players train, fight arena battles, and earn XP and gold — with progress stored on-chain. Built with Vite + React (frontend), Express (API), PostgreSQL + Drizzle ORM (database), and RainbowKit / wagmi for wallet integration.

## Run & Operate

- Workflows are managed by Replit — use the workflow panel or `WorkflowsRestart` to start/stop services.
- `pnpm --filter @workspace/api-server run dev` — run the API server locally (port 8080)
- `pnpm --filter @workspace/monfit-rpg run dev` — run the frontend locally (port 26223)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env vars: `DATABASE_URL`, `SESSION_SECRET`, `VITE_WALLETCONNECT_PROJECT_ID`, `DEPLOYER_PRIVATE_KEY`
- Optional env vars: `VITE_TROPHY_CONTRACT_ADDRESS`, `SEASON_TROPHY_ADDRESS`, `MINT_ADMIN_SECRET`, `CURRENT_SEASON`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vite + React 19, Tailwind CSS v4, shadcn/ui, wouter, RainbowKit, wagmi, viem
- API: Express 5, pino logging
- DB: PostgreSQL + Drizzle ORM (node-postgres pool)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild

## Where things live

- `artifacts/monfit-rpg/src/` — React frontend (pages, components, game/auth context)
- `artifacts/monfit-rpg/src/App.tsx` — router (wouter) with all game routes
- `artifacts/api-server/src/routes/` — Express route handlers (auth, arena, players, leaderboard, shop, admin)
- `lib/db/src/schema/` — Drizzle schema (players, matches, player_items, sessions)
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for API shape)
- `lib/api-client-react/` — generated React Query hooks consumed by the frontend
- `attached_assets/` — logo and brand images

## Architecture decisions

- Vite + React (not Next.js) — Replit runs a persistent server, not serverless; client-side routing via wouter
- Plain `pg` pool in `lib/db` — long-running server benefits from persistent TCP connections over Neon WebSocket transport
- Wallet-keyed players — no traditional auth; wallet address is the primary key for all game state
- Guest mode — players can play with local state before connecting a wallet (see `auth-context.tsx`)

## Product

MONFIT RPG is a gamified fitness tracker on Monad Testnet. Players connect a wallet, train to earn XP/gold, battle in the arena, equip items from the shop, and compete on the leaderboard. Season trophy NFTs are minted on-chain for top performers.

## Gotchas

- `VITE_WALLETCONNECT_PROJECT_ID` must be set or the wagmi config throws on startup
- WalletConnect will log a 403 until the deployed domain is registered at cloud.reown.com
- Admin mint endpoint (`/api/admin/mint`) requires `MINT_ADMIN_SECRET` + `SEASON_TROPHY_ADDRESS`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
