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
  const [tentativeGoal, setTentativeGoal] = useState<Goal | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);

  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const isReduced = useReducedMotion() ?? false;

  const programs = useMemo(() => (goal ? PROGRAMS[goal] : []), [goal]);
  const quests   = useMemo(() => (goal ? DAILY_QUESTS[goal] : []), [goal]);
  const selectedGoalData = GOALS.find((g) => g.id === goal);

  const handleGoalClick = (id: Goal) => {
    setTentativeGoal(id);
  };

  const handlePick = (id: Goal) => {
    if (goal !== id) {
      setCompleted(new Set());
    }
    setGoal(id);
    setTentativeGoal(id);
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

  const dur   = (base: number) => (isReduced ? 0 : base);
  const delay = (base: number) => (isReduced ? 0 : base);

  const pageTitle = goal && selectedGoalData
    ? `${selectedGoalData.label} TRAININGS`
    : "TRAININGS";

  return (
    <div className="relative min-h-screen">
      {/* Background image — goal image at very low opacity */}
      <AnimatePresence>
        {goal && selectedGoalData && (
          <motion.div
            key={goal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: dur(0.6) }}
            className="fixed inset-0 pointer-events-none"
            style={{
              zIndex: -1,
              backgroundImage: `url(${selectedGoalData.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.06,
            }}
          />
        )}
      </AnimatePresence>

      <div className="px-4 md:px-8 pt-6 md:pt-10 pb-10 max-w-3xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <AnimatePresence mode="wait">
              <motion.h1
                key={pageTitle}
                initial={{ opacity: 0, y: isReduced ? 0 : -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: isReduced ? 0 : 8 }}
                transition={{ duration: dur(0.22) }}
                className="font-display font-black text-3xl md:text-4xl text-white leading-none"
              >
                {pageTitle}
              </motion.h1>
            </AnimatePresence>

            {/* Subtitle — only before a goal is picked */}
            <AnimatePresence>
              {!goal && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: dur(0.2) }}
                  className="text-muted-foreground text-sm mt-1"
                >
                  Pick a goal to see your program and daily quests.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <ResourceBadges gold={gold} xp={xp} />
        </header>

        {/* Goal selection — slides out after PICK */}
        <AnimatePresence>
          {!goal && (
            <motion.section
              key="goal-section"
              aria-labelledby="goal-heading"
              initial={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: "hidden" }}
              transition={{ duration: dur(0.35), ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              <h2
                id="goal-heading"
                className="font-display font-bold text-lg text-white mb-4 uppercase tracking-wide"
              >
                Pick Your Goal
              </h2>
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
                {GOALS.map((g, idx) => {
                  const isTentative = tentativeGoal === g.id;

                  return (
                    <motion.div
                      key={g.id}
                      animate={{ scale: isTentative && !isReduced ? 1.04 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className={cn(
                        "relative flex flex-col overflow-hidden rounded-xl border-2 transition-colors cursor-pointer",
                        isTentative
                          ? "border-primary shadow-[0_0_18px_2px_var(--primary-glow)]"
                          : "border-card-border hover:border-primary/40",
                      )}
                      onClick={() => handleGoalClick(g.id)}
                    >
                      {/* Image + PICK overlay */}
                      <div className="relative w-full aspect-square overflow-hidden bg-card">
                        <motion.img
                          src={g.image}
                          alt={g.label}
                          loading="lazy"
                          fetchPriority={idx < 2 ? "high" : "low"}
                          animate={{ scale: isTentative && !isReduced ? 1.08 : 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 22 }}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />

                        {/* PICK button — centered in the image area */}
                        <AnimatePresence>
                          {isTentative && (
                            <motion.div
                              key="pick-overlay"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: dur(0.15) }}
                              className="absolute inset-0 flex items-center justify-center bg-black/30"
                            >
                              <motion.button
                                type="button"
                                initial={{ scale: isReduced ? 1 : 0.75, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: isReduced ? 1 : 0.75, opacity: 0 }}
                                transition={{ duration: dur(0.2), ease: [0.16, 1, 0.3, 1] }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePick(g.id);
                                }}
                                className={cn(
                                  "px-10 py-4 rounded-full",
                                  "font-bold text-2xl uppercase tracking-widest",
                                  "bg-primary text-white",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                                  "hover:bg-primary/90 active:scale-95 transition-all",
                                )}
                              >
                                PICK
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Label bar */}
                      <div
                        className={cn(
                          "w-full px-3 py-2.5 transition-colors",
                          isTentative ? "bg-primary/15" : "bg-card",
                        )}
                      >
                        <span
                          className={cn(
                            "block font-semibold text-sm text-center",
                            isTentative ? "text-white" : "text-foreground",
                          )}
                        >
                          {g.label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Suggested Programs — always visible, placeholder before goal is picked */}
        <section aria-labelledby="programs-heading" className="mb-8">
          <h2
            id="programs-heading"
            className="font-display font-bold text-lg text-white mb-3 uppercase tracking-wide"
          >
            Suggested Programs
          </h2>

          <AnimatePresence mode="wait">
            {!goal ? (
              /* Placeholder before goal is picked */
              <motion.p
                key="programs-placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: dur(0.2) }}
                className="text-muted-foreground text-sm border border-card-border rounded-lg bg-card px-4 py-5"
              >
                Pick a goal above to see suggested training programs.
              </motion.p>
            ) : (
              /* Actual programs */
              <motion.div
                key={`programs-${goal}`}
                initial={{ opacity: 0, y: isReduced ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: dur(0.3), ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-3"
              >
                {programs.map((p, i) => (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, x: isReduced ? 0 : -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: dur(0.28), delay: delay(i * 0.05), ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-lg border border-card-border bg-card px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <h3 className="font-semibold text-lg uppercase tracking-wide text-white">
                        {p.name}
                      </h3>
                      <span className="font-mono text-sm text-primary shrink-0 whitespace-nowrap">
                        {p.meta}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-base leading-snug">{p.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Daily Quests — always visible, placeholder before goal is picked */}
        <section aria-labelledby="quests-heading">
          <h2
            id="quests-heading"
            className="font-display font-bold text-lg text-white mb-3 uppercase tracking-wide"
          >
            Daily Quests
          </h2>

          <AnimatePresence mode="wait">
            {!goal ? (
              /* Placeholder before goal is picked */
              <motion.p
                key="quests-placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: dur(0.2) }}
                className="text-muted-foreground text-sm border border-card-border rounded-lg bg-card px-4 py-5"
              >
                Pick a goal above to unlock your daily quests.
              </motion.p>
            ) : (
              /* Actual quests */
              <motion.div
                key={`quests-${goal}`}
                initial={{ opacity: 0, y: isReduced ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: dur(0.3), ease: [0.16, 1, 0.3, 1] }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
