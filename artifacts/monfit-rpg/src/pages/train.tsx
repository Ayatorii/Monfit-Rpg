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
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
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
      setSelectedProgram(null);
    }
    setGoal(id);
    setTentativeGoal(id);
  };

  const handleProgramSelect = (name: string) => {
    setSelectedProgram((prev) => (prev === name ? null : name));
  };

  const toggleQuest = (id: string, questGold: number, questXp: number, label: string) => {
    if (!selectedProgram) return;
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
            className="fixed inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `url(${selectedGoalData.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.07,
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 px-4 md:px-8 pt-6 md:pt-10 pb-10 max-w-3xl mx-auto">
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
            Pick Your Goal
          </h2>
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
            {GOALS.map((g, idx) => {
              const isActive = goal === g.id;
              const isTentative = tentativeGoal === g.id;
              const showPick = isTentative;

              return (
                <motion.div
                  key={g.id}
                  animate={{ scale: isActive && !isReduced ? 1.04 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className={cn(
                    "relative flex flex-col overflow-hidden rounded-xl border-2 transition-colors cursor-pointer",
                    isActive
                      ? "border-primary shadow-[0_0_18px_2px_var(--primary-glow)]"
                      : isTentative
                      ? "border-primary/60"
                      : "border-card-border hover:border-primary/40",
                  )}
                  onClick={() => handleGoalClick(g.id)}
                >
                  {/* Image */}
                  <div className="w-full aspect-square overflow-hidden bg-card">
                    <motion.img
                      src={g.image}
                      alt={g.label}
                      loading="lazy"
                      fetchPriority={idx < 2 ? "high" : "low"}
                      animate={{ scale: isActive && !isReduced ? 1.08 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>

                  {/* Label bar */}
                  <div
                    className={cn(
                      "w-full px-3 py-2.5 transition-colors",
                      isActive ? "bg-primary/15" : "bg-card",
                    )}
                  >
                    <span
                      className={cn(
                        "block font-semibold text-sm text-center",
                        isActive ? "text-white" : "text-foreground",
                      )}
                    >
                      {g.label}
                    </span>
                  </div>

                  {/* PICK button overlay */}
                  <AnimatePresence>
                    {showPick && (
                      <motion.button
                        key="pick-btn"
                        type="button"
                        initial={{ opacity: 0, scale: isReduced ? 1 : 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: isReduced ? 1 : 0.8 }}
                        transition={{ duration: dur(0.18), ease: [0.16, 1, 0.3, 1] }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePick(g.id);
                        }}
                        className={cn(
                          "absolute bottom-12 left-1/2 -translate-x-1/2",
                          "px-5 py-1.5 rounded-full font-bold text-sm uppercase tracking-widest",
                          "bg-primary text-white shadow-lg",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                          "hover:bg-primary/90 active:scale-95 transition-all",
                        )}
                      >
                        PICK
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
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
                  {programs.map((p, i) => {
                    const isPicked = selectedProgram === p.name;
                    return (
                      <motion.button
                        key={p.name}
                        type="button"
                        aria-pressed={isPicked}
                        onClick={() => handleProgramSelect(p.name)}
                        initial={{ opacity: 0, x: isReduced ? 0 : -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: dur(0.28), delay: delay(i * 0.05), ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                          "rounded-lg border px-4 py-4 text-left w-full transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          isPicked
                            ? "border-primary bg-primary/10 shadow-[0_0_12px_1px_var(--primary-glow)]"
                            : "border-card-border bg-card hover:border-primary/40",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <h3 className={cn("font-semibold text-base", isPicked ? "text-primary" : "text-white")}>
                            {p.name}
                          </h3>
                          <span className="font-mono text-sm text-primary shrink-0 whitespace-nowrap">
                            {p.meta}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-base leading-snug">{p.description}</p>
                      </motion.button>
                    );
                  })}
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

                {!selectedProgram && (
                  <p className="text-muted-foreground text-sm mb-3">
                    Select a program above to unlock daily quests.
                  </p>
                )}

                <div className={cn("flex flex-col gap-2.5", !selectedProgram && "opacity-40 pointer-events-none select-none")}>
                  {quests.map((q, i) => {
                    const isDone = completed.has(q.id);
                    return (
                      <motion.button
                        key={q.id}
                        type="button"
                        role="checkbox"
                        aria-checked={isDone}
                        aria-disabled={!selectedProgram}
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
    </div>
  );
}
