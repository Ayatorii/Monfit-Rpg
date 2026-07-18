import { Coins, Sparkles } from "lucide-react";

/**
 * Shared Gold / XP chip pair used across screen headers, so the resource
 * totals always read from whichever shared game state backs the caller.
 */
export default function ResourceBadges({ gold, xp }: { gold: number; xp: number }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div
        role="status"
        className="flex items-center gap-1 sm:gap-1.5 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 bg-surface border border-surface-border"
        aria-label={`${gold} Gold`}
      >
        <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gold" aria-hidden="true" />
        <span className="font-mono text-xs sm:text-sm tabular-nums text-gold font-semibold">
          {gold}
        </span>
      </div>
      <div
        role="status"
        className="flex items-center gap-1 sm:gap-1.5 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 bg-surface border border-surface-border"
        aria-label={`${xp} XP`}
      >
        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-xp" aria-hidden="true" />
        <span className="font-mono text-xs sm:text-sm tabular-nums text-xp font-semibold">
          {xp}<span className="hidden sm:inline"> XP</span>
        </span>
      </div>
    </div>
  );
}
