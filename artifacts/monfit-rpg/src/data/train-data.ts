import buildMuscleImg from "../assets/goals/build-muscle.png";
import loseWeightImg from "../assets/goals/lose-weight.png";
import enduranceImg from "../assets/goals/endurance.png";
import generalFitnessImg from "../assets/goals/general-fitness.png";

export type Goal = "muscle" | "weight-loss" | "endurance" | "general";

export const GOALS: { id: Goal; label: string; image: string }[] = [
  { id: "muscle",      label: "BUILD MUSCLE",    image: buildMuscleImg },
  { id: "weight-loss", label: "LOSE WEIGHT",      image: loseWeightImg },
  { id: "endurance",   label: "ENDURANCE",        image: enduranceImg },
  { id: "general",     label: "GENERAL FITNESS",  image: generalFitnessImg },
];

export type Program = {
  name: string;
  description: string;
  meta: string;
};

export const PROGRAMS: Record<Goal, Program[]> = {
  muscle: [
    { name: "Bench Press",     description: "Build upper-body pushing strength and chest muscles.", meta: "2× / week" },
    { name: "Squats",          description: "Develop powerful legs and core stability.",             meta: "2× / week" },
    { name: "Deadlifts",       description: "Strengthen the entire posterior chain.",                meta: "1× / week" },
    { name: "Overhead Press",  description: "Increase shoulder strength and stability.",             meta: "2× / week" },
    { name: "Pull-Ups",        description: "Build back width and upper-body power.",                meta: "2× / week" },
  ],
  "weight-loss": [
    { name: "Brisk Walking",       description: "Burn calories with low-impact cardio.",               meta: "5× / week" },
    { name: "HIIT Intervals",      description: "Maximize calorie burn in a short workout.",           meta: "3× / week" },
    { name: "Jump Rope",           description: "Improve coordination and cardiovascular fitness.",    meta: "3× / week" },
    { name: "Bodyweight Circuit",  description: "Full-body workout to boost metabolism.",              meta: "3× / week" },
    { name: "Cycling",             description: "Steady cardio for endurance and fat loss.",           meta: "2× / week" },
  ],
  endurance: [
    { name: "Distance Running",   description: "Improve aerobic capacity and stamina.",               meta: "3× / week" },
    { name: "Cycling",            description: "Build cardiovascular endurance.",                      meta: "2× / week" },
    { name: "Rowing",             description: "Train full-body endurance efficiently.",               meta: "2× / week" },
    { name: "Swimming",           description: "Increase stamina with low joint impact.",              meta: "2× / week" },
    { name: "Interval Running",   description: "Boost speed and endurance simultaneously.",           meta: "2× / week" },
  ],
  general: [
    { name: "Push-Ups",             description: "Improve upper-body strength anywhere.",              meta: "3× / week" },
    { name: "Bodyweight Squats",    description: "Strengthen legs and mobility.",                      meta: "3× / week" },
    { name: "Plank",                description: "Build core stability and posture.",                  meta: "4× / week" },
    { name: "Jogging",              description: "Improve overall cardiovascular health.",             meta: "3× / week" },
    { name: "Full-Body Mobility",   description: "Increase flexibility and reduce stiffness.",         meta: "5× / week" },
  ],
};

export type Quest = {
  id: string;
  label: string;
  gold: number;
  xp: number;
};

export const DAILY_QUESTS: Record<Goal, Quest[]> = {
  muscle: [
    { id: "muscle-steps",    label: "Walk 7,000 Steps",            gold: 20, xp: 10 },
    { id: "muscle-water",    label: "Drink 2L Water",              gold: 15, xp: 8  },
    { id: "muscle-pushups",  label: "Complete 30 Push-Ups",        gold: 30, xp: 20 },
    { id: "muscle-protein",  label: "Reach Your Daily Protein Goal", gold: 25, xp: 15 },
    { id: "muscle-sleep",    label: "Sleep 8 Hours",               gold: 20, xp: 12 },
  ],
  "weight-loss": [
    { id: "wl-steps",    label: "Walk 7,000 Steps",          gold: 20, xp: 10 },
    { id: "wl-water",    label: "Drink 2L Water",            gold: 15, xp: 8  },
    { id: "wl-calories", label: "Burn 300 Active Calories",  gold: 30, xp: 20 },
    { id: "wl-deficit",  label: "Stay Within Your Calorie Goal", gold: 25, xp: 15 },
    { id: "wl-sugar",    label: "Skip Sugary Drinks Today",  gold: 20, xp: 12 },
  ],
  endurance: [
    { id: "end-steps",   label: "Walk 7,000 Steps",              gold: 20, xp: 10 },
    { id: "end-water",   label: "Drink 2L Water",                gold: 15, xp: 8  },
    { id: "end-cardio",  label: "Complete 20 Minutes of Cardio", gold: 30, xp: 20 },
    { id: "end-active",  label: "Maintain 30 Active Minutes",    gold: 25, xp: 15 },
    { id: "end-stretch", label: "Stretch for 10 Minutes",        gold: 15, xp: 10 },
  ],
  general: [
    { id: "gen-steps",   label: "Walk 7,000 Steps",              gold: 20, xp: 10 },
    { id: "gen-water",   label: "Drink 2L Water",                gold: 15, xp: 8  },
    { id: "gen-workout", label: "Complete One Workout Session",  gold: 30, xp: 20 },
    { id: "gen-stretch", label: "Stretch for 10 Minutes",        gold: 15, xp: 10 },
    { id: "gen-goals",   label: "Close All Daily Fitness Goals", gold: 25, xp: 15 },
  ],
};
