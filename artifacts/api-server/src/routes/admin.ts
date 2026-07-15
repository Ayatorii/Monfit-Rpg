import { Router, type IRouter } from "express";
import { createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";
import { db, matchesTable, playersTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router: IRouter = Router();

const TROPHY_ABI = parseAbi([
  "function mintTrophy(address player, uint256 season, uint8 rank) external returns (uint256 tokenId)",
]);

/**
 * POST /api/admin/mint-season-trophies
 * Awards a Season Trophy NFT to the top-N leaderboard players on Monad Testnet.
 * Protected by X-Admin-Secret header.
 */
router.post("/mint-season-trophies", async (req, res) => {
  const adminSecret = process.env.MINT_ADMIN_SECRET;
  if (!adminSecret) {
    res.status(503).json({ error: "MINT_ADMIN_SECRET not configured" });
    return;
  }
  if (req.headers["x-admin-secret"] !== adminSecret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const contractAddress = process.env.SEASON_TROPHY_ADDRESS as `0x${string}` | undefined;
  if (!contractAddress) {
    res.status(503).json({ error: "SEASON_TROPHY_ADDRESS not configured" });
    return;
  }

  const rawKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!rawKey) {
    res.status(503).json({ error: "DEPLOYER_PRIVATE_KEY not configured" });
    return;
  }
  const privateKey = (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) as `0x${string}`;

  const topN = Math.min(Number(req.body?.topN ?? 3), 10);
  const season = BigInt(req.body?.season ?? process.env.CURRENT_SEASON ?? 1);

  let rows: { walletAddress: string }[];
  try {
    rows = await db
      .select({
        walletAddress: matchesTable.walletAddress,
        score: sql<number>`(COUNT(*) FILTER (WHERE ${matchesTable.result} = 'win'))::int - (COUNT(*) FILTER (WHERE ${matchesTable.result} = 'loss'))::int`.as("score"),
        xp: sql<number>`COALESCE(MAX(${playersTable.xp}), 0)`.as("xp"),
      })
      .from(matchesTable)
      .leftJoin(playersTable, eq(matchesTable.walletAddress, playersTable.walletAddress))
      .groupBy(matchesTable.walletAddress)
      .orderBy(
        desc(sql`(COUNT(*) FILTER (WHERE ${matchesTable.result} = 'win'))::int - (COUNT(*) FILTER (WHERE ${matchesTable.result} = 'loss'))::int`),
        desc(sql`COALESCE(MAX(${playersTable.xp}), 0)`),
      )
      .limit(topN);
  } catch (err) {
    req.log.error({ err }, "Leaderboard query failed");
    res.status(500).json({ error: "Database query failed" });
    return;
  }

  if (rows.length === 0) {
    res.json({ minted: [], message: "No players on leaderboard yet" });
    return;
  }

  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain: monadTestnet,
    transport: http("https://testnet-rpc.monad.xyz"),
  });

  const minted: { walletAddress: string; rank: number; txHash: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const { walletAddress } = rows[i];
    const rank = (i + 1) as number;
    try {
      const txHash = await walletClient.writeContract({
        address: contractAddress,
        abi: TROPHY_ABI,
        functionName: "mintTrophy",
        args: [walletAddress as `0x${string}`, season, rank],
      });
      minted.push({ walletAddress, rank, txHash });
    } catch (err) {
      minted.push({ walletAddress, rank, txHash: `ERROR: ${(err as Error).message}` });
    }
  }

  res.json({ season: season.toString(), minted });
});

export default router;
