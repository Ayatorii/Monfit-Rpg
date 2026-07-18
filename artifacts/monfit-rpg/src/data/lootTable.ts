export type Rarity = "common" | "rare" | "epic";

export type Slot = "head" | "body" | "leftHand" | "rightHand" | "legs" | "feet";

export type LootItem = {
  id: string;
  name: string;
  rarity: Rarity;
  slot: Slot;
  statLabel: string;
  statValue: number;
};

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 70,
  rare: 25,
  epic: 5,
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
};

export const SLOT_LABELS: Record<Slot, string> = {
  head: "Head",
  body: "Body",
  leftHand: "Left Hand",
  rightHand: "Right Hand",
  legs: "Legs",
  feet: "Feet",
};

// Stat bonus rule: slot determines which attribute the item boosts.
// leftHand / rightHand → STR
// legs / feet          → AGI
// head / body          → VIT
export const SLOT_STAT: Record<Slot, "STR" | "AGI" | "VIT"> = {
  leftHand:  "STR",
  rightHand: "STR",
  legs:      "AGI",
  feet:      "AGI",
  head:      "VIT",
  body:      "VIT",
};

export const LOOT_TABLE: LootItem[] = [
  // Common — 70% combined weight
  { id: "worn-leather-gloves", name: "Worn Leather Gloves", rarity: "common", slot: "rightHand", statLabel: "STR", statValue: 2 },
  { id: "training-shorts",     name: "Training Shorts",     rarity: "common", slot: "legs",      statLabel: "AGI", statValue: 2 },
  { id: "scuffed-runners",     name: "Scuffed Runners",     rarity: "common", slot: "feet",      statLabel: "AGI", statValue: 2 },
  { id: "frayed-headband",     name: "Frayed Headband",     rarity: "common", slot: "head",      statLabel: "VIT", statValue: 2 },
  { id: "cotton-tank",         name: "Cotton Tank",         rarity: "common", slot: "body",      statLabel: "VIT", statValue: 2 },
  { id: "chalk-dusted-wraps",  name: "Chalk-Dusted Wraps",  rarity: "common", slot: "leftHand",  statLabel: "STR", statValue: 2 },

  // Rare — 25% combined weight
  { id: "reinforced-gauntlets", name: "Reinforced Gauntlets", rarity: "rare", slot: "rightHand", statLabel: "STR", statValue: 5 },
  { id: "endurance-boots",      name: "Endurance Boots",      rarity: "rare", slot: "feet",      statLabel: "AGI", statValue: 5 },
  { id: "compression-sleeve",   name: "Compression Sleeve",   rarity: "rare", slot: "leftHand",  statLabel: "STR", statValue: 5 },
  { id: "tempered-chestplate",  name: "Tempered Chestplate",  rarity: "rare", slot: "body",      statLabel: "VIT", statValue: 5 },

  // Epic — 5% combined weight
  { id: "champions-warhelm",     name: "Champion's Warhelm",     rarity: "epic", slot: "head",      statLabel: "VIT", statValue: 12 },
  { id: "titan-grip-gauntlets",  name: "Titan Grip Gauntlets",   rarity: "epic", slot: "rightHand", statLabel: "STR", statValue: 12 },
];

/**
 * Rolls a weighted random item from the loot table.
 * Rarity weight is split evenly across the items within that rarity tier.
 */
export function rollLoot(): LootItem {
  const byRarity: Record<Rarity, LootItem[]> = { common: [], rare: [], epic: [] };
  for (const item of LOOT_TABLE) byRarity[item.rarity].push(item);

  const totalWeight = (Object.keys(RARITY_WEIGHTS) as Rarity[]).reduce(
    (sum, r) => sum + RARITY_WEIGHTS[r],
    0,
  );

  let roll = Math.random() * totalWeight;
  let chosenRarity: Rarity = "common";
  for (const rarity of Object.keys(RARITY_WEIGHTS) as Rarity[]) {
    if (roll < RARITY_WEIGHTS[rarity]) {
      chosenRarity = rarity;
      break;
    }
    roll -= RARITY_WEIGHTS[rarity];
  }

  const pool = byRarity[chosenRarity];
  return pool[Math.floor(Math.random() * pool.length)];
}
