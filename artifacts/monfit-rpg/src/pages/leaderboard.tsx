import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Swords } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type RankedPlayer = {
  rank: number;
  walletAddress: string;
  wins: number;
  losses: number;
  draws: number;
  score: number;
  xp: number;
  level: number;
};

type LeaderboardResponse = {
  ranked: RankedPlayer[];
  callerRank: number | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shortenAddress(addr: string): string {
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/** CSS variable colors reusing existing rarity/resource token convention. */
const RANK_STYLES: Record<number, { labelClass: string; accentStyle: React.CSSProperties; badgeClass: string }> = {
  1: {
    labelClass: "text-gold",
    accentStyle: { borderColor: "hsl(var(--gold) / 0.5)", backgroundColor: "hsl(var(--gold) / 0.06)" },
    badgeClass: "text-gold border-gold/40",
  },
  2: {
    labelClass: "text-rarity-rare",
    accentStyle: { borderColor: "hsl(var(--rarity-rare) / 0.5)", backgroundColor: "hsl(var(--rarity-rare) / 0.06)" },
    badgeClass: "text-rarity-rare border-rarity-rare/40",
  },
  3: {
    labelClass: "text-rarity-epic",
    accentStyle: { borderColor: "hsl(var(--rarity-epic) / 0.5)", backgroundColor: "hsl(var(--rarity-epic) / 0.06)" },
    badgeClass: "text-rarity-epic border-rarity-epic/40",
  },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3.5 rounded-lg border border-card-border bg-card"
      aria-hidden="true"
    >
      <div className="w-7 h-4 rounded bg-muted animate-pulse shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="w-36 h-3.5 rounded bg-muted animate-pulse" />
        <div className="w-20 h-3 rounded bg-muted animate-pulse" />
      </div>
      <div className="w-16 h-3.5 rounded bg-muted animate-pulse" />
    </div>
  );
}

// ─── Ranked Row ───────────────────────────────────────────────────────────────

function RankedRow({
  player,
  isCurrentPlayer,
}: {
  player: RankedPlayer;
  isCurrentPlayer: boolean;
}) {
  const rankStyle = RANK_STYLES[player.rank];
  const isTop3 = player.rank <= 3;

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3.5 rounded-lg border transition-colors",
        isCurrentPlayer
          ? "border-primary/40 bg-primary/8"
          : isTop3
          ? "border-card-border bg-card"
          : "border-card-border bg-card",
      )}
      style={isTop3 && !isCurrentPlayer ? rankStyle?.accentStyle : undefined}
      role="row"
      aria-label={`Rank ${player.rank}: ${shortenAddress(player.walletAddress)}, Level ${player.level}, ${player.wins} wins, ${player.losses} losses, score ${player.score}`}
    >
      {/* Rank number */}
      <span
        className={cn(
          "font-display font-black text-lg w-7 shrink-0 tabular-nums leading-none",
          isTop3 ? rankStyle?.labelClass : "text-muted-foreground",
        )}
        aria-hidden="true"
      >
        {player.rank}
      </span>

      {/* Identity */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-foreground truncate">
            {shortenAddress(player.walletAddress)}
          </span>
          {isCurrentPlayer && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-text bg-primary/15 border border-primary/30 rounded px-1.5 py-0.5 shrink-0">
              You
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          Lv.{player.level} · {player.wins}W / {player.losses}L
          {player.draws > 0 ? ` / ${player.draws}D` : ""}
        </span>
      </div>

      {/* Score */}
      <div className="flex flex-col items-end shrink-0">
        <span
          className={cn(
            "font-display font-bold text-base tabular-nums",
            player.score > 0
              ? "text-foreground"
              : player.score < 0
              ? "text-muted-foreground"
              : "text-muted-foreground",
          )}
        >
          {player.score > 0 ? `+${player.score}` : player.score}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">score</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  // No wallet auth yet — leaderboard shows empty state until a future
  // re-implementation wires up the database and auth.
  const data: LeaderboardResponse = { ranked: [], callerRank: null };
  const isLoading = false;
  const error: string | null = null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex flex-col gap-1"
      >
        <h1 className="font-display font-black text-3xl text-white uppercase tracking-tight">
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Top fighters this season — ranked by Arena score
        </p>

        {/* Current player callout */}
        {!isLoading && data && data.callerRank !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
            className="mt-2 inline-flex items-center gap-2 self-start rounded-lg border border-primary/30 bg-primary/10 px-3 py-2"
          >
            <Trophy className="h-4 w-4 text-primary-text shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-primary-text">
              You&rsquo;re ranked <span className="font-black">#{data.callerRank}</span>
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <section aria-label="Ranked players" aria-busy={isLoading}>
        {isLoading && (
          <div
            role="status"
            aria-label="Loading leaderboard"
            className="flex flex-col gap-2"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-5 text-center">
            <p className="text-sm text-destructive font-medium">
              Failed to load leaderboard — please try refreshing the page.
            </p>
          </div>
        )}

        {!isLoading && !error && data && data.ranked.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-4 rounded-lg border border-card-border bg-card px-6 py-10 text-center"
          >
            <Swords className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <p className="font-display font-bold text-lg text-foreground">
                No battles fought yet
              </p>
              <p className="text-sm text-muted-foreground">
                Be the first to enter the Arena and claim a spot on the board.
              </p>
            </div>
            <Link
              href="/arena"
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-5 py-2.5",
                "font-display font-bold text-base text-primary-text uppercase tracking-wide",
                "transition-colors hover:bg-primary/15",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              <Swords className="h-4 w-4" aria-hidden="true" />
              Go to Arena
            </Link>
          </motion.div>
        )}

        {!isLoading && !error && data && data.ranked.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            role="table"
            aria-label="Arena leaderboard"
            className="flex flex-col gap-2"
          >
            {data.ranked.map((player) => (
              <RankedRow
                key={player.walletAddress}
                player={player}
                isCurrentPlayer={false}
              />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
