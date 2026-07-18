import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGame } from "@/lib/game-context";
import ResourceBadges from "@/components/ResourceBadges";
import imgGreatWarrior from "@assets/GREAT_WARRIOR_1784377084917.png";
import imgTaskMaster from "@assets/TASK_MASTER_1784377084918.png";
import imgWalletConnector from "@assets/WALLET_CONNECTOR_1784377084919.png";

// ── Types ─────────────────────────────────────────────────────────────────────

type BadgeStatus = {
  type: 0 | 1 | 2;
  name: string;
  eligible: boolean;
  minted: boolean;
  progress: { current: number; needed: number };
};

type BadgesResponse = { badges: BadgeStatus[] };

// ── Static badge metadata ─────────────────────────────────────────────────────

const BADGE_IMAGES: Record<number, string> = {
  0: imgWalletConnector,
  1: imgTaskMaster,
  2: imgGreatWarrior,
};

const BADGE_DESCRIPTIONS: Record<number, string> = {
  0: "Connect your wallet and sign in to MONFIT RPG.",
  1: "Complete 100 daily training quests.",
  2: "Fight 100 battles in the Arena.",
};

// ── Tooltip (keyboard + hover accessible) ────────────────────────────────────

function ProgressTooltip({
  badge,
  children,
}: {
  badge: BadgeStatus;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = `badge-tooltip-${badge.type}`;

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  // Percent progress capped at 100
  const pct = Math.min(
    Math.round((badge.progress.current / badge.progress.needed) * 100),
    100,
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
      onFocus={() => setOpen(true)}
      onBlur={scheduleClose}
    >
      {children}

      {/* Tooltip */}
      <div
        id={tooltipId}
        role="tooltip"
        aria-hidden={!open}
        className={cn(
          "absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3",
          "w-44 sm:w-56 rounded-lg border border-card-border px-3 py-2.5",
          "flex flex-col gap-2 pointer-events-none select-none",
          "transition-opacity duration-150",
          open ? "opacity-100" : "opacity-0",
        )}
        style={{ backgroundColor: "hsl(var(--card))" }}
      >
        <p className="text-xs font-semibold text-foreground leading-snug">
          {BADGE_DESCRIPTIONS[badge.type]}
        </p>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-mono">
              {badge.progress.current}/{badge.progress.needed}
            </span>
          </div>
          {/* scaleX progress bar — never width animation */}
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: "hsl(var(--card-border))" }}
          >
            <div
              className="h-full rounded-full origin-left"
              style={{
                backgroundColor: "hsl(var(--primary))",
                transform: `scaleX(${pct / 100})`,
                transition: "transform 0.4s ease-out",
              }}
            />
          </div>
        </div>
        {/* Caret */}
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 -mt-px"
          aria-hidden="true"
          style={{
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid hsl(var(--card-border))",
          }}
        />
      </div>
    </div>
  );
}

// ── Single badge card ─────────────────────────────────────────────────────────

