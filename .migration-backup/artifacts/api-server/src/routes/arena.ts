import { Router, type IRouter } from "express";
import { db, matchesTable } from "@workspace/db";
import { RecordArenaMatchBody } from "@workspace/api-zod";

const router: IRouter = Router();

/**
 * POST /api/arena/match
 * Records a completed arena match for the signed-in wallet. Insert-only —
 * currency rewards are applied separately via POST /players/me/adjust so
 * gold/xp are never double-credited.
 */
router.post("/match", async (req, res): Promise<void> => {
  const sessionWallet = req.session.walletAddress;

  if (!sessionWallet) {
    res.status(400).json({ error: "Not signed in" });
    return;
  }

  const parsed = RecordArenaMatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid fields" });
    return;
  }

  const { opponentId, opponentName, result, xpEarned, goldEarned } = parsed.data;
  const xp = Math.max(0, xpEarned ?? 0);
  const gold = Math.max(0, goldEarned ?? 0);

  try {
    await db.insert(matchesTable).values({
      walletAddress: sessionWallet,
      opponentId,
      opponentName,
      result,
      xpEarned: xp,
      goldEarned: gold,
    });

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to record arena match");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
