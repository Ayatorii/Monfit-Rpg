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
import { useAuth } from "@/lib/auth-context";
import {
  getMyPlayer,
  adjustMyPlayer,
  addMyPlayerItem,
  listMyPlayerItems,
  updateMyPlayerItem,
  recordArenaMatch,
} from "@workspace/api-client-react";
import type { PlayerItem } from "@workspace/api-client-react";

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

  const hydratedFor = useRef<string | null>(null);

  // Hydrate gold/xp/inventory from the server the first time a wallet signs in.
  useEffect(() => {
    if (!isAuthenticated || !walletAddress) return;
    if (hydratedFor.current === walletAddress) return;
    hydratedFor.current = walletAddress;

    (async () => {
      setIsSyncing(true);
      try {
        const [player, items] = await Promise.all([getMyPlayer(), listMyPlayerItems()]);
        setGold(player.gold);
        setXp(player.xp);

        const owned = items.map(toOwnedItem).filter((i): i is OwnedItem => i !== null);
        setInventory(owned);

        const equipped: EquippedItems = {};
        for (const item of owned) {
          const row = items.find((i) => i.instanceId === item.instanceId);
          if (row?.equipped) equipped[item.slot] = item;
        }
        setEquippedItems(equipped);
      } catch (err) {
        console.error("Failed to hydrate inventory from server", err);
      } finally {
        setIsSyncing(false);
      }
    })();
  }, [isAuthenticated, walletAddress]);

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
      let success = false;
      setGold((g) => {
        if (g < amount) {
          success = false;
          return g;
        }
        success = true;
        return g - amount;
      });
      if (success && isAuthenticated) {
        adjustMyPlayer({ goldDelta: -amount }).catch((err) =>
          console.error("Failed to sync gold spend", err),
        );
      }
      return success;
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

  return (
    <GameContext.Provider
      value={{
        gold,
        xp,
        inventory,
        equippedItems,
        matchHistory,
        isSyncing,
        addGold,
        addXp,
        spendGold,
        addToInventory,
        equipItem,
        unequipItem,
        addMatchResult,
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
