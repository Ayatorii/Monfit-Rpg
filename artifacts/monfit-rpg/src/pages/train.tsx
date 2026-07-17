import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGame } from "@/lib/game-context";
import { cn } from "@/lib/utils";
import { GOALS, PROGRAMS, DAILY_QUESTS, type Goal } from "@/data/train-data";
import ResourceBadges from "@/components/ResourceBadges";

export default function TrainPage() {
  const { toast } = useToast();
  const { gold, xp, addGold, addXp } = useGame();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const isReduced = useReducedMotion() ?? false;

  const programs = useMemo(() => (goal ? PROGRAMS[goal] : []), [goal]);
  const quests   = useMemo(() => (goal ? DAILY_QUESTS[goal] : []), [goal]);

  const handleGoal = (id: Goal) => {
    if (goal !== id) setCompleted(new Set());
    setGoal(id);
  };

  const toggleQuest = (id: string, questGold: number, questXp: number, label: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        addGold(-questGold);
        addXp(-questXp);
      } else {
        next.add(id);
        addGold(questGold);
        addXp(questXp);
        toast({
          title: `Quest complete!`,
          description: `${label} — +${questGold} Gold, +${questXp} XP`,
        });
      }
      return next;
    });
  };

  const dur  = (base: number) => (isReduced ? 0 : base);
  const delay = (base: number) => (isReduced ? 0 : base);

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-10 max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white leading-none">
            Train
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pick a goal to see your program and daily quests.
          </p>
        </div>
        <ResourceBadges gold={gold} xp={xp} />
      </header>

      {/* Goal selection */}
      <section aria-labelledby="goal-heading" className="mb-8">
        <h2
          id="goal-heading"
          className="font-display font-bold text-lg text-white mb-4 uppercase tracking-wide"
        >
          Your Goal
        </h2>
        {/* Single column below 360 px, two columns above */}
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
          {GOALS.map((g, idx) => {
            const isSelected = goal === g.id;
            return (
              <motion.button
                key={g.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleGoal(g.id)}
                animate={{ scale: isSelected && !isReduced ? 1.04 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isSelected
                    ? "border-primary shadow-[0_0_18px_2px_var(--primary-glow)]"
                    : "border-card-border hover:border-primary/40",
                )}
              >
                {/* Image */}
                <div className="w-full aspect-square overflow-hidden bg-card">
                  <motion.img
                    src={g.image}
                    alt={g.label}
                    loading="lazy"
                    fetchPriority={idx < 2 ? "high" : "low"}
                    animate={{ scale: isSelected && !isReduced ? 1.08 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>

                {/* Label bar */}
                <div
                  className={cn(
                    "w-full px-3 py-2.5 transition-colors",
                    isSelected ? "bg-primary/15" : "bg-card",
                  )}
                >
                  <span
                    className={cn(
                      "block font-semibold text-sm text-center",
                      isSelected ? "text-white" : "text-foreground",
                    )}
                  >
                    {g.label}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Programs + Quests — only visible after a goal is chosen */}
      <AnimatePresence>
        {goal && (
          <motion.div
            key={goal}
            initial={{ opacity: 0, y: isReduced ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isReduced ? 0 : 16 }}
            transition={{ duration: dur(0.35), ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Suggested Programs */}
            <section aria-labelledby="programs-heading" className="mb-8">
              <h2
                id="programs-heading"
                className="font-display font-bold text-lg text-white mb-3 uppercase tracking-wide"
              >
                Suggested Programs
              </h2>
              <div className="flex flex-col gap-3">
                {programs.map((p, i) => (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, x: isReduced ? 0 : -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: dur(0.28), delay: delay(i * 0.05), ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-lg border border-card-border bg-card px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-white text-sm">{p.name}</h3>
                      <span className="font-mono text-xs text-primary-text shrink-0 whitespace-nowrap">
                        {p.meta}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">{p.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Daily Quests */}
            <section aria-labelledby="quests-heading">
              <h2
                id="quests-heading"
                className="font-display font-bold text-lg text-white mb-3 uppercase tracking-wide"
              >
                Daily Quests
              </h2>
              <div className="flex flex-col gap-2.5">
                {quests.map((q, i) => {
                  const isDone = completed.has(q.id);
                  return (
                    <motion.button
                      key={q.id}
                      type="button"
                      role="checkbox"
                      aria-checked={isDone}
                      aria-label={`${q.label} — ${isDone ? "completed" : `mark complete for +${q.gold} Gold, +${q.xp} XP`}`}
                      onClick={() => toggleQuest(q.id, q.gold, q.xp, q.label)}
                      initial={{ opacity: 0, x: isReduced ? 0 : -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: dur(0.28), delay: delay(0.1 + i * 0.05), ease: [0.16, 1, 0.3, 1] }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 min-h-11 text-left transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isDone
                          ? "border-primary/30 bg-primary/5"
                          : "border-card-border bg-card hover:border-primary/30",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid place-content-center shrink-0 h-4 w-4 rounded-sm border border-primary transition-colors",
                          isDone && "bg-primary text-primary-foreground",
                        )}
                      >
                        {isDone && <Check className="h-3 w-3" />}
                      </span>
                      <span
                        className={cn(
                          "flex-1 text-sm font-medium select-none",
                          isDone ? "text-muted-foreground line-through" : "text-foreground",
                        )}
                      >
                        {q.label}
                      </span>
                      {isDone ? (
                        <motion.span
                          initial={{ opacity: 0, scale: isReduced ? 1 : 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: dur(0.25), ease: [0.16, 1, 0.3, 1] }}
                          className="flex items-center gap-1 text-primary shrink-0"
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </motion.span>
                      ) : (
                        <span className="text-xs font-mono text-muted-foreground shrink-0 whitespace-nowrap">
                          +{q.gold} Gold, +{q.xp} XP
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
