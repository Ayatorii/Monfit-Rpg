import { Router, type IRouter } from "express";
import { createWalletClient, createPublicClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";
import { db, playersTable, matchesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

const BADGE_ABI = parseAbi([
  "function hasMinted(address player, uint8 badgeType) view returns (bool)",
  "function mintBadge(address player, uint8 badgeType) external returns (uint256 tokenId)",
]);

const QUEST_THRESHOLD = 100;
const BATTLE_THRESHOLD = 100;

/** Require an active wallet session on all badge routes. */
router.use((req, res, next): void => {
  if (!req.session.walletAddress) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  next();
});

async function getContractAddress(): Promise<`0x${string}` | null> {
  const addr = process.env.ACHIEVEMENT_BADGE_ADDRESS;
  return addr ? (addr as `0x${string}`) : null;
}

async function checkHasMinted(
  contractAddress: `0x${string}`,
  walletAddress: string,
  badgeType: number,
): Promise<boolean> {
  try {
    const publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http("https://testnet-rpc.monad.xyz"),
    });
    return (await publicClient.readContract({
      address: contractAddress,
      abi: BADGE_ABI,
      functionName: "hasMinted",
      args: [walletAddress as `0x${string}`, badgeType],
    })) as boolean;
  } catch {
    return false;
  }
}

/**
 * GET /api/badges/status
 * Returns progress + eligibility + minted state for all 3 badges.
 */
router.get("/status", async (req, res): Promise<void> => {
  const walletAddress = req.session.walletAddress as string;

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.walletAddress, walletAddress));

  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const [battleRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(matchesTable)
    .where(eq(matchesTable.walletAddress, walletAddress));

  const totalBattles = battleRow?.total ?? 0;
  const questsCompleted = player.questsCompleted;

  const contractAddress = await getContractAddress();

  const [wc, tm, gw] = await Promise.all([
    contractAddress ? checkHasMinted(contractAddress, walletAddress, 0) : false,
    contractAddress ? checkHasMinted(contractAddress, walletAddress, 1) : false,
    contractAddress ? checkHasMinted(contractAddress, walletAddress, 2) : false,
  ]);

  res.json({
    badges: [
      {
        type: 0,
        name: "Wallet Connector",
        eligible: true,
        minted: wc,
        progress: { current: 1, needed: 1 },
      },
      {
        type: 1,
        name: "Task Master",
        eligible: questsCompleted >= QUEST_THRESHOLD,
        minted: tm,
        progress: { current: questsCompleted, needed: QUEST_THRESHOLD },
      },
      {
        type: 2,
        name: "Great Warrior",
        eligible: totalBattles >= BATTLE_THRESHOLD,
        minted: gw,
        progress: { current: totalBattles, needed: BATTLE_THRESHOLD },
      },
    ],
  });
});

/**
 * POST /api/badges/mint
 * Body: { badgeType: 0 | 1 | 2 }
 * Re-verifies eligibility server-side, then calls mintBadge on-chain.
 */
router.post("/mint", async (req, res): Promise<void> => {
  const walletAddress = req.session.walletAddress as string;
  const { badgeType } = req.body as { badgeType?: unknown };

  if (
    typeof badgeType !== "number" ||
    !Number.isInteger(badgeType) ||
    badgeType < 0 ||
    badgeType > 2
  ) {
    res.status(400).json({ error: "badgeType must be 0, 1, or 2" });
    return;
  }

  const contractAddress = await getContractAddress();
  if (!contractAddress) {
    res.status(503).json({ error: "ACHIEVEMENT_BADGE_ADDRESS not configured" });
    return;
  }

  const rawKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!rawKey) {
    res.status(503).json({ error: "DEPLOYER_PRIVATE_KEY not configured" });
    return;
  }
  const privateKey = (
    rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`
  ) as `0x${string}`;

  // Re-verify eligibility
  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.walletAddress, walletAddress));

  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const [battleRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(matchesTable)
    .where(eq(matchesTable.walletAddress, walletAddress));

  const totalBattles = battleRow?.total ?? 0;

  const eligible =
    badgeType === 0
      ? true
      : badgeType === 1
        ? player.questsCompleted >= QUEST_THRESHOLD
        : totalBattles >= BATTLE_THRESHOLD;

  if (!eligible) {
    res.status(403).json({ error: "Badge requirement not met" });
    return;
  }

  // Confirm not already minted on-chain
  const alreadyMinted = await checkHasMinted(contractAddress, walletAddress, badgeType);
  if (alreadyMinted) {
    res.status(409).json({ error: "Badge already minted" });
    return;
  }

  // Mint on-chain
  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain: monadTestnet,
    transport: http("https://testnet-rpc.monad.xyz"),
  });

  const txHash = await walletClient.writeContract({
    address: contractAddress,
    abi: BADGE_ABI,
    functionName: "mintBadge",
    args: [walletAddress as `0x${string}`, badgeType],
  });

  res.json({ txHash, badgeType, name: ["Wallet Connector", "Task Master", "Great Warrior"][badgeType] });
});

export default router;
