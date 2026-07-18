import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { useAccount, usePublicClient } from "wagmi";
import { parseAbi } from "viem";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TROPHY_CONTRACT_ADDRESS = import.meta.env
  .VITE_TROPHY_CONTRACT_ADDRESS as `0x${string}` | undefined;

const TROPHY_ABI = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function getTrophyData(uint256 tokenId) view returns (uint256 season, uint8 rank)",
]);

// ─── Types ────────────────────────────────────────────────────────────────────

interface OwnedTrophy {
  tokenId: bigint;
  season: bigint;
  rank: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rankLabel(rank: number): string {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `${rank}th`;
}

const RANK_STYLES: Record<
  number,
  { labelClass: string; accentStyle: React.CSSProperties }
> = {
  1: {
    labelClass: "text-gold",
    accentStyle: {
      borderColor: "hsl(var(--gold) / 0.5)",
      backgroundColor: "hsl(var(--gold) / 0.06)",
    },
  },
  2: {
    labelClass: "text-rarity-rare",
    accentStyle: {
      borderColor: "hsl(var(--rarity-rare) / 0.5)",
      backgroundColor: "hsl(var(--rarity-rare) / 0.06)",
    },
  },
  3: {
    labelClass: "text-rarity-epic",
    accentStyle: {
      borderColor: "hsl(var(--rarity-epic) / 0.5)",
      backgroundColor: "hsl(var(--rarity-epic) / 0.06)",
    },
  },
};

// ─── Trophy Skeleton ──────────────────────────────────────────────────────────

function TrophySkeleton() {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-card-border bg-card"
      aria-hidden="true"
    >
      <div className="w-5 h-5 rounded bg-muted animate-pulse shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="w-36 h-3.5 rounded bg-muted animate-pulse" />
        <div className="w-24 h-3 rounded bg-muted animate-pulse" />
      </div>
      <div className="w-10 h-4 rounded bg-muted animate-pulse" />
    </div>
  );
}

// ─── Trophy Card ──────────────────────────────────────────────────────────────

function TrophyCard({ trophy }: { trophy: OwnedTrophy }) {
  const rankStyle = RANK_STYLES[trophy.rank] ?? RANK_STYLES[3];
  const isTop3 = trophy.rank <= 3;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border",
        isTop3 ? "" : "border-card-border bg-card",
      )}
      style={isTop3 ? rankStyle.accentStyle : undefined}
      role="listitem"
      aria-label={`Season ${trophy.season} trophy, ${rankLabel(trophy.rank)} place`}
    >
      <Medal
        className={cn(
          "h-5 w-5 shrink-0",
          isTop3 ? rankStyle.labelClass : "text-muted-foreground",
        )}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground">
          Season {trophy.season.toString()} Trophy
        </span>
        <span className="text-xs text-muted-foreground">
          {rankLabel(trophy.rank)} place · Token #{trophy.tokenId.toString()}
        </span>
      </div>
      <span
        className={cn(
          "text-sm font-display font-black tabular-nums shrink-0",
          isTop3 ? rankStyle.labelClass : "text-muted-foreground",
        )}
        aria-hidden="true"
      >
        #{rankLabel(trophy.rank)}
      </span>
    </div>
  );
}

// ─── My Trophies ──────────────────────────────────────────────────────────────

/**
 * Reads the connected wallet's SeasonTrophy NFTs directly from the Monad
 * Testnet contract via viem — no backend proxy needed for this read.
 * Renders nothing when VITE_TROPHY_CONTRACT_ADDRESS is not set.
 */
export default function MyTrophies() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [trophies, setTrophies] = useState<OwnedTrophy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address || !TROPHY_CONTRACT_ADDRESS || !publicClient) {
      setTrophies([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const balance = await publicClient.readContract({
          address: TROPHY_CONTRACT_ADDRESS,
          abi: TROPHY_ABI,
          functionName: "balanceOf",
          args: [address],
        });

        if (balance === 0n) {
          if (!cancelled) {
            setTrophies([]);
            setIsLoading(false);
          }
          return;
        }

        const tokenIds = await Promise.all(
          Array.from({ length: Number(balance) }, (_, i) =>
            publicClient.readContract({
              address: TROPHY_CONTRACT_ADDRESS!,
              abi: TROPHY_ABI,
              functionName: "tokenOfOwnerByIndex",
              args: [address, BigInt(i)],
            }),
          ),
        );

        const results = await Promise.all(
          tokenIds.map((tokenId) =>
            publicClient
              .readContract({
                address: TROPHY_CONTRACT_ADDRESS!,
                abi: TROPHY_ABI,
                functionName: "getTrophyData",
                args: [tokenId],
              })
              .then(([season, rank]) => ({
                tokenId,
                season,
                rank: Number(rank),
              })),
          ),
        );

        if (!cancelled) {
          setTrophies(results);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load trophies from chain");
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, isConnected, publicClient]);

  // Contract not configured — feature disabled
  if (!TROPHY_CONTRACT_ADDRESS) return null;

  // Wallet not connected
  if (!isConnected) {
    return (
      <section aria-label="My Trophies" className="flex flex-col gap-3">
        <h2 className="font-display font-black text-xl text-foreground text-balance uppercase tracking-tight">
          My Trophies
        </h2>
        <div className="rounded-lg border border-card-border bg-card px-4 py-5 text-center">
          <p className="text-sm text-muted-foreground text-pretty">
            Connect your wallet to see your Season Trophies.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="My Trophies" className="flex flex-col gap-3">
      <h2 className="font-display font-black text-xl text-foreground text-balance uppercase tracking-tight flex items-center gap-2">
        <Trophy className="h-5 w-5 text-gold" aria-hidden="true" />
        My Trophies
      </h2>

      {isLoading && (
        <div role="status" aria-label="Loading trophies" className="flex flex-col gap-2">
          <TrophySkeleton />
          <TrophySkeleton />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-4">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {!isLoading && !error && trophies.length === 0 && (
        <div className="rounded-lg border border-card-border bg-card px-4 py-5 text-center">
          <p className="text-sm text-muted-foreground text-pretty">
            No trophies yet — climb the Arena leaderboard to earn one.
          </p>
        </div>
      )}

      {!isLoading && !error && trophies.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-2"
          role="list"
          aria-label="Owned season trophies"
        >
          {trophies.map((trophy) => (
            <TrophyCard key={trophy.tokenId.toString()} trophy={trophy} />
          ))}
        </motion.div>
      )}
    </section>
  );
}
