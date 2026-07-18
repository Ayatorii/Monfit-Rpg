import { Dumbbell, User, ShoppingBag, Swords, Trophy, Medal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  path: string;
  /** Full accessible label used by screen readers and desktop sidebar */
  label: string;
  /**
   * Abbreviated label shown under the icon when this tab is active in the
   * mobile bottom bar. Kept ≤6 chars so it fits in a 53 px column (320 px ÷ 6)
   * at text-[10px] uppercase. Falls back to `label` when omitted.
   */
  shortLabel?: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { path: "/train",       label: "Trainings",   shortLabel: "Train",  icon: Dumbbell    },
  { path: "/character",   label: "Character",   shortLabel: "Hero",   icon: User        },
  { path: "/shop",        label: "Shop",                              icon: ShoppingBag },
  { path: "/arena",       label: "Arena",                             icon: Swords      },
  { path: "/leaderboard", label: "Leaderboard", shortLabel: "Ranks",  icon: Trophy      },
  { path: "/badges",      label: "Badges",                            icon: Medal       },
];
