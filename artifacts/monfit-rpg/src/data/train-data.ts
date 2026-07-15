import { Dumbbell, Flame, Timer, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Goal = "muscle" | "weight-loss" | "endurance" | "general";

export const GOALS: { id: Goal; label: string; icon: LucideIcon }[] = [
  { id: "muscle", label: "Build Muscle", icon: Dumbbell },
  { id: "weight-loss", label: "Lose Weight", icon: Flame },
  { id: "endurance", label: "Endurance", icon: Timer },
  { id: "general", label: "General Fitness", icon: Sparkles },
];

export type Program = {
  name: string;
  description: string;
  meta: string;
};

export const PROGRAMS: Record<Goal, Program[]> = {
  muscle: [
    {
      name: "Push Pull Legs",
      description: "Classic hypertrophy split targeting every muscle group twice a week.",
      meta: "6 days/week",
    },
    {
      name: "Upper/Lower Split",
      description: "Balanced strength and size progression with built-in recovery days.",
      meta: "4 days/week",
    },
    {
      name: "Full Body Strength",
      description: "Compound-lift focused sessions for steady mass gains.",
      meta: "3 days/week",
    },
  ],
  "weight-loss": [
    {
      name: "Metabolic Circuit",
      description: "High-intensity circuits that keep your heart rate up and calories burning.",
      meta: "5 days/week",
    },
    {
      name: "Fat Burn HIIT",
      description: "Short, intense intervals paired with active recovery.",
      meta: "4 days/week",
    },
  ],
  endurance: [
    {
      name: "Distance Builder",
      description: "Progressive cardio sessions to extend stamina week over week.",
      meta: "5 days/week",
    },
    {
      name: "Tempo & Intervals",
      description: "Mixed-pace training to raise your aerobic ceiling.",
      meta: "4 days/week",
    },
    {
      name: "Cross-Training Base",
      description: "Low-impact cardio variety to build endurance while protecting joints.",
      meta: "3 days/week",
    },
  ],
  general: [
    {
      name: "Balanced Basics",
      description: "A mix of strength, cardio, and mobility for all-around fitness.",
      meta: "4 days/week",
    },
    {
      name: "Starter Routine",
      description: "Beginner-friendly full-body sessions to build a consistent habit.",
      meta: "3 days/week",
    },
  ],
};

export type Quest = {
  id: string;
  label: string;
  gold: number;
  xp: number;
};

export const DAILY_QUESTS: Quest[] = [
  { id: "workout", label: "Complete today's workout", gold: 50, xp: 20 },
  { id: "steps", label: "Log 8000 steps", gold: 25, xp: 15 },
  { id: "water", label: "Drink 2L water", gold: 15, xp: 10 },
  { id: "stretch", label: "Stretch for 10 minutes", gold: 15, xp: 10 },
  { id: "sleep", label: "Get 7+ hours of sleep", gold: 20, xp: 12 },
];
