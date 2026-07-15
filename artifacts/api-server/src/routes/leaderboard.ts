import { Router, type IRouter } from "express";
import { db, matchesTable, playersTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router: IRouter = Router();

/**
 * GET /api/leaderboard
 * Returns players ranked by (wins - losses) desc, tie-broken by XP desc.
 * Players with zero matches are excluded.
 * Optionally includes the caller's rank if authenticated.
 */
router.get("/", async (req, res) => {
  try {
    // Aggregate match stats per wallet from the matches table.
    // wins - losses = score; tie-break by total XP stored in players table.
    const rows = await db
      .select({
        walletAddress: matchesTable.walletAddress,
        wins: sql<number>`COUNT(*) FILTER (WHERE ${matchesTable.result} = 'win')`.as("wins"),
        losses: sql<number>`COUNT(*) FILTER (WHERE ${matchesTable.result} = 'loss')`.as("losses"),
        draws: sql<number>`COUNT(*) FILTER (WHERE ${matchesTable.result} = 'draw')`.as("draws"),
        score: sql<number>`(COUNT(*) FILTER (WHERE ${matchesTable.result} = 'win'))::int - (COUNT(*) FILTER (WHERE ${matchesTable.result} = 'loss'))::int`.as("score"),
        xp: sql<number>`COALESCE(MAX(${playersTable.xp}), 0)`.as("xp"),
        gold: sql<number>`COALESCE(MAX(${playersTable.gold}), 0)`.as("gold"),
      })
      .from(matchesTable)
      .leftJoin(playersTable, eq(matchesTable.walletAddress, playersTable.walletAddress))
      .groupBy(matchesTable.walletAddress)
      .orderBy(
        desc(sql`(COUNT(*) FILTER (WHERE ${matchesTable.result} = 'win'))::int - (COUNT(*) FILTER (WHERE ${matchesTable.result} = 'loss'))::int`),
        desc(sql`COALESCE(MAX(${playersTable.xp}), 0)`),
      );

    // Attach rank numbers, and the signed-in caller's own rank if any.
    const callerWallet: string | null = req.session.walletAddress ?? null;

    const ranked = rows.map((row, i) => ({
      rank: i + 1,
      walletAddress: row.walletAddress,
      wins: Number(row.wins),
      losses: Number(row.losses),
      draws: Number(row.draws),
      score: Number(row.score),
      xp: Number(row.xp),
      level: Math.floor(Number(row.xp) / 100) + 1,
    }));

    const callerRank = callerWallet
      ? (ranked.find((r) => r.walletAddress === callerWallet)?.rank ?? null)
      : null;

    res.json({ ranked, callerRank });
  } catch (err) {
    req.log.error({ err }, "Failed to load leaderboard");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
