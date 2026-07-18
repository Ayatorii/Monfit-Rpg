---
name: SeasonTrophy contract
description: Deployed ERC-721 trophy contract on Monad testnet — address, verification, and integration details.
---

# SeasonTrophy Contract

**Address:** `0xbe28f09078c9d55432cddefb3ebd0d18f8b1cee6`
**Chain:** Monad Testnet (chainId 10143)
**Deployer/Owner/Minter wallet:** `0xD9C92AfA8A4317039E21a90eCCBa7B8996574352`
**Verification:** "perfect" status on Sourcify via `https://sourcify-api-monad.blockvision.org` (covers MonadVision, Socialscan, Monadscan)

## Env vars that reference this address
- `SEASON_TROPHY_ADDRESS` — read by API server mint route (shared env)
- `VITE_TROPHY_CONTRACT_ADDRESS` — read by frontend MyTrophies component (shared env)
- `CURRENT_SEASON` — set to `1` (shared env)
- `MINT_ADMIN_SECRET` — shared secret for POST /api/admin/mint-season-trophies (Replit Secret)

## Source location
`contracts/season-trophy/` — full Foundry project (src, script, lib/openzeppelin, broadcast)

**Why:** Contract was deployed in a prior session; do not redeploy unless explicitly asked. The broadcast artifact at `contracts/season-trophy/broadcast/Deploy.s.sol/10143/run-latest.json` is the source of truth for the address.

**How to apply:** When adding new trophy-related features, read the ABI from `contracts/season-trophy/src/SeasonTrophy.sol` and use the address above.
