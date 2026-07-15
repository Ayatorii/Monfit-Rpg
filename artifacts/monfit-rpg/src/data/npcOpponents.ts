export type Difficulty = "Easy" | "Medium" | "Hard" | "Boss";

export type NpcOpponent = {
  id: string;
  name: string;
  difficulty: Difficulty;
  flavor: string;
  STR: number;
  AGI: number;
  VIT: number;
  /** Gold reward on win */
  rewardGold: number;
  /** XP reward on win */
  rewardXp: number;
};

export const NPC_OPPONENTS: NpcOpponent[] = [
  {
    id: "the-wanderer",
    name: "The Wanderer",
    difficulty: "Easy",
    flavor: "A lone drifter seeking their first real test. Predictable, but persistent.",
    STR: 8,
    AGI: 9,
    VIT: 8,
    rewardGold: 15,
    rewardXp: 10,
  },
  {
    id: "iron-vex",
    name: "Iron Vex",
    difficulty: "Medium",
    flavor: "A seasoned scrapper who clawed their way up from the lower wards. Won't go down easy.",
    STR: 14,
    AGI: 12,
    VIT: 11,
    rewardGold: 30,
    rewardXp: 20,
  },
  {
    id: "nullblade",
    name: "Nullblade",
    difficulty: "Hard",
    flavor: "A disciplined duelist whose strikes flow like water and land like stone.",
    STR: 18,
    AGI: 16,
    VIT: 13,
    rewardGold: 50,
    rewardXp: 35,
  },
  {
    id: "the-thornback",
    name: "The Thornback",
    difficulty: "Hard",
    flavor: "Built to absorb punishment. Slow to fall, impossible to ignore.",
    STR: 15,
    AGI: 12,
    VIT: 20,
    rewardGold: 50,
    rewardXp: 35,
  },
  {
    id: "obsidian-prime",
    name: "Obsidian Prime",
    difficulty: "Boss",
    flavor: "The arena champion. No challenger has lasted all five rounds. Yet.",
    STR: 22,
    AGI: 19,
    VIT: 17,
    rewardGold: 80,
    rewardXp: 60,
  },
];

/**
 * Difficulty label → CSS token class for text color.
 * Reuses the rarity-color convention from Shop/Character.
 */
export const DIFFICULTY_TEXT_CLASS: Record<Difficulty, string> = {
  Easy: "text-rarity-common",
  Medium: "text-rarity-rare",
  Hard: "text-rarity-epic",
  Boss: "text-destructive",
};

/**
 * Difficulty label → inline style color string (for elements that can't use a utility class).
 */
export const DIFFICULTY_COLOR_VAR: Record<Difficulty, string> = {
  Easy: "hsl(var(--rarity-common))",
  Medium: "hsl(var(--rarity-rare))",
  Hard: "hsl(var(--rarity-epic))",
  Boss: "hsl(var(--destructive))",
};
