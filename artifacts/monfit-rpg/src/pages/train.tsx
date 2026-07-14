import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Sparkles, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { GOALS, PROGRAMS, DAILY_QUESTS, type Goal } from "@/data/train-data";

export default function TrainPage() {
  const { toast } = useToast();
  const [goal, setGoal] = useState<Goal>("muscle");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [gold, setGold] = useState(0);
  const [xp, setXp] = useState(0);

  const programs = useMemo(() => PROGRAMS[goal], [goal]);

  const toggleQuest = (id: string, questGold: number, questXp: number, label: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setGold((g) => Math.max(0, g - questGold));
        setXp((x) => Math.max(0, x - questXp));
      } else {
        next.add(id);
        setGold((g) => g + questGold);
        setXp((x) => x + questXp);
        toast({
          title: `Quest complete: ${label}`,
          description: `+${questGold} Gold, +${questXp} XP`,
        });
      }
      return next;
    });
  };

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-10 max-w-3xl mx-auto">
      {/* Header — Gold / XP totals */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white leading-none">
            Train
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pick a goal, follow a program, complete your daily quests.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-surface border border-surface-border"
            aria-label={`${gold} Gold`}
          >
            <Coins className="h-4 w-4 text-gold" aria-hidden="true" />
            <span className="font-mono text-sm tabular-nums text-gold font-semibold">
              {gold}
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-surface border border-surface-border"
            aria-label={`${xp} XP`}
          >
            <Sparkles className="h-4 w-4 text-xp" aria-hidden="true" />
            <span className="font-mono text-sm tabular-nums text-xp font-semibold">
              {xp} XP
            </span>
          </div>
        </div>
      </header>

      {/* Goal selection */}
      <section aria-labelledby="goal-heading" className="mb-10">
        <h2
          id="goal-heading"
          className="font-display font-bold text-lg text-white mb-3 uppercase tracking-wide"
        >
          Your Goal
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {GOALS.map((g) => {
            const Icon = g.icon;
            const isSelected = goal === g.id;
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setGoal(g.id)}
                className={cn(
                  "flex flex-col items-start gap-2.5 rounded-lg border bg-card px-4 py-4 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isSelected
                    ? "border-primary"
                    : "border-card-border hover:border-primary/40",
                )}
                style={
                  isSelected
                    ? {
                        boxShadow:
                          "0 0 0 1px hsl(var(--primary)), 0 0 20px -4px hsl(var(--primary) / 0.55)",
                      }
                    : undefined
                }
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isSelected ? "text-primary" : "text-muted-foreground",
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "font-semibold text-sm",
                    isSelected ? "text-white" : "text-foreground",
                  )}
                >
                  {g.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Suggested programs */}
      <section aria-labelledby="programs-heading" className="mb-10">
        <h2
          id="programs-heading"
          className="font-display font-bold text-lg text-white mb-3 uppercase tracking-wide"
        >
          Suggested Programs
        </h2>
        <div className="flex flex-col gap-3">
          {programs.map((p) => (
            <div
              key={p.name}
              className="rounded-lg border border-card-border bg-card px-4 py-4"
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <h3 className="font-semibold text-white text-sm">{p.name}</h3>
                <span className="font-mono text-xs text-primary shrink-0 whitespace-nowrap">
                  {p.meta}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Daily quests */}
      <section aria-labelledby="quests-heading">
        <h2
          id="quests-heading"
          className="font-display font-bold text-lg text-white mb-3 uppercase tracking-wide"
        >
          Daily Quests
        </h2>
        <div className="flex flex-col gap-2.5">
          {DAILY_QUESTS.map((q) => {
            const isDone = completed.has(q.id);
            return (
              <button
                key={q.id}
                type="button"
                role="checkbox"
                aria-checked={isDone}
                aria-label={`${q.label} — ${isDone ? "completed" : `mark complete for +${q.gold} Gold, +${q.xp} XP`}`}
                onClick={() => toggleQuest(q.id, q.gold, q.xp, q.label)}
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
                    isDone
                      ? "text-muted-foreground line-through"
                      : "text-foreground",
                  )}
                >
                  {q.label}
                </span>
                {isDone ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-1 text-primary shrink-0"
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </motion.span>
                ) : (
                  <span className="text-xs font-mono text-muted-foreground shrink-0 whitespace-nowrap">
                    +{q.gold} Gold, +{q.xp} XP
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
