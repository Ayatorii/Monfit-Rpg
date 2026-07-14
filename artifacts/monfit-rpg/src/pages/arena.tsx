import { useState, useEffect, useRef, useReducer } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Swords, Shield, Zap, Heart, ChevronLeft, Trophy, SkullIcon } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { calcPlayerStats } from "@/lib/playerStats";
import {
  NPC_OPPONENTS,
  DIFFICULTY_TEXT_CLASS,
  DIFFICULTY_COLOR_VAR,
  type NpcOpponent,
} from "@/data/npcOpponents";
import { simulateBattle, type BattleLog, type RoundEvent } from "@/lib/simulateBattle";
import ResourceBadges from "@/components/ResourceBadges";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const ROUND_REVEAL_MS = 850;

// ─── HP Bar ──────────────────────────────────────────────────────────────────

function HpBar({
  current,
  max,
  label,
  colorClass,
}: {
  current: number;
  max: number;
  label: string;
  colorClass: string;
}) {
  const pct = max > 0 ? Math.max(0, current / max) : 0;
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <span className="text-xs font-mono text-foreground tabular-nums">
          {Math.max(0, current)}/{max}
        </span>
      </div>
      <div
        className="h-2 rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.max(0, current)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label} HP: ${Math.max(0, current)} of ${max}`}
      >
        <div
          className={cn("h-full rounded-full origin-left transition-transform duration-500 ease-out", colorClass)}
          style={{ transform: `scaleX(${pct})` }}
        />
      </div>
    </div>
  );
}

// ─── Stat Chip ────────────────────────────────────────────────────────────────

function StatChip({ icon: Icon, label, value }: { icon: React.FC<React.SVGProps<SVGSVGElement>>; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-bold text-foreground tabular-nums">{value}</span>
    </div>
  );
}

// ─── Opponent Card ────────────────────────────────────────────────────────────

function OpponentCard({
  npc,
  onFight,
}: {
  npc: NpcOpponent;
  onFight: (npc: NpcOpponent) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onFight(npc)}
      aria-label={`Challenge ${npc.name} — ${npc.difficulty} difficulty`}
      className={cn(
        "w-full min-h-11 text-left rounded-lg border border-card-border bg-card p-4 flex flex-col gap-3",
        "transition-colors hover:border-primary/40 hover:bg-card",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-display font-black text-xl text-white leading-none">
            {npc.name}
          </span>
          <span
            className={cn("text-xs font-semibold uppercase tracking-widest", DIFFICULTY_TEXT_CLASS[npc.difficulty])}
          >
            {npc.difficulty}
          </span>
        </div>
        <div
          className="flex items-center justify-center rounded border w-9 h-9 shrink-0"
          style={{
            borderColor: DIFFICULTY_COLOR_VAR[npc.difficulty],
            color: DIFFICULTY_COLOR_VAR[npc.difficulty],
          }}
          aria-hidden="true"
        >
          <Swords className="h-4 w-4" />
        </div>
      </div>

      {/* Flavor text */}
      <p className="text-sm text-muted-foreground leading-snug">{npc.flavor}</p>

      {/* Stats row */}
      <div className="flex items-center gap-4 border-t border-card-border pt-3">
        <StatChip icon={Swords} label="STR" value={npc.STR} />
        <StatChip icon={Zap} label="AGI" value={npc.AGI} />
        <StatChip icon={Heart} label="VIT" value={npc.VIT} />
        <div className="ml-auto text-xs font-semibold text-primary-text">
          Challenge →
        </div>
      </div>
    </button>
  );
}

// ─── Battle View ──────────────────────────────────────────────────────────────

function BattleView({
  npc,
  log,
  onDone,
}: {
  npc: NpcOpponent;
  log: BattleLog;
  onDone: () => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const [revealCount, setRevealCount] = useState(reduced ? log.events.length : 0);
  const logRef = useRef<HTMLDivElement>(null);

  // Live HP tracking as events are revealed
  const visibleEvents = log.events.slice(0, revealCount);
  let playerHp = log.playerHpMax;
  let npcHp = log.npcHpMax;
  for (const evt of visibleEvents) {
    if (evt.actor === "player") {
      npcHp = evt.targetHpAfter;
    } else {
      playerHp = evt.targetHpAfter;
    }
  }

  useEffect(() => {
    if (reduced || revealCount >= log.events.length) return;
    const id = setTimeout(() => setRevealCount((n) => n + 1), ROUND_REVEAL_MS);
    return () => clearTimeout(id);
  }, [revealCount, log.events.length, reduced]);

  // Scroll log into view as it grows
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [revealCount]);

  const done = revealCount >= log.events.length;

  return (
    <div className="flex flex-col gap-6">
      {/* HP bars */}
      <div className="rounded-lg border border-card-border bg-card px-4 py-4 flex flex-col gap-4">
        <HpBar
          current={playerHp}
          max={log.playerHpMax}
          label="You"
          colorClass="bg-xp"
        />
        <HpBar
          current={npcHp}
          max={log.npcHpMax}
          label={npc.name}
          colorClass="bg-destructive"
        />
      </div>

      {/* Battle log */}
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label="Battle log"
        aria-atomic="false"
        className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1"
      >
        <AnimatePresence initial={false}>
          {visibleEvents.map((evt, i) => (
            <BattleEventRow key={i} event={evt} npcName={npc.name} reduced={reduced} />
          ))}
        </AnimatePresence>

        {!done && !reduced && (
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
            <motion.span
              className="inline-block h-1.5 w-1.5 rounded-full bg-primary-text"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              aria-hidden="true"
            />
            Fighting…
          </div>
        )}
      </div>

      {/* Continue */}
      {done && (
        <motion.button
          type="button"
          onClick={onDone}
          initial={reduced ? {} : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "w-full min-h-11 rounded-lg border border-primary/40 bg-primary/10 px-5 py-3",
            "font-display font-bold text-lg text-primary-text uppercase tracking-wide",
            "transition-colors hover:bg-primary/15",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          See Result →
        </motion.button>
      )}
    </div>
  );
}

// ─── Battle Event Row ─────────────────────────────────────────────────────────

function BattleEventRow({
  event,
  npcName,
  reduced,
}: {
  event: RoundEvent;
  npcName: string;
  reduced: boolean;
}) {
  const isPlayer = event.actor === "player";
  const actorLabel = isPlayer ? "You" : npcName;
  const targetLabel = isPlayer ? npcName : "You";

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, x: isPlayer ? -6 : 6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
        isPlayer ? "bg-muted/30" : "bg-destructive/10",
      )}
    >
      <span className={cn("font-semibold shrink-0", isPlayer ? "text-xp" : "text-destructive")}>
        {actorLabel}
      </span>
      {event.action === "dodge" ? (
        <span className="text-muted-foreground flex-1">
          attacked — <span className="font-semibold text-rarity-common">dodged</span> by {targetLabel}
        </span>
      ) : (
        <span className="text-muted-foreground flex-1">
          hit {targetLabel} for{" "}
          <span className="font-bold text-foreground tabular-nums">{event.damage}</span> dmg
          {" "}
          <span className="text-xs tabular-nums text-muted-foreground">
            ({Math.max(0, event.targetHpAfter)} HP left)
          </span>
        </span>
      )}
      <span className="text-xs text-muted-foreground shrink-0">R{event.round}</span>
    </motion.div>
  );
}

