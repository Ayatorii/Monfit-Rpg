import { Coins, Sparkles } from "lucide-react";

/**
 * Shared Gold / XP chip pair used across screen headers, so the resource
 * totals always read from whichever shared game state backs the caller.
 */
export default function ResourceBadges({ gold, xp }: { gold: number; xp: number }) {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <div
        role="status"
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-surface border border-surface-border"
        aria-label={`${gold} Gold`}
      >
        <Coins className="h-4 w-4 text-gold" aria-hidden="true" />
        <span className="font-mono text-sm tabular-nums text-gold font-semibold">
          {gold}
        </span>
      </div>
      <div
        role="status"
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-surface border border-surface-border"
        aria-label={`${xp} XP`}
      >
        <Sparkles className="h-4 w-4 text-xp" aria-hidden="true" />
        <span className="font-mono text-sm tabular-nums text-xp font-semibold">
          {xp} XP
        </span>
      </div>
    </div>
  );
}
