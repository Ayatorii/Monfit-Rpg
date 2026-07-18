import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Package, Lock, CheckCircle2, Coins } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useGame, type OwnedItem } from "@/lib/game-context";
import {
  rollLoot,
  RARITY_LABELS,
  SLOT_LABELS,
  DUPLICATE_GOLD,
  type LootItem,
} from "@/data/lootTable";
import { cn } from "@/lib/utils";
import ResourceBadges from "@/components/ResourceBadges";

const CHEST_PRICE = 100;

const RARITY_TEXT_CLASS: Record<LootItem["rarity"], string> = {
  common: "text-rarity-common",
  rare: "text-rarity-rare",
  epic: "text-rarity-epic",
};

const RARITY_BORDER_VAR: Record<LootItem["rarity"], string> = {
  common: "hsl(var(--rarity-common))",
  rare: "hsl(var(--rarity-rare))",
  epic: "hsl(var(--rarity-epic))",
};

type RevealState =
  | { type: "new"; item: OwnedItem }
  | { type: "duplicate"; item: LootItem; goldEarned: number };

export default function ShopPage() {
  const { gold, xp, spendGold, addGold, addToInventory, equipItem, inventory, equippedItems } =
    useGame();
  const [reveal, setReveal] = useState<RevealState | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const buyButtonRef = useRef<HTMLButtonElement>(null);

  const canAfford = gold >= CHEST_PRICE;
  const shortBy = CHEST_PRICE - gold;

  const handleBuyAndOpen = () => {
    if (!spendGold(CHEST_PRICE)) return;
    const loot = rollLoot();
    const isDuplicate = inventory.some((i) => i.id === loot.id);

    if (isDuplicate) {
      const goldEarned = DUPLICATE_GOLD[loot.rarity];
      addGold(goldEarned);
      setReveal({ type: "duplicate", item: loot, goldEarned });
    } else {
      const owned = addToInventory(loot);
      setReveal({ type: "new", item: owned });
    }
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    // Return focus to the buy button after the dialog closes.
    setTimeout(() => buyButtonRef.current?.focus(), 50);
  };

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-10 max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="min-w-0 flex-1 mr-3">
          <h1 className="font-display font-black text-3xl md:text-4xl text-foreground text-balance leading-none">
            SHOP
          </h1>
          <p className="text-muted-foreground text-sm mt-1 text-pretty">
            Spend your Gold on chests for a chance at rare gear.
          </p>
        </div>
        <ResourceBadges gold={gold} xp={xp} />
      </header>

      {/* Chest card */}
      <section aria-labelledby="chest-heading" className="mb-10">
        <h2
          id="chest-heading"
          className="font-display font-bold text-lg text-foreground mb-3 uppercase tracking-wide"
        >
          Chests
        </h2>
        <div className="rounded-lg border border-card-border bg-card px-4 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div
            className="flex items-center justify-center h-16 w-16 rounded-md bg-surface border border-surface-border shrink-0"
            aria-hidden="true"
          >
            <Package className="h-8 w-8 text-gold" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-base">Common Chest</h3>
            <p className="text-muted-foreground text-sm mt-0.5">
              A weighted roll across common, rare, and epic training gear.
            </p>
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-1.5 shrink-0">
            <button
              ref={buyButtonRef}
              type="button"
              disabled={!canAfford}
              onClick={handleBuyAndOpen}
              aria-disabled={!canAfford}
              aria-label={
                canAfford
                  ? `Buy and open Common Chest for ${CHEST_PRICE} Gold`
                  : `Buy and open Common Chest — need ${shortBy} more Gold`
              }
              className={cn(
                "min-h-11 rounded-md px-5 py-2.5 font-semibold text-sm transition-colors border",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                canAfford
                  ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 cursor-pointer"
                  : "bg-muted text-muted-foreground border-card-border cursor-not-allowed",
              )}
            >
              {canAfford ? (
                "Buy & Open — 100 Gold"
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  Buy & Open — 100 Gold
                </span>
              )}
            </button>
            {!canAfford && (
              <span className="text-xs text-muted-foreground text-right">
                Need {shortBy} more Gold
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Inventory */}
      <section aria-labelledby="inventory-heading">
        <h2
          id="inventory-heading"
          className="font-display font-bold text-lg text-foreground mb-3 uppercase tracking-wide"
        >
          My Items
        </h2>
        {inventory.length === 0 ? (
          <p className="text-muted-foreground text-sm border border-card-border rounded-lg bg-card px-4 py-5">
            Nothing looted yet — open a chest to start your collection.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {inventory.map((item) => {
              const isEquipped =
                equippedItems[item.slot]?.instanceId === item.instanceId;
              return (
                <div
                  key={item.instanceId}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3",
                    isEquipped
                      ? "border-primary/30 bg-primary/5"
                      : "border-card-border bg-card",
                  )}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: RARITY_BORDER_VAR[item.rarity] }}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {item.name}
                  </span>
                  {isEquipped && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-primary-text shrink-0">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      Equipped
                    </span>
                  )}
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wide shrink-0",
                      RARITY_TEXT_CLASS[item.rarity],
                    )}
                  >
                    {RARITY_LABELS[item.rarity]}
                  </span>
                  <span className="hidden sm:inline text-xs font-mono text-muted-foreground shrink-0 whitespace-nowrap">
                    {SLOT_LABELS[item.slot]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Reveal modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          aria-label={
            reveal
              ? reveal.type === "duplicate"
                ? `Duplicate: ${reveal.item.name} converted to ${reveal.goldEarned} Gold`
                : `New item: ${reveal.item.name}`
              : "Chest reveal"
          }
          className="max-w-sm border-2 bg-card shadow-none p-0 overflow-hidden"
          style={reveal ? { borderColor: RARITY_BORDER_VAR[reveal.item.rarity] } : undefined}
        >
          {reveal && (
            <motion.div
              key={reveal.type}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex flex-col items-center text-center px-6 py-8 gap-3"
            >
              {/* Icon */}
              <div
                className="flex items-center justify-center h-16 w-16 rounded-md bg-surface border shrink-0"
                style={{ borderColor: RARITY_BORDER_VAR[reveal.item.rarity] }}
                aria-hidden="true"
              >
                {reveal.type === "duplicate" ? (
                  <Coins
                    className="h-8 w-8 text-gold"
                  />
                ) : (
                  <Package
                    className="h-8 w-8"
                    style={{ color: RARITY_BORDER_VAR[reveal.item.rarity] }}
                  />
                )}
              </div>

              {/* Item name */}
              <DialogTitle className="font-display font-black text-2xl text-foreground leading-tight">
                {reveal.item.name}
              </DialogTitle>

              {/* Rarity */}
              <span
                className={cn(
                  "text-sm font-semibold uppercase tracking-wide",
                  RARITY_TEXT_CLASS[reveal.item.rarity],
                )}
              >
                {RARITY_LABELS[reveal.item.rarity]}
              </span>

              {reveal.type === "duplicate" ? (
                /* ── Duplicate state ── */
                <>
                  <DialogDescription
                    className="text-sm text-muted-foreground"
                    aria-live="polite"
                  >
                    You already own this item.
                  </DialogDescription>
                  <div className="flex items-center gap-2 rounded-lg border border-card-border bg-surface px-4 py-2.5 mt-1">
                    <Coins className="h-4 w-4 text-gold shrink-0" aria-hidden="true" />
                    <span className="text-sm font-semibold text-foreground">
                      Duplicate — converted to{" "}
                      <span className="text-gold">+{reveal.goldEarned} Gold</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className={cn(
                      "mt-2 w-full min-h-11 rounded-md border border-card-border bg-muted",
                      "text-sm font-semibold text-foreground transition-colors hover:bg-muted/70",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    Got it
                  </button>
                </>
              ) : (
                /* ── New item state ── */
                <>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {SLOT_LABELS[reveal.item.slot]} · +{reveal.item.statValue}{" "}
                    {reveal.item.statLabel}
                  </DialogDescription>
                  <button
                    type="button"
                    onClick={() => {
                      equipItem(reveal.item);
                      handleClose();
                    }}
                    className={cn(
                      "mt-2 w-full min-h-11 rounded-md border border-primary bg-primary",
                      "text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    Equip now →
                  </button>
                </>
              )}
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
