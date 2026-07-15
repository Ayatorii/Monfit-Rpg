import type { OwnedItem, EquippedItems } from "@/lib/game-context";

export const BASE_STATS = { STR: 10, AGI: 10, VIT: 10 } as const;

/**
 * Maps each combat stat to the item statLabels that contribute to it.
 * Source of truth — imported by both Character and Arena so they can never drift.
 */
export const STAT_LABEL_MAP: Record<"STR" | "AGI" | "VIT", string[]> = {
  STR: ["STR", "GRP"],
  AGI: ["SPD", "FOC"],
  VIT: ["END", "STA"],
};

/**
 * Returns the total bonus from equipped items for a single stat.
 */
export function statBonus(
  equippedItems: Partial<Record<string, OwnedItem>>,
  stat: "STR" | "AGI" | "VIT",
): number {
  return Object.values(equippedItems)
    .filter(Boolean)
    .filter((item) => STAT_LABEL_MAP[stat].includes(item!.statLabel))
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
