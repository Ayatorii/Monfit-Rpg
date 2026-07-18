---
name: SeasonTrophy contract
description: Deployed ERC-721 trophy contract on Monad testnet — address, verification, and integration details.
---

# SeasonTrophy Contract

**Current address:** `0x2ec42214a3947abf68ac932c4047c652351317c3`
**Chain:** Monad Testnet (chainId 10143)
**Owner:** Safe multisig `0x1C49DB866c9E942f55FdE7C0Fc9E1F83E33aAeCb` (2-of-3)
**Verification:** Verified on MonadVision + Monadscan via https://agents.devnads.com/v1/verify

Previous address (pre-Safe): `0xbe28f09078c9d55432cddefb3ebd0d18f8b1cee6` (owned by EOA deployer)

## Env vars that reference this address
- `SEASON_TROPHY_ADDRESS` — read by API server mint route (shared env)
- `VITE_TROPHY_CONTRACT_ADDRESS` — read by frontend MyTrophies component (shared env)
- `CURRENT_SEASON` — set to `1` (shared env)
- `MINT_ADMIN_SECRET` — shared secret for POST /api/admin/mint-season-trophies (Replit Secret)

## Source location
`contracts/src/SeasonTrophy.sol` — Foundry project root at `contracts/`

**Why:** Contract redeployed via Safe multisig for proper ownership. Do not redeploy unless explicitly asked.

**How to apply:** When adding new trophy-related features, read the ABI from `contracts/src/SeasonTrophy.sol` and use the current address above.
