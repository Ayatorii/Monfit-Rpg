# MONFIT RPG

Fitness-meets-crypto RPG on Monad Testnet. Train, battle, loot gear, and earn on-chain achievements.

## Stack

- **Frontend**: React + Vite + Tailwind CSS + wagmi/RainbowKit
- **Backend**: Express 5 API (TypeScript, esbuild)
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: Sign-In With Ethereum (SIWE)
- **Chain**: Monad Testnet (chainId 10143)

## Smart Contracts (Monad Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| SeasonTrophy | `0xbe28f09078c9d55432cddefb3ebd0d18f8b1cee6` | ERC-721 trophies for top-ranked season players |
| AchievementBadge | `0x2064327d8Cd029C8403b3F049C9302dC8506f93d` | ERC-721 achievement badges (WalletConnector, TaskMaster, GreatWarrior) |

Both contracts are owned by the deployer wallet (`0xD9C92AfA8A4317039E21a90eCCBa7B8996574352`) which also acts as the backend minter.

Explorer: [https://testnet.monadexplorer.com](https://testnet.monadexplorer.com)

## Badge Definitions

| Badge | Type | Requirement |
|-------|------|-------------|
| Wallet Connector | 0 | Connect wallet and sign in |
| Task Master | 1 | Complete 100 daily training quests |
| Great Warrior | 2 | Fight 100 arena battles |

## Development

```bash
# Install dependencies
pnpm install

# Start all services (managed by Replit workflows)
# API Server: port 8080
# Frontend:   port 26223

# Push DB schema changes
pnpm --filter @workspace/db run push

# Deploy contracts (from contracts/season-trophy/)
forge script script/DeployAchievementBadge.s.sol:DeployAchievementBadge \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast
```

## Environment Variables

| Key | Description |
|-----|-------------|
| `DATABASE_URL` | PostgreSQL connection string (managed by Replit) |
| `SESSION_SECRET` | Express session signing secret |
| `DEPLOYER_PRIVATE_KEY` | Wallet private key for on-chain minting |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID |
| `SEASON_TROPHY_ADDRESS` | SeasonTrophy contract address |
| `ACHIEVEMENT_BADGE_ADDRESS` | AchievementBadge contract address |
| `VITE_TROPHY_CONTRACT_ADDRESS` | SeasonTrophy address for frontend |
| `CURRENT_SEASON` | Current season number (default: 1) |
| `MINT_ADMIN_SECRET` | Shared secret for admin trophy minting endpoint |
