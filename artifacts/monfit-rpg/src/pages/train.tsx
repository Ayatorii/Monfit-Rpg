import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, RefreshCw, X } from "lucide-react";
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
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapTentative, setSwapTentative] = useState<Goal | null>(null);
  const isReduced = useReducedMotion() ?? false;

  const programs = useMemo(() => (goal ? PROGRAMS[goal] : []), [goal]);
  const quests = useMemo(() => (goal ? DAILY_QUESTS[goal] : []), [goal]);
  const selectedGoalData = GOALS.find((g) => g.id === goal);
  const swapGoals = useMemo(() => GOALS.filter((g) => g.id !== goal), [goal]);

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

  const handleSwapPick = (id: Goal) => {
    setCompleted(new Set());
    setGoal(id);
    setTentativeGoal(id);
    setSwapOpen(false);
    setSwapTentative(null);
  };

  const handleSwapClose = () => {
    setSwapOpen(false);
    setSwapTentative(null);
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

  const dur = (base: number) => (isReduced ? 0 : base);
  const delay = (base: number) => (isReduced ? 0 : base);

  const pageTitle =
    goal && selectedGoalData ? `${selectedGoalData.label} TRAININGS` : "TRAININGS";

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
                className="font-display font-black text-3xl md:text-4xl text-foreground text-balance leading-none"
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
                  className="text-muted-foreground text-sm mt-1 text-pretty"
                >
                  Pick a goal to see your program and daily quests.
                </motion.p>
              )}
            </AnimatePresence>

            {/* SWAP GOAL button — appears after goal is picked */}
            <AnimatePresence>
              {goal && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: dur(0.2) }}
                  onClick={() => setSwapOpen(true)}
                  className={cn(
                    "mt-2 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors",
                    "text-xs font-semibold uppercase tracking-wider text-primary-text",
                    "border border-primary/30 bg-primary/10 hover:bg-primary/20",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  <RefreshCw className="h-3 w-3" aria-hidden="true" />
                  Swap Goal
                </motion.button>
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
                className="font-display font-bold text-lg text-foreground text-balance mb-4 uppercase tracking-wide"
              >
                Pick Your Goal
              </h2>
              <div className="grid grid-cols-2 gap-3">
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
                              className="absolute inset-0 flex items-center justify-center bg-background/60"
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

        {/* Suggested Programs */}
        <section aria-labelledby="programs-heading" className="mb-8">
          <h2
            id="programs-heading"
            className="font-display font-bold text-lg text-foreground text-balance mb-3 uppercase tracking-wide"
          >
            Suggested Programs
          </h2>

          <AnimatePresence>
            {!goal ? (
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
                      <h3 className="font-semibold text-lg uppercase tracking-wide text-foreground text-balance">
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

        {/* Daily Quests */}
        <section aria-labelledby="quests-heading">
          <h2
            id="quests-heading"
            className="font-display font-bold text-lg text-foreground text-balance mb-3 uppercase tracking-wide"
          >
            Daily Quests
          </h2>

          <AnimatePresence>
            {!goal ? (
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

      {/* ── SWAP GOAL bottom sheet ── */}
      <AnimatePresence>
        {swapOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="swap-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: dur(0.22) }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              onClick={handleSwapClose}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              key="swap-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="swap-heading"
              initial={{ y: isReduced ? 0 : "100%", opacity: isReduced ? 0 : 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: isReduced ? 0 : "100%", opacity: isReduced ? 0 : 1 }}
              transition={{ duration: dur(0.38), ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-card-border bg-surface px-4 pt-4 pb-10 md:pb-8 max-h-[85dvh] overflow-y-auto"
            >
              {/* Drag handle */}
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-card-border" />

              {/* Sheet header */}
              <div className="mb-5 flex items-center justify-between">
                <h2
                  id="swap-heading"
                  className="font-display font-black text-2xl text-foreground text-balance leading-none"
                >
                  SWAP GOAL
                </h2>
                <button
                  type="button"
                  aria-label="Close swap goal"
                  onClick={handleSwapClose}
                  className={cn(
                    "rounded-lg p-2 text-muted-foreground transition-colors",
                    "hover:bg-foreground/10 hover:text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Goal grid — 3 remaining goals */}
              <div className="grid grid-cols-3 gap-3">
                {swapGoals.map((g) => {
                  const isTentative = swapTentative === g.id;
                  return (
                    <motion.div
                      key={g.id}
                      animate={{ scale: isTentative && !isReduced ? 1.04 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className={cn(
                        "relative flex flex-col overflow-hidden rounded-xl border-2 cursor-pointer transition-colors",
                        isTentative
                          ? "border-primary shadow-[0_0_18px_2px_var(--primary-glow)]"
                          : "border-card-border hover:border-primary/40",
                      )}
                      onClick={() => setSwapTentative(g.id)}
                    >
                      {/* Image */}
                      <div className="relative w-full aspect-square overflow-hidden bg-card">
                        <motion.img
                          src={g.image}
                          alt={g.label}
                          loading="lazy"
                          animate={{ scale: isTentative && !isReduced ? 1.08 : 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 22 }}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />

                        {/* PICK overlay */}
                        <AnimatePresence>
                          {isTentative && (
                            <motion.div
                              key="swap-pick-overlay"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: dur(0.15) }}
                              className="absolute inset-0 flex items-center justify-center bg-background/60"
                            >
                              <motion.button
                                type="button"
                                initial={{ scale: isReduced ? 1 : 0.75, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: isReduced ? 1 : 0.75, opacity: 0 }}
                                transition={{ duration: dur(0.2), ease: [0.16, 1, 0.3, 1] }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSwapPick(g.id);
                                }}
                                className={cn(
                                  "rounded-full px-4 py-2.5",
                                  "font-bold text-base uppercase tracking-widest",
                                  "bg-primary text-white",
                                  "hover:bg-primary/90 active:scale-95 transition-all",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
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
                          "w-full px-2 py-2 transition-colors",
                          isTentative ? "bg-primary/15" : "bg-card",
                        )}
                      >
                        <span
                          className={cn(
                            "block font-semibold text-xs text-center",
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
