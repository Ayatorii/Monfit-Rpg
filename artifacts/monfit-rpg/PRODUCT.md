# PRODUCT.md — MONFIT RPG

## Product
A fitness-meets-crypto RPG on Monad Testnet. Players train toward a goal, equip loot earned from the Shop, and fight Arena battles against NPC opponents. Progress (XP, gold, inventory, wins/losses) is keyed to a wallet address — no traditional account, just connect and play.

## Register
product

## Platform
web

## Target users
Crypto-native fitness enthusiasts who want a light RPG loop woven into their training habit. Primarily mobile-browser users (small viewport first), but the app is fully responsive to desktop.

## Purpose
Make hitting the gym feel like leveling up a character. Daily quests and arena fights provide game-loop motivation; on-chain trophies give seasonal bragging rights.

## Brand personality
Dark, terse, kinetic. Feels like a fighting game UI — confident type, minimal decoration, punchy color use. Never cutesy. Never corporate. Respect the player's time.

## Anti-references
- Bloated health-app dashboards (lots of charts, lots of color, feels clinical)
- Web3 hype aesthetics (gradient blobs, neon everywhere, crypto-bro energy)
- Generic dark-mode SaaS (neutral grays, conservative spacing, boring)

## Design principles
1. **Economy of chrome** — every element earns its pixel. No card-inside-card, no decorative borders for their own sake.
2. **Rarity is sacred** — gold, cyan XP, rarity colors (common/rare/epic) carry meaning; don't dilute them for decoration.
3. **Motion serves state** — transitions signal what changed (view swap, quest complete, battle reveal). No ambient animations for atmosphere alone.
4. **Accessible by default** — ARIA roles, focus rings, reduced-motion respect, touch-safe tap targets (min 44px), sufficient contrast.
5. **Type hierarchy before color** — weight and scale carry headings; color is accent, not structure.

## Color palette
- Background: `hsl(258 59% 8%)` — near-black deep purple (`#0E091C`)
- Foreground: `hsl(0 0% 100%)` — white
- Primary: `hsl(249 100% 66%)` — violet (`#6E54FF`)
- Primary text: `hsl(249 85% 75%)` — lighter violet for readable text-on-surface
- Muted foreground: `hsl(251 91% 92%)` — `#DDD7FE`, lavender for secondary text
- Gold: `hsl(43 96% 56%)` — coin/reward accent
- XP: `hsl(189 94% 70%)` — cyan, XP and progress accent
- Rarity common: `hsl(258 8% 56%)` — muted stone
- Rarity rare: `hsl(199 89% 60%)` — cyan/blue
- Rarity epic: `hsl(38 92% 58%)` — gold/amber

## Typography
- Display / headings: **Barlow Condensed** (condensed grotesque, all-caps or mixed case, bold–black weight)
- Body: **Onest** (humanist sans, comfortable reading weight)
- Mono: Menlo (stat values, addresses, tabular numerals)

## Key routes
- `/` — Train: pick a goal, see programs, complete daily quests for XP/gold
- `/character` — Equip loot across 6 body slots; view level/XP/stats
- `/arena` — Challenge NPC opponents; round-by-round battle log
- `/shop` — Buy chest loot with gold
- `/leaderboard` — Global Arena ranking by score; on-chain season trophies
