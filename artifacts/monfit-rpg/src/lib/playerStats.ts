import type { OwnedItem, EquippedItems } from "@/lib/game-context";

export const BASE_STATS = { STR: 10, AGI: 10, VIT: 10 } as const;

/**
 * Returns the total bonus from equipped items for a single stat.
 * All items now carry only STR / AGI / VIT as their statLabel,
 * determined by slot (see SLOT_STAT in lootTable.ts), so matching
 * is a direct equality check — no legacy alias map needed.
 */
export function statBonus(
  equippedItems: Partial<Record<string, OwnedItem>>,
  stat: "STR" | "AGI" | "VIT",
): number {
  return Object.values(equippedItems)
    .filter(Boolean)
    .filter((item) => item!.statLabel === stat)
    .reduce((sum, item) => sum + item!.statValue, 0);
}

/**
 * Returns the full {STR, AGI, VIT} stat block for the player,
 * combining base stats with all equipped item bonuses.
 */
export function calcPlayerStats(equippedItems: EquippedItems): {
  STR: number;
  AGI: number;
  VIT: number;
} {
  return {
    STR: BASE_STATS.STR + statBonus(equippedItems, "STR"),
    AGI: BASE_STATS.AGI + statBonus(equippedItems, "AGI"),
    VIT: BASE_STATS.VIT + statBonus(equippedItems, "VIT"),
  };
}
