import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { LootItem, Slot } from "@/data/lootTable";

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
};

type GameContextValue = {
  gold: number;
  xp: number;
  inventory: OwnedItem[];
  equippedItems: EquippedItems;
  matchHistory: MatchRecord[];
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

export function GameProvider({ children }: { children: ReactNode }) {
  const [gold, setGold] = useState(0);
  const [xp, setXp] = useState(0);
  const [inventory, setInventory] = useState<OwnedItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({});
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);

  const addGold = useCallback((delta: number) => {
    setGold((g) => Math.max(0, g + delta));
  }, []);

  const addXp = useCallback((delta: number) => {
    setXp((x) => Math.max(0, x + delta));
  }, []);

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
      return success;
    },
    [],
  );

  const addToInventory = useCallback((item: LootItem) => {
    const owned: OwnedItem = {
      ...item,
      instanceId: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      obtainedAt: Date.now(),
    };
    setInventory((prev) => [owned, ...prev]);
    return owned;
  }, []);

  const equipItem = useCallback((item: OwnedItem) => {
    setEquippedItems((prev) => ({ ...prev, [item.slot]: item }));
  }, []);

  const unequipItem = useCallback((slot: Slot) => {
    setEquippedItems((prev) => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
  }, []);

  const addMatchResult = useCallback((record: MatchRecord) => {
    setMatchHistory((prev) => [record, ...prev]);
  }, []);

  return (
    <GameContext.Provider
      value={{
        gold,
        xp,
        inventory,
        equippedItems,
        matchHistory,
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
