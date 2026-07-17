import { Dumbbell, User, ShoppingBag, Swords, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { path: "/train", label: "Trainings", icon: Dumbbell },
  { path: "/character", label: "Character", icon: User },
  { path: "/shop", label: "Shop", icon: ShoppingBag },
  { path: "/arena", label: "Arena", icon: Swords },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
];