function BadgeCard({
  badge,
  onMint,
}: {
  badge: BadgeStatus;
  onMint: (type: number) => Promise<void>;
}) {
  const [minting, setMinting] = useState(false);
  const isReduced = useReducedMotion() ?? false;

  const handleMint = async () => {
    if (minting) return;
    setMinting(true);
    try {
      await onMint(badge.type);
    } finally {
      setMinting(false);
    }
  };

  const state: "locked" | "unlocked" | "minted" = badge.minted
    ? "minted"
    : badge.eligible
      ? "unlocked"
      : "locked";

  const cardContent = (
    <div
      className={cn(
        "h-full flex flex-col items-center gap-4 rounded-xl border border-card-border px-5 py-6 text-center transition-all",
        state === "locked" ? "bg-card opacity-70" : "",
      )}
      style={
        state !== "locked"
          ? { backgroundColor: "hsl(var(--primary) / 0.08)" }
          : { backgroundColor: "hsl(var(--card))" }
      }
    >
      {/* Badge image */}
      <div className="relative">
        <img
          src={BADGE_IMAGES[badge.type]}
          alt={badge.name}
          className={cn(
            "h-28 w-28 object-contain",
            state === "locked" && "grayscale",
          )}
          loading="lazy"
        />
      </div>

      {/* Name */}
      <h2 className="text-base font-bold uppercase tracking-wide text-foreground leading-tight">
        {badge.name}
      </h2>

      {/* State indicator / action — mt-auto keeps all states on the same baseline */}
      {state === "minted" && (
        <span className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          Minted
        </span>
      )}

      {state === "unlocked" && (
        <button
          type="button"
          onClick={handleMint}
          disabled={minting}
          aria-label={`Mint ${badge.name} badge`}
          aria-busy={minting}
          className={cn(
            "mt-auto min-h-[44px] w-full rounded-lg border border-primary bg-primary px-4 py-2.5",
            "text-sm font-bold uppercase tracking-wide text-primary-text",
            "transition-all hover:brightness-110 active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:pointer-events-none disabled:opacity-60",
            "flex items-center justify-center gap-2",
          )}
        >
          {minting ? (
            <>
              <Loader2
                className="h-4 w-4 shrink-0 animate-spin"
                style={{ animationTimingFunction: "linear" }}
                aria-hidden="true"
              />
              Minting…
            </>
          ) : (
            "Mint"
          )}
        </button>
      )}

      {state === "locked" && (
        <span className="mt-auto text-xs text-muted-foreground/80 leading-snug">
          Locked
        </span>
      )}
    </div>
  );

  if (state === "locked") {
    return (
      <ProgressTooltip badge={badge}>
        <div
          tabIndex={0}
          role="group"
          aria-label={`${badge.name} — locked. ${badge.progress.current}/${badge.progress.needed}`}
          aria-describedby={`badge-tooltip-${badge.type}`}
          className="h-full cursor-default rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {cardContent}
        </div>
      </ProgressTooltip>
    );
  }

  return (
    <motion.div
      className="h-full"
      initial={isReduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {cardContent}
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BadgesPage() {
  const { gold, xp } = useGame();
  const [badges, setBadges] = useState<BadgeStatus[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mintResult, setMintResult] = useState<{
    type: number;
    txHash: string;
  } | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/badges/status");
      if (!res.ok) throw new Error(await res.text());
      const data: BadgesResponse = await res.json();
      setBadges(data.badges);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMint = async (badgeType: number) => {
    setMintResult(null);
    const res = await fetch("/api/badges/mint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ badgeType }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error ?? res.statusText);
    }

    const data = await res.json();
    setMintResult({ type: badgeType, txHash: data.txHash });

    // Refresh badge states so the card flips to "minted"
    await load();
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <ResourceBadges gold={gold} xp={xp} />

      <header className="mt-6 mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
          Badges
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          On-chain achievement badges minted to your wallet on Monad Testnet.
        </p>
      </header>

      {error && (
        <div
          className="mb-6 rounded-lg border border-card-border bg-card px-4 py-3 text-sm text-foreground"
          role="alert"
        >
          Could not load badges: {error}
        </div>
      )}

      {mintResult && (
        <div
          className="mb-6 rounded-lg border border-primary/40 px-4 py-3 text-sm"
          style={{ backgroundColor: "hsl(var(--primary) / 0.08)" }}
          role="status"
          aria-live="polite"
        >
          <span className="font-semibold text-foreground">Badge minted!</span>
          <span className="text-muted-foreground"> Tx: </span>
          <a
            href={`https://testnet.monadexplorer.com/tx/${mintResult.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-primary underline break-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background rounded"
          >
            {mintResult.txHash}
          </a>
        </div>
      )}

      {badges === null && !error ? (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(10rem, 1fr))" }}
          aria-busy="true"
          aria-label="Loading badges"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-card-border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : badges ? (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(10rem, 1fr))" }}
          role="list"
          aria-label="Achievement badges"
        >
          {badges.map((badge) => (
            <div key={badge.type} role="listitem" className="h-full">
              <BadgeCard badge={badge} onMint={handleMint} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
