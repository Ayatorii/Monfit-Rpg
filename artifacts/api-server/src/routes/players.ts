import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, playersTable, playerItemsTable } from "@workspace/db";

// Mirrors frontend lootTable.ts DUPLICATE_GOLD values so manual sells and
// duplicate auto-sells award the same gold for the same rarity.
const ITEM_SELL_VALUE: Record<string, number> = {
  // Common — 10 gold
  "worn-leather-gloves": 10,
  "training-shorts":     10,
  "scuffed-runners":     10,
  "frayed-headband":     10,
  "cotton-tank":         10,
  "chalk-dusted-wraps":  10,
  // Rare — 30 gold
  "reinforced-gauntlets": 30,
  "endurance-boots":      30,
  "compression-sleeve":   30,
  "tempered-chestplate":  30,
  // Epic — 100 gold
  "champions-warhelm":    100,
  "titan-grip-gauntlets": 100,
};
import type { Player, PlayerItem } from "@workspace/api-zod";

const router: IRouter = Router();

function toPlayer(row: { walletAddress: string; xp: number; gold: number; selectedGoal?: string | null }): Player {
  return {
    walletAddress: row.walletAddress,
    xp: row.xp,
    gold: row.gold,
    level: Math.floor(row.xp / 100) + 1,
    selectedGoal: row.selectedGoal ?? null,
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

/** POST /me/quest-complete — increment the server-side quests-completed counter by 1. */
router.post("/me/quest-complete", async (req, res): Promise<void> => {
  const walletAddress = req.session.walletAddress as string;

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.walletAddress, walletAddress));

  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const [updated] = await db
    .update(playersTable)
    .set({ questsCompleted: player.questsCompleted + 1, updatedAt: new Date() })
    .where(eq(playersTable.walletAddress, walletAddress))
    .returning();

  res.json({ questsCompleted: updated!.questsCompleted });
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

router.patch("/me/goal", async (req, res): Promise<void> => {
  const walletAddress = req.session.walletAddress as string;
  const { selectedGoal } = req.body as { selectedGoal?: unknown };

  if (selectedGoal !== null && typeof selectedGoal !== "string") {
    res.status(400).json({ error: "selectedGoal must be a string or null" });
    return;
  }

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.walletAddress, walletAddress));

  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const [updated] = await db
    .update(playersTable)
    .set({ selectedGoal: (selectedGoal as string | null) ?? null, updatedAt: new Date() })
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

  // Equipping an item unequips any other item in the same slot (one
  // equipped item per slot).
  if (equipped) {
    await db
      .update(playerItemsTable)
      .set({ equipped: false })
      .where(
        and(
          eq(playerItemsTable.walletAddress, walletAddress),
          eq(playerItemsTable.slot, target.slot),
        ),
      );
  }

  const [updated] = await db
    .update(playerItemsTable)
    .set({ equipped })
    .where(eq(playerItemsTable.id, id))
    .returning();

  res.json(toPlayerItem(updated!));
});

router.delete("/me/items/:instanceId", async (req, res): Promise<void> => {
  const walletAddress = req.session.walletAddress as string;
  const raw = Array.isArray(req.params.instanceId) ? req.params.instanceId[0] : req.params.instanceId;
  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid instanceId" });
    return;
  }

  const [item] = await db
    .select()
    .from(playerItemsTable)
    .where(and(eq(playerItemsTable.id, id), eq(playerItemsTable.walletAddress, walletAddress)));

  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  const goldEarned = ITEM_SELL_VALUE[item.itemId] ?? 10;

  await db.delete(playerItemsTable).where(eq(playerItemsTable.id, id));

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.walletAddress, walletAddress));

  if (!player) {
    res.status(500).json({ error: "Player not found after item delete" });
    return;
  }

  const [updated] = await db
    .update(playersTable)
    .set({ gold: player.gold + goldEarned, updatedAt: new Date() })
    .where(eq(playersTable.walletAddress, walletAddress))
    .returning();

  res.json({ goldEarned, gold: updated!.gold });
});

export default router;