// ─── Result View ──────────────────────────────────────────────────────────────

function ResultView({
  npc,
  log,
  onFightAgain,
  onBack,
}: {
  npc: NpcOpponent;
  log: BattleLog;
  onFightAgain: () => void;
  onBack: () => void;
}) {
  const { result, rewards, playerHpFinal, npcHpFinal, playerHpMax, npcHpMax } = log;
  const reduced = useReducedMotion() ?? false;

  const bannerConfig = {
    win: {
      label: "Victory",
      sublabel: "You defeated " + npc.name,
      icon: Trophy,
      colorClass: "text-gold",
      borderClass: "border-gold/30 bg-gold/5",
    },
    loss: {
      label: "Defeated",
      sublabel: npc.name + " won this round",
      icon: SkullIcon,
      colorClass: "text-destructive",
      borderClass: "border-destructive/30 bg-destructive/5",
    },
    draw: {
      label: "Draw",
      sublabel: "Both fighters stood their ground",
      icon: Shield,
      colorClass: "text-rarity-rare",
      borderClass: "border-rarity-rare/30 bg-rarity-rare/5",
    },
  }[result];

  const BannerIcon = bannerConfig.icon;

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-5"
    >
      {/* Banner */}
      <div
        className={cn("rounded-lg border px-5 py-5 flex flex-col items-center gap-2 text-center", bannerConfig.borderClass)}
        role="status"
        aria-label={`Battle result: ${bannerConfig.label}`}
      >
        <BannerIcon className={cn("h-8 w-8", bannerConfig.colorClass)} aria-hidden="true" />
        <div>
          <p className={cn("font-display font-black text-3xl leading-none", bannerConfig.colorClass)}>
            {bannerConfig.label}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{bannerConfig.sublabel}</p>
        </div>
      </div>

      {/* Final HP */}
      <div className="rounded-lg border border-card-border bg-card px-4 py-4 flex flex-col gap-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Final HP</span>
        <HpBar current={playerHpFinal} max={playerHpMax} label="You" colorClass="bg-xp" />
        <HpBar current={npcHpFinal} max={npcHpMax} label={npc.name} colorClass="bg-destructive" />
      </div>

      {/* Rewards */}
      {result === "win" && (
        <div className="rounded-lg border border-card-border bg-card px-4 py-4 flex items-center gap-6">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rewards</span>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-gold tabular-nums">+{rewards.gold}</span>
              <span className="text-xs text-muted-foreground">Gold</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-xp tabular-nums">+{rewards.xp}</span>
              <span className="text-xs text-muted-foreground">XP</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onFightAgain}
          className={cn(
            "w-full min-h-11 rounded-lg border border-primary/40 bg-primary/10 px-5 py-3",
            "font-display font-bold text-lg text-primary-text uppercase tracking-wide",
            "transition-colors hover:bg-primary/15",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          Fight Again
        </button>
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "w-full min-h-11 rounded-lg border border-card-border bg-card px-5 py-3",
            "font-display font-bold text-lg text-muted-foreground uppercase tracking-wide",
            "transition-colors hover:border-muted-foreground/40 hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          ← Back to Roster
        </button>
      </div>
    </motion.div>
  );
}

// ─── Player Stats Bar ─────────────────────────────────────────────────────────

function PlayerStatsBar({ STR, AGI, VIT }: { STR: number; AGI: number; VIT: number }) {
  return (
    <div className="rounded-lg border border-card-border bg-card px-4 py-3 flex items-center gap-6">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">Your Stats</span>
      <div className="flex items-center gap-4 ml-auto">
        <StatChip icon={Swords} label="STR" value={STR} />
        <StatChip icon={Zap} label="AGI" value={AGI} />
        <StatChip icon={Heart} label="VIT" value={VIT} />
      </div>
    </div>
  );
}

// ─── Main Arena Page ──────────────────────────────────────────────────────────

type ArenaView = "roster" | "battle" | "result";

export default function ArenaPage() {
  const { gold, xp, equippedItems, addGold, addXp, addMatchResult } = useGame();
  const [view, setView] = useState<ArenaView>("roster");
  const [selectedNpc, setSelectedNpc] = useState<NpcOpponent | null>(null);
  const [battleLog, setBattleLog] = useState<BattleLog | null>(null);

  const playerStats = calcPlayerStats(equippedItems);

  function handleFight(npc: NpcOpponent) {
    const log = simulateBattle(
      playerStats,
      { STR: npc.STR, AGI: npc.AGI, VIT: npc.VIT },
      { gold: npc.rewardGold, xp: npc.rewardXp },
    );
    setSelectedNpc(npc);
    setBattleLog(log);
    setView("battle");
  }

  function handleBattleDone() {
    setView("result");
    // Apply rewards + record history when result is shown
    if (battleLog && selectedNpc) {
      if (battleLog.result === "win") {
        addGold(battleLog.rewards.gold);
        addXp(battleLog.rewards.xp);
      }
      addMatchResult({
        opponentId: selectedNpc.id,
        opponentName: selectedNpc.name,
        result: battleLog.result,
        date: Date.now(),
      });
    }
  }

  function handleFightAgain() {
    if (!selectedNpc) return;
    const log = simulateBattle(
      playerStats,
      { STR: selectedNpc.STR, AGI: selectedNpc.AGI, VIT: selectedNpc.VIT },
      { gold: selectedNpc.rewardGold, xp: selectedNpc.rewardXp },
    );
    setBattleLog(log);
    setView("battle");
  }

  function handleBack() {
    setView("roster");
    setSelectedNpc(null);
    setBattleLog(null);
  }

  const pageTitle =
    view === "roster"
      ? "Arena"
      : view === "battle"
        ? `vs. ${selectedNpc?.name ?? ""}`
        : selectedNpc?.name ?? "Result";

  const pageSubtitle =
    view === "roster"
      ? "Challenge an opponent. Equip your best gear first."
      : view === "battle"
        ? `${selectedNpc?.difficulty ?? ""} — fight in progress`
        : `${selectedNpc?.difficulty ?? ""} — battle complete`;

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-10 max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {view !== "roster" && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Back to opponent roster"
              className={cn(
                "flex items-center justify-center h-11 w-11 rounded-lg border border-card-border bg-card transition-colors hover:border-muted-foreground/40",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </button>
          )}
          <div>
            <h1 className="font-display font-black text-3xl md:text-4xl text-white leading-none">
              {pageTitle}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">{pageSubtitle}</p>
          </div>
        </div>
        <ResourceBadges gold={gold} xp={xp} />
      </header>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === "roster" && (
          <motion.div
            key="roster"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            {/* Player stats for comparison */}
            <PlayerStatsBar {...playerStats} />

            {/* NPC list */}
            <section aria-labelledby="roster-heading">
              <h2
                id="roster-heading"
                className="font-display font-bold text-sm text-muted-foreground uppercase tracking-widest mb-3"
              >
                Opponents
              </h2>
              <div className="flex flex-col gap-3">
                {NPC_OPPONENTS.map((npc) => (
                  <OpponentCard key={npc.id} npc={npc} onFight={handleFight} />
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {view === "battle" && selectedNpc && battleLog && (
          <motion.div
            key="battle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <BattleView npc={selectedNpc} log={battleLog} onDone={handleBattleDone} />
          </motion.div>
        )}

        {view === "result" && selectedNpc && battleLog && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <ResultView
              npc={selectedNpc}
              log={battleLog}
              onFightAgain={handleFightAgain}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
