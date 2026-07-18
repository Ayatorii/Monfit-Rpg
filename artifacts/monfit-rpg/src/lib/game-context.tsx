import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { LOOT_TABLE, type LootItem, type Slot } from "@/data/lootTable";
import { type Goal, GOALS } from "@/data/train-data";
import { useAuth } from "@/lib/auth-context";
import {
  getMyPlayer,
  adjustMyPlayer,
  addMyPlayerItem,
  listMyPlayerItems,
  updateMyPlayerItem,
  updateMyPlayerGoal,
  recordArenaMatch,
  sellMyPlayerItem,
} from "@workspace/api-client-react";
import type { PlayerItem } from "@workspace/api-client-react";

const VALID_GOALS = new Set<string>(GOALS.map((g) => g.id));

export type OwnedItem = LootItem & {
  instanceId: string;
  obtainedAt: number;
};

export type EquippedItems = Partial<Record<Slot, OwnedItem>>;

export type MatchRecord = {
  opponentId: string;
  opponentName: string;
  result: "win" | "loss" | "draw";
  date: number;
  xpEarned: number;
  goldEarned: number;
};

type GameContextValue = {
  gold: number;
  xp: number;
  inventory: OwnedItem[];
  equippedItems: EquippedItems;
  matchHistory: MatchRecord[];
  isSyncing: boolean;
  /** The player's currently selected training goal. Persists across navigation; synced to DB for connected wallets. */
  selectedGoal: Goal | null;
  /** Set the active training goal. Persists to the DB for connected wallets. */
  setSelectedGoal: (goal: Goal | null) => void;
  /** Adjust gold by a delta (positive or negative). Never drops below 0. */
  addGold: (delta: number) => void;
  /** Adjust xp by a delta (positive or negative). Never drops below 0. */
  addXp: (delta: number) => void;
  /** Attempts to spend gold. Returns false (no state change) if balance is insufficient. */
  spendGold: (amount: number) => boolean;
  /** Adds a looted item to the persistent inventory list and returns the owned instance. */
  addToInventory: (item: LootItem) => OwnedItem;
  /** Equips an item into its slot, auto-unequipping whatever was there before. */
  equipItem: (item: OwnedItem) => void;
  /** Removes the item from a slot. */
  unequipItem: (slot: Slot) => void;
  /** Records a completed arena match in the history. */
  addMatchResult: (record: MatchRecord) => void;
  /** Sells an inventory item by instanceId. Removes it, unequips if needed, awards gold. Returns gold earned. */
  sellItem: (instanceId: string) => Promise<number>;
};

const GameContext = createContext<GameContextValue | null>(null);

const LOOT_BY_ID: Map<string, LootItem> = new Map(LOOT_TABLE.map((item) => [item.id, item]));

/** Finds the loot table item backing a server-side PlayerItem's itemId. */
function resolveLootItem(itemId: string): LootItem | undefined {
  return LOOT_BY_ID.get(itemId);
}

