import { Router } from "express";
import { db, matchesTable, playersTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

/**
 * POST /api/arena/match
 * Record a completed arena match and upsert the player's cumulative XP + gold.
 * walletAddress must be supplied in the request body.
 * (Auth is not enforced yet — will be re-added with the wallet auth redo.)
 */
router.post("/match", async (req, res) => {
  const { walletAddress, opponentId, opponentName, result, xpEarned, goldEarned } =
    req.body as {
      walletAddress?: string;
      opponentId?: string;
      opponentName?: string;
      result?: string;
      xpEarned?: number;
      goldEarned?: number;
    };

  if (
    !walletAddress ||
    !opponentId ||
    !opponentName ||
    !["win", "loss", "draw"].includes(result ?? "")
  ) {
    res.status(400).json({ error: "Missing or invalid fields" });
    return;
  }

  const xp = typeof xpEarned === "number" ? Math.max(0, xpEarned) : 0;
  const gold = typeof goldEarned === "number" ? Math.max(0, goldEarned) : 0;
  const addr = walletAddress.toLowerCase();

  try {
    await db.insert(matchesTable).values({
      walletAddress: addr,
      opponentId,
      opponentName,
      result,
      xpEarned: xp,
      goldEarned: gold,
    });

    await db
      .insert(playersTable)
      .values({ walletAddress: addr, xp, gold })
      .onConflictDoUpdate({
        target: playersTable.walletAddress,
        set: {
          xp: sql`${playersTable.xp} + ${xp}`,
          gold: sql`${playersTable.gold} + ${gold}`,
          updatedAt: sql`now()`,
        },
      });

    res.json({ ok: true });
  } catch (err) {
    console.error("[arena/match]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
