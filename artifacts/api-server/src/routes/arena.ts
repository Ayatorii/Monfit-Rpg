import { Router } from "express";
import { db, matchesTable, playersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

/**
 * POST /api/arena/match
 * Record a completed arena match for the authenticated wallet.
 * Also upserts the player row with cumulative XP + gold totals.
 */
router.post("/match", async (req, res) => {
  if (!req.session.walletAddress) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { opponentId, opponentName, result, xpEarned, goldEarned } = req.body as {
    opponentId?: string;
    opponentName?: string;
    result?: string;
    xpEarned?: number;
    goldEarned?: number;
  };

  if (!opponentId || !opponentName || !["win", "loss", "draw"].includes(result ?? "")) {
    res.status(400).json({ error: "Missing or invalid fields" });
    return;
  }

  const walletAddress = req.session.walletAddress;
  const xp = typeof xpEarned === "number" ? Math.max(0, xpEarned) : 0;
  const gold = typeof goldEarned === "number" ? Math.max(0, goldEarned) : 0;

  try {
    // Insert the match record.
    await db.insert(matchesTable).values({
      walletAddress,
      opponentId: opponentId!,
      opponentName: opponentName!,
      result: result!,
      xpEarned: xp,
      goldEarned: gold,
    });

    // Upsert the player row, accumulating XP and gold.
    await db
      .insert(playersTable)
      .values({ walletAddress, xp, gold })
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