function toOwnedItem(row: PlayerItem): OwnedItem | null {
  const loot = resolveLootItem(row.itemId);
  if (!loot) return null;
  return {
    ...loot,
    instanceId: row.instanceId,
    obtainedAt: new Date(row.obtainedAt).getTime(),
  };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const { status, walletAddress } = useAuth();
  const isAuthenticated = status === "signed-in" && Boolean(walletAddress);

  const [gold, setGold] = useState(0);
  const [xp, setXp] = useState(0);
  const [inventory, setInventory] = useState<OwnedItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({});
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedGoal, setSelectedGoalState] = useState<Goal | null>(null);

  // goldRef keeps a synchronously-readable mirror of the gold state so that
  // spendGold can check affordability and fire the API call in one tick —
  // without relying on a React state updater function that runs asynchronously
  // during the render phase.
  const goldRef = useRef(0);
  useEffect(() => {
    goldRef.current = gold;
  }, [gold]);

  // Central wallet-change handler: reset ALL wallet-specific state immediately
  // whenever the authenticated wallet address changes (sign-out → null, switch
  // A → B, or first sign-in after guest). Then fetch fresh data if signed in.
  //
  // Keyed to `walletAddress` (derived from the server session user) rather than
  // the raw wagmi address — so it fires exactly when the server-authoritative
  // identity changes, not during SIWE in-progress states.
  useEffect(() => {
    // Always reset to defaults first — clears any previous wallet's data so
    // nothing leaks across sign-out, guest, or wallet-switch transitions.
    setGold(0);
    setXp(0);
    setInventory([]);
    setEquippedItems({});
    setMatchHistory([]);
    setSelectedGoalState(null);
    goldRef.current = 0;

    if (!walletAddress) return; // signed out / guest — stay at empty defaults

    // Fetch fresh state for this wallet.
    let cancelled = false;
    (async () => {
      setIsSyncing(true);
      try {
        const [player, items] = await Promise.all([getMyPlayer(), listMyPlayerItems()]);
        if (cancelled) return;

        setGold(player.gold);
        setXp(player.xp);
        if (player.selectedGoal && VALID_GOALS.has(player.selectedGoal)) {
          setSelectedGoalState(player.selectedGoal as Goal);
        }

        const owned = items.map(toOwnedItem).filter((i): i is OwnedItem => i !== null);
        setInventory(owned);

        const equipped: EquippedItems = {};
        for (const item of owned) {
          const row = items.find((i) => i.instanceId === item.instanceId);
          if (row?.equipped) equipped[item.slot] = item;
        }
        setEquippedItems(equipped);
      } catch (err) {
        console.error("Failed to hydrate game state from server", err);
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    })();

    // If the address changes again while a fetch is in-flight, cancel the
    // stale response so it doesn't overwrite the newer wallet's state.
    return () => {
      cancelled = true;
    };
  }, [walletAddress]);

  const addGold = useCallback(
    (delta: number) => {
      setGold((g) => Math.max(0, g + delta));
      if (isAuthenticated && delta !== 0) {
        adjustMyPlayer({ goldDelta: delta }).catch((err) =>
          console.error("Failed to sync gold delta", err),
        );
      }
    },
    [isAuthenticated],
  );

  const addXp = useCallback(
    (delta: number) => {
      setXp((x) => Math.max(0, x + delta));
      if (isAuthenticated && delta !== 0) {
        adjustMyPlayer({ xpDelta: delta }).catch((err) =>
          console.error("Failed to sync xp delta", err),
        );
      }
    },
    [isAuthenticated],
  );

  const spendGold = useCallback(
    (amount: number) => {
      // Read goldRef synchronously — the React state updater form of setGold
      // runs during the render phase (asynchronously), so capturing a `success`
      // flag inside an updater and reading it immediately after setGold() would
      // always see false, preventing the API call from ever firing.
      if (goldRef.current < amount) return false;
      setGold((g) => Math.max(0, g - amount));
      if (isAuthenticated) {
        adjustMyPlayer({ goldDelta: -amount }).catch((err) =>
          console.error("Failed to sync gold spend", err),
        );
      }
      return true;
    },
    [isAuthenticated],
  );

  const addToInventory = useCallback(
    (item: LootItem) => {
      const owned: OwnedItem = {
        ...item,
        instanceId: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        obtainedAt: Date.now(),
      };
      setInventory((prev) => [owned, ...prev]);

      if (isAuthenticated) {
        addMyPlayerItem({ itemId: item.id, slot: item.slot })
          .then((row) => {
            // Reconcile the optimistic instanceId with the server-assigned one.
            setInventory((prev) =>
              prev.map((i) => (i.instanceId === owned.instanceId ? { ...i, instanceId: row.instanceId } : i)),
            );
          })
          .catch((err) => console.error("Failed to sync new item", err));
      }

      return owned;
    },
    [isAuthenticated],
  );

  const equipItem = useCallback(
    (item: OwnedItem) => {
      setEquippedItems((prev) => ({ ...prev, [item.slot]: item }));
      if (isAuthenticated) {
        updateMyPlayerItem(item.instanceId, { equipped: true }).catch((err) =>
          console.error("Failed to sync equip", err),
        );
      }
    },
    [isAuthenticated],
  );

  const unequipItem = useCallback(
    (slot: Slot) => {
      const current = equippedItems[slot];
      setEquippedItems((prev) => {
        const next = { ...prev };
        delete next[slot];
        return next;
      });
      if (isAuthenticated && current) {
        updateMyPlayerItem(current.instanceId, { equipped: false }).catch((err) =>
          console.error("Failed to sync unequip", err),
        );
      }
    },
    [isAuthenticated, equippedItems],
  );

  const setSelectedGoal = useCallback(
    (goal: Goal | null) => {
      setSelectedGoalState(goal);
      if (isAuthenticated) {
        updateMyPlayerGoal({ selectedGoal: goal }).catch((err) =>
          console.error("Failed to sync selected goal", err),
        );
      }
    },
    [isAuthenticated],
  );

  const addMatchResult = useCallback(
    (record: MatchRecord) => {
      setMatchHistory((prev) => [record, ...prev]);
      if (isAuthenticated) {
        recordArenaMatch({
          opponentId: record.opponentId,
          opponentName: record.opponentName,
          result: record.result,
          xpEarned: record.xpEarned,
          goldEarned: record.goldEarned,
        }).catch((err) => console.error("Failed to sync match result", err));
      }
    },
    [isAuthenticated],
  );

  const sellItem = useCallback(
    async (instanceId: string): Promise<number> => {
      // Find the item before we remove it so we can roll back on failure.
      const item = inventory.find((i) => i.instanceId === instanceId);
      if (!item) throw new Error("Item not found in inventory");

      const isEquipped = equippedItems[item.slot]?.instanceId === instanceId;

      // Optimistic: remove from inventory, unequip if needed, add sell-value gold.
      setInventory((prev) => prev.filter((i) => i.instanceId !== instanceId));
      if (isEquipped) {
        setEquippedItems((prev) => {
          const next = { ...prev };
          delete next[item.slot];
          return next;
        });
      }
      // We'll get the real gold value from the server; add it optimistically too.
      // Use the same values as DUPLICATE_GOLD (10/30/100) — if server disagrees we
      // won't revert the optimistic add, but the server response updates goldRef.
      const SELL_VALUE: Record<string, number> = { common: 10, rare: 30, epic: 100 };
      const optimisticGold = SELL_VALUE[item.rarity] ?? 10;
      setGold((g) => g + optimisticGold);

      if (isAuthenticated) {
        try {
          const result = await sellMyPlayerItem(instanceId);
          // Reconcile: server is authoritative on final gold balance.
          setGold(result.gold);
          goldRef.current = result.gold;
          return result.goldEarned;
        } catch (err) {
          // Roll back optimistic changes on failure.
          setInventory((prev) => [item, ...prev]);
          if (isEquipped) {
            setEquippedItems((prev) => ({ ...prev, [item.slot]: item }));
          }
          setGold((g) => g - optimisticGold);
          throw err;
        }
      }

      // Guest mode: no server call, return optimistic value.
      return optimisticGold;
    },
    [isAuthenticated, inventory, equippedItems],
  );

  return (
    <GameContext.Provider
      value={{
        gold,
        xp,
        inventory,
        equippedItems,
        matchHistory,
        isSyncing,
        selectedGoal,
        setSelectedGoal,
        addGold,
        addXp,
        spendGold,
        addToInventory,
        equipItem,
        unequipItem,
        addMatchResult,
        sellItem,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return ctx;
}
