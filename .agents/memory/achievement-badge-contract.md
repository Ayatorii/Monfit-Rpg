---
name: AchievementBadge contract
description: Deployed ERC-721 achievement badge contract on Monad testnet — address, badge types, verification, and integration details.
---

# AchievementBadge Contract

**Address:** `0x2064327d8Cd029C8403b3F049C9302dC8506f93d`
**Chain:** Monad Testnet (chainId 10143)
**Deployer/Owner/Minter wallet:** `0xD9C92AfA8A4317039E21a90eCCBa7B8996574352`
**Verification:** Verified on Sourcify via `https://sourcify-api-monad.blockvision.org/verify` (standard JSON payload with metadata.json + source)

## Badge Types (uint8)
- `0` = WalletConnector — eligible after any SIWE sign-in; no counter needed
- `1` = TaskMaster — requires `players.quests_completed >= 100`
- `2` = GreatWarrior — requires `COUNT(matches) >= 100` for the wallet

## ABI (key functions)
```
function mintBadge(address player, uint8 badgeType) external onlyOwner returns (uint256 tokenId)
function hasMinted(address player, uint8 badgeType) view returns (bool)
function badgeTypeOf(uint256 tokenId) view returns (uint8)
```

## Env vars that reference this address
- `ACHIEVEMENT_BADGE_ADDRESS` — read by API server badge routes (shared env)

## Source location
`contracts/season-trophy/src/AchievementBadge.sol` — same Foundry project as SeasonTrophy

## Backend routes
- `GET /api/badges/status` — returns progress, eligibility, minted (on-chain check via hasMinted)
- `POST /api/badges/mint` — re-verifies eligibility, calls mintBadge on-chain, returns txHash

## Quest tracking
`players.quests_completed` counter incremented via `POST /api/players/me/quest-complete`
Called fire-and-forget from `train.tsx toggleQuest` on quest completion (not on un-check).

**Why:** Second contract deployed after SeasonTrophy; do not redeploy unless explicitly asked.

**How to apply:** When adding badge features, use the ABI above and the address. The hasMinted check is authoritative — no DB mirror.
