import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, playersTable, playerItemsTable } from "@workspace/db";
import type { Player, PlayerItem } from "@workspace/api-zod";

const router: IRouter = Router();

function toPlayer(row: { walletAddress: string; xp: number; gold: number }): Player {
  return {
    walletAddress: row.walletAddress,
    xp: row.xp,
    gold: row.gold,
    level: Math.floor(row.xp / 100) + 1,
  };
}

function toPlayerItem(row: {
  id: number;
  itemId: string;
  slot: string;
  equipped: boolean;
  obtainedAt: Date;
}): PlayerItem {
  return {
    instanceId: String(row.id),
    itemId: row.itemId,
    slot: row.slot,
    equipped: row.equipped,
    obtainedAt: row.obtainedAt,
  };
}

/** All routes here require an active wallet session. */
router.use((req, res, next): void => {
  if (!req.session.walletAddress) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  next();
});

router.get("/me", async (req, res): Promise<void> => {
  const walletAddress = req.session.walletAddress as string;

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.walletAddress, walletAddress));

  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  res.json(toPlayer(player));
});

router.post("/me/adjust", async (req, res): Promise<void> => {
  const walletAddress = req.session.walletAddress as string;
  const { goldDelta, xpDelta } = req.body as { goldDelta?: unknown; xpDelta?: unknown };

  const gold = typeof goldDelta === "number" && Number.isFinite(goldDelta) ? Math.trunc(goldDelta) : 0;
  const xp = typeof xpDelta === "number" && Number.isFinite(xpDelta) ? Math.trunc(xpDelta) : 0;

  const [existing] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.walletAddress, walletAddress));

  if (!existing) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const nextGold = Math.max(0, existing.gold + gold);
  const nextXp = Math.max(0, existing.xp + xp);

  const [updated] = await db
    .update(playersTable)
    .set({ gold: nextGold, xp: nextXp, updatedAt: new Date() })
    .where(eq(playersTable.walletAddress, walletAddress))
    .returning();

  res.json(toPlayer(updated!));
});

router.get("/me/items", async (req, res): Promise<void> => {
  const walletAddress = req.session.walletAddress as string;

  const rows = await db
    .select()
    .from(playerItemsTable)
    .where(eq(playerItemsTable.walletAddress, walletAddress));

  res.json(rows.map(toPlayerItem));
});

router.post("/me/items", async (req, res): Promise<void> => {
  const walletAddress = req.session.walletAddress as string;
  const { itemId, slot } = req.body as { itemId?: unknown; slot?: unknown };

  if (typeof itemId !== "string" || !itemId || typeof slot !== "string" || !slot) {
    res.status(400).json({ error: "Missing itemId or slot" });
    return;
  }

  const [row] = await db
    .insert(playerItemsTable)
    .values({ walletAddress, itemId, slot })
    .returning();

  res.status(201).json(toPlayerItem(row!));
});

router.patch("/me/items/:instanceId", async (req, res): Promise<void> => {
  const walletAddress = req.session.walletAddress as string;
  const raw = Array.isArray(req.params.instanceId) ? req.params.instanceId[0] : req.params.instanceId;
  const id = Number(raw);
  const { equipped } = req.body as { equipped?: unknown };

  if (!Number.isInteger(id) || typeof equipped !== "boolean") {
    res.status(400).json({ error: "Invalid instanceId or equipped value" });
    return;
  }

  const [target] = await db
    .select()
    .from(playerItemsTable)
    .where(and(eq(playerItemsTable.id, id), eq(playerItemsTable.walletAddress, walletAddress)));

  if (!target) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  const [updated] = await db
    .update(playerItemsTable)
    .set({ equipped })
    .where(eq(playerItemsTable.id, id))
    .returning();

  res.json(toPlayerItem(updated!));
});

export default router;
