import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Shield, Hand, Swords, Layers, Footprints, CheckCircle2, Coins } from "lucide-react";
import imgHead from "@assets/common-head_1784376918929.png";
import imgBody from "@assets/common-body_1784376918928.png";
import imgLeftHand from "@assets/common-left-hand_1784376918930.png";
import imgRightHand from "@assets/common-right-hand_1784376918932.png";
import imgLegs from "@assets/common-legs_1784376918931.png";
import imgFeet from "@assets/common-feet_1784376918929.png";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useGame, type OwnedItem } from "@/lib/game-context";
import { SLOT_LABELS, RARITY_LABELS, DUPLICATE_GOLD, type Slot, type Rarity } from "@/data/lootTable";
import { BASE_STATS, statBonus } from "@/lib/playerStats";
import ResourceBadges from "@/components/ResourceBadges";
import { cn } from "@/lib/utils";

const RARITY_COLOR_VAR: Record<Rarity, string> = {
  common: "hsl(var(--rarity-common))",
  rare: "hsl(var(--rarity-rare))",
  epic: "hsl(var(--rarity-epic))",
};

const RARITY_TEXT_CLASS: Record<Rarity, string> = {
  common: "text-rarity-common",
  rare: "text-rarity-rare",
  epic: "text-rarity-epic",
};

const SLOT_ICONS: Record<Slot, React.FC<React.SVGProps<SVGSVGElement>>> = {
  head: Crown,
  body: Shield,
  leftHand: Hand,
  rightHand: Swords,
  legs: Layers,
  feet: Footprints,
};

const SLOT_SPRITES: Record<Slot, string> = {
  head: imgHead,
  body: imgBody,
  leftHand: imgLeftHand,
  rightHand: imgRightHand,
  legs: imgLegs,
  feet: imgFeet,
};

// Desktop layout: 2 cards per side column; head/feet live in the center column
const DESKTOP_LEFT_SLOTS: Slot[] = ["leftHand", "legs"];
const DESKTOP_RIGHT_SLOTS: Slot[] = ["rightHand", "body"];

// Mobile grid pairs slots by body region (top → bottom)
const MOBILE_SLOT_PAIRS: [Slot, Slot][] = [
  ["head", "body"],
  ["leftHand", "rightHand"],
  ["legs", "feet"],
];

// ─── Character Silhouette SVG ────────────────────────────────────────────────

function CharacterSilhouette({
  equippedItems,
}: {
  equippedItems: Partial<Record<Slot, OwnedItem>>;
}) {
  const baseFill = "hsl(var(--primary) / 0.12)";
  const baseStroke = "hsl(var(--primary) / 0.4)";

  function slotStroke(slot: Slot) {
    const item = equippedItems[slot];
    return item ? RARITY_COLOR_VAR[item.rarity] : baseStroke;
  }

  function slotStrokeW(slot: Slot) {
    return equippedItems[slot] ? 3 : 1.5;
  }

  return (
    <svg
      viewBox="0 0 120 224"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full h-full"
    >
      {/* Head — head slot */}
      <circle
        cx="60"
        cy="26"
        r="20"
        fill={baseFill}
        stroke={slotStroke("head")}
        strokeWidth={slotStrokeW("head")}
      />
      {/* Neck connector */}
      <rect x="56" y="46" width="8" height="8" rx="2" fill={baseFill} stroke="none" />
      {/* Torso — body slot */}
      <rect
        x="30"
        y="54"
        width="60"
        height="68"
        rx="8"
        fill={baseFill}
        stroke={slotStroke("body")}
        strokeWidth={slotStrokeW("body")}
      />
      {/* Left arm — leftHand slot */}
      <rect
        x="13"
        y="54"
        width="15"
        height="58"
        rx="5"
        fill={baseFill}
        stroke={slotStroke("leftHand")}
        strokeWidth={slotStrokeW("leftHand")}
      />
      {/* Right arm — rightHand slot */}
      <rect
        x="92"
        y="54"
        width="15"
        height="58"
        rx="5"
        fill={baseFill}
        stroke={slotStroke("rightHand")}
        strokeWidth={slotStrokeW("rightHand")}
      />
      {/* Left leg — legs slot */}
      <rect
        x="31"
        y="126"
        width="24"
        height="66"
        rx="6"
        fill={baseFill}
        stroke={slotStroke("legs")}
        strokeWidth={slotStrokeW("legs")}
      />
      {/* Right leg — legs slot */}
      <rect
        x="65"
        y="126"
        width="24"
        height="66"
        rx="6"
        fill={baseFill}
        stroke={slotStroke("legs")}
        strokeWidth={slotStrokeW("legs")}
      />
      {/* Left foot — feet slot */}
      <rect
        x="28"
        y="188"
        width="30"
        height="14"
        rx="4"
        fill={baseFill}
        stroke={slotStroke("feet")}
        strokeWidth={slotStrokeW("feet")}
      />
      {/* Right foot — feet slot */}
      <rect
        x="62"
        y="188"
        width="30"
        height="14"
        rx="4"
        fill={baseFill}
        stroke={slotStroke("feet")}
        strokeWidth={slotStrokeW("feet")}
      />
    </svg>
  );
}

// ─── Slot Button ─────────────────────────────────────────────────────────────

function SlotButton({
  slot,
  equippedItem,
  onClick,
}: {
  slot: Slot;
  equippedItem: OwnedItem | undefined;
  onClick: () => void;
}) {
  const Icon = SLOT_ICONS[slot];
  const rarityColor = equippedItem ? RARITY_COLOR_VAR[equippedItem.rarity] : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        equippedItem
          ? `${SLOT_LABELS[slot]}: ${equippedItem.name} equipped — click to change`
          : `${SLOT_LABELS[slot]}: empty — click to equip`
      }
      className={cn(
        "w-full min-h-11 flex flex-col gap-1 rounded-lg border px-3 py-3 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        equippedItem
          ? "hover:brightness-110"
          : "bg-card border-card-border hover:border-muted-foreground/40",
      )}
      style={equippedItem ? {
        backgroundColor: `hsl(var(--rarity-${equippedItem.rarity}) / 0.40)`,
        borderColor: rarityColor,
      } : undefined}
    >
      <div className="flex items-center gap-2">
        {equippedItem ? (
          <img
            src={SLOT_SPRITES[slot]}
            alt={equippedItem.name}
            className="h-6 w-6 shrink-0 object-contain"
          />
        ) : (
          <Icon
            className="h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          />
        )}
        <span className={cn(
          "text-xs font-medium",
          equippedItem ? "text-white/70" : "text-muted-foreground",
        )}>
          {SLOT_LABELS[slot]}
        </span>
      </div>
      {equippedItem ? (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-white leading-snug line-clamp-1">
            {equippedItem.name}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-white/75">
            {RARITY_LABELS[equippedItem.rarity]}
          </span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground/70">+ Add gear</span>
      )}
    </button>
  );
}

// ─── Attributes Panel (desktop right column) ──────────────────────────────────

function AttributesPanel({
  equippedItems,
}: {
  equippedItems: Partial<Record<Slot, OwnedItem>>;
}) {
  const stats = (["STR", "AGI", "VIT"] as const).map((stat) => {
    const bonus = statBonus(equippedItems, stat);
    return { stat, base: BASE_STATS[stat], bonus, total: BASE_STATS[stat] + bonus };
  });

  return (
    <div className="rounded-lg border border-card-border bg-card px-4 py-4 flex flex-col gap-2">
      <span className="text-xs text-muted-foreground mb-0.5">Attributes</span>
      {stats.map(({ stat, base, bonus, total }) => (
        <div key={stat} className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">{stat}</span>
          <div className="flex items-center gap-1.5 tabular-nums">
            <span className="text-sm text-muted-foreground">{base}</span>
            {bonus > 0 && (
              <span className="text-xs font-semibold text-xp">(+{bonus})</span>
            )}
            <span className="text-sm font-bold text-foreground">= {total}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Level Bar (desktop full-width row below paperdoll) ───────────────────────

function LevelBar({ xp }: { xp: number }) {
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const xpProgress = xpInLevel / 100;

  return (
    <div className="rounded-lg border border-card-border bg-card px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-display font-semibold text-sm text-foreground">
          Level {level}
        </span>
        <span className="text-xs font-mono text-muted-foreground">
          {xpInLevel} / 100 XP
        </span>
      </div>
      <div
        className="h-2 rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={xpInLevel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`XP progress: ${xpInLevel} of 100`}
      >
        <div
          className="h-full rounded-full bg-xp origin-left transition-transform duration-500 ease-out"
          style={{ transform: `scaleX(${xpProgress})` }}
        />
      </div>
    </div>
  );
}

// ─── Stat Panel (mobile only — Level + Gold + Attributes) ─────────────────────

function StatPanel({
  xp,
  equippedItems,
}: {
  xp: number;
  equippedItems: Partial<Record<Slot, OwnedItem>>;
}) {
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const xpProgress = xpInLevel / 100;

  const stats = (["STR", "AGI", "VIT"] as const).map((stat) => {
    const bonus = statBonus(equippedItems, stat);
    return { stat, base: BASE_STATS[stat], bonus, total: BASE_STATS[stat] + bonus };
  });

  return (
    <div className="rounded-lg border border-card-border bg-card px-4 py-4 flex flex-col gap-4">
      {/* Level + XP */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-display font-semibold text-sm text-foreground">
            Level {level}
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            {xpInLevel} / 100 XP
          </span>
        </div>
        <div
          className="h-2 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={xpInLevel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`XP progress: ${xpInLevel} of 100`}
        >
          <div
            className="h-full rounded-full bg-xp origin-left transition-transform duration-500 ease-out"
            style={{ transform: `scaleX(${xpProgress})` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="border-t border-card-border pt-3 flex flex-col gap-2">
        <span className="text-xs text-muted-foreground mb-0.5">Attributes</span>
        {stats.map(({ stat, base, bonus, total }) => (
          <div key={stat} className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">{stat}</span>
            <div className="flex items-center gap-1.5 tabular-nums">
              <span className="text-sm text-muted-foreground">{base}</span>
              {bonus > 0 && (
                <span className="text-xs font-semibold text-xp">(+{bonus})</span>
              )}
              <span className="text-sm font-bold text-foreground">= {total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Item Picker Dialog ───────────────────────────────────────────────────────

function ItemPickerDialog({
  slot,
  open,
  onOpenChange,
  inventory,
  equippedItems,
  onEquip,
  onUnequip,
  onSell,
}: {
  slot: Slot | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  inventory: OwnedItem[];
  equippedItems: Partial<Record<Slot, OwnedItem>>;
  onEquip: (item: OwnedItem) => void;
  onUnequip: (slot: Slot) => void;
  onSell: (item: OwnedItem) => void;
}) {
  if (!slot) return null;

  const slotItems = inventory.filter((item) => item.slot === slot);
  const equipped = equippedItems[slot];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-label={`Equip ${SLOT_LABELS[slot]}`}
        className="max-w-sm border border-card-border bg-card shadow-none p-0 overflow-hidden"
      >
        <div className="px-5 pt-5 pb-4">
          <DialogTitle className="font-display font-black text-2xl text-foreground text-balance leading-tight mb-0.5">
            {SLOT_LABELS[slot]}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {slotItems.length === 0
              ? "No items available for this slot."
              : `${slotItems.length} item${slotItems.length !== 1 ? "s" : ""} available`}
          </DialogDescription>
        </div>

        {slotItems.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-muted-foreground">
            Open chests in the Shop to find {SLOT_LABELS[slot].toLowerCase()} gear.
          </p>
        ) : (
          <div className="flex flex-col border-t border-card-border divide-y divide-card-border max-h-80 overflow-y-auto">
            {slotItems.map((item) => {
              const isEquipped = equipped?.instanceId === item.instanceId;
              return (
                <div key={item.instanceId} className="flex items-center gap-2 px-2">
                  {/* Equip / unequip button — takes up most of the row */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isEquipped) {
                        onUnequip(slot);
                      } else {
                        onEquip(item);
                      }
                      onOpenChange(false);
                    }}
                    aria-pressed={isEquipped}
                    aria-label={isEquipped ? `Unequip ${item.name}` : `Equip ${item.name}`}
                    className={cn(
                      "flex-1 min-h-11 flex items-center gap-3 px-3 py-3 text-left transition-colors rounded-lg",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isEquipped
                        ? "bg-primary/10 hover:bg-primary/15"
                        : "hover:bg-muted/40",
                    )}
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: RARITY_COLOR_VAR[item.rarity] }}
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-sm font-medium text-foreground">
                      {item.name}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide shrink-0",
                        RARITY_TEXT_CLASS[item.rarity],
                      )}
                    >
                      {RARITY_LABELS[item.rarity]}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground shrink-0 whitespace-nowrap">
                      +{item.statValue} {item.statLabel}
                    </span>
                    {isEquipped && (
                      <span className="text-xs font-semibold text-primary-text shrink-0">
                        Unequip
                      </span>
                    )}
                  </button>

                  {/* Sell button — separate action, does not equip/unequip */}
                  <button
                    type="button"
                    onClick={() => onSell(item)}
                    aria-label={`Sell ${item.name} for ${DUPLICATE_GOLD[item.rarity]} Gold`}
                    className={cn(
                      "shrink-0 min-h-11 min-w-[2.75rem] flex items-center justify-center rounded-lg border border-card-border",
                      "text-xs font-semibold text-muted-foreground transition-colors",
                      "hover:border-gold/60 hover:text-gold hover:bg-gold/10",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                    title={`Sell for ${DUPLICATE_GOLD[item.rarity]} Gold`}
                  >
                    <Coins className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Inventory Grid ───────────────────────────────────────────────────────────

function InventoryGrid({
  inventory,
  equippedItems,
  onSlotClick,
  onSell,
}: {
  inventory: OwnedItem[];
  equippedItems: Partial<Record<Slot, OwnedItem>>;
  onSlotClick: (slot: Slot) => void;
  onSell: (item: OwnedItem) => void;
}) {
  const [tooltipId, setTooltipId] = useState<string | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleClose() {
    leaveTimer.current = setTimeout(() => setTooltipId(null), 180);
  }

  function cancelClose() {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }

  // Clean up on unmount
  useEffect(() => () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); }, []);

  if (inventory.length === 0) {
    return (
      <p className="text-muted-foreground text-sm border border-card-border rounded-lg bg-card px-4 py-5">
        Nothing looted yet — open a chest in the Shop to start your collection.
      </p>
    );
  }

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(3.5rem, 1fr))" }}
      role="list"
      aria-label="Inventory items"
    >
      {inventory.map((item) => {
        const isEquipped =
          equippedItems[item.slot]?.instanceId === item.instanceId;
        const slotTooltipId = `inv-tooltip-${item.instanceId}`;
        const showTooltip = tooltipId === item.instanceId;
        const rarityColor = RARITY_COLOR_VAR[item.rarity];
        const sellValue = DUPLICATE_GOLD[item.rarity];

        return (
          <div key={item.instanceId} className="relative" role="listitem">
            <button
              type="button"
              onClick={() => onSlotClick(item.slot)}
              onMouseEnter={() => { cancelClose(); setTooltipId(item.instanceId); }}
              onMouseLeave={scheduleClose}
              onFocus={() => setTooltipId(item.instanceId)}
              onBlur={scheduleClose}
              aria-label={`${item.name}${isEquipped ? " (equipped)" : ""} — ${RARITY_LABELS[item.rarity]} ${SLOT_LABELS[item.slot]}, +${item.statValue} ${item.statLabel}. Click to manage.`}
              aria-describedby={slotTooltipId}
              className={cn(
                "relative w-full aspect-square min-h-[44px] rounded-lg flex flex-col items-center justify-center gap-1 transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isEquipped ? "border-2 brightness-110" : "border",
              )}
              style={{
                borderColor: rarityColor,
                backgroundColor: `hsl(var(--rarity-${item.rarity}) / 0.40)`,
              }}
            >
              <img
                src={SLOT_SPRITES[item.slot]}
                alt={item.name}
                className="h-10 w-10 shrink-0 object-contain"
              />
              {/* Equipped badge */}
              {isEquipped && (
                <span
                  className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center"
                  aria-hidden="true"
                >
                  <CheckCircle2 className="h-2.5 w-2.5 text-primary-text" />
                </span>
              )}
            </button>

            {/* Interactive tooltip — stays open while hovered so the sell button is reachable */}
            <div
              id={slotTooltipId}
              role="tooltip"
              aria-hidden={!showTooltip}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              className={cn(
                "absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2",
                "w-max max-w-[13rem] rounded-lg border border-card-border px-3 py-2.5",
                "flex flex-col gap-1 select-none",
                "transition-opacity duration-150",
                showTooltip ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
              )}
              style={{ backgroundColor: "hsl(var(--card))" }}
            >
              <span className="text-sm font-semibold text-foreground leading-snug">
                {item.name}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wide",
                  RARITY_TEXT_CLASS[item.rarity],
                )}
              >
                {RARITY_LABELS[item.rarity]}
              </span>
              <span className="text-xs text-muted-foreground">
                {SLOT_LABELS[item.slot]}
              </span>
              <span className="text-xs font-mono text-foreground">
                +{item.statValue} {item.statLabel}
              </span>
              {/* Sell button inside tooltip */}
              <button
                type="button"
                onClick={() => { setTooltipId(null); onSell(item); }}
                aria-label={`Sell ${item.name} for ${sellValue} Gold`}
                className={cn(
                  "mt-0.5 flex items-center gap-1.5 rounded-md border border-card-border px-2 py-1",
                  "text-xs font-semibold text-muted-foreground transition-colors w-full",
                  "hover:border-gold/60 hover:text-gold hover:bg-gold/10",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                <Coins className="h-3 w-3 shrink-0" aria-hidden="true" />
                Sell for {sellValue} Gold
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sell Confirm Dialog ──────────────────────────────────────────────────────

function SellConfirmDialog({
  item,
  isEquipped,
  isSelling,
  onConfirm,
  onCancel,
}: {
  item: OwnedItem | null;
  isEquipped: boolean;
  isSelling: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const open = item !== null;
  const sellValue = item ? DUPLICATE_GOLD[item.rarity] : 0;

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <AlertDialogContent
        className="max-w-sm border border-card-border bg-card shadow-none"
        role="alertdialog"
        aria-modal="true"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display font-black text-xl text-foreground">
            {isEquipped ? "Sell equipped item?" : `Sell for ${sellValue} Gold?`}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground text-pretty">
            {isEquipped ? (
              <>
                <span className="font-semibold text-foreground">{item?.name}</span>
                {" "}is currently equipped. Selling it will unequip it and remove it from your inventory.{" "}
                You'll receive{" "}
                <span className="font-semibold text-gold">{sellValue} Gold</span>.
              </>
            ) : (
              <>
                <span className="font-semibold text-foreground">{item?.name}</span>
                {" "}will be removed from your inventory and you'll receive{" "}
                <span className="font-semibold text-gold">{sellValue} Gold</span>.
                This cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            disabled={isSelling}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSelling}
            className={cn(
              "bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 hover:border-gold/60",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            {isSelling ? "Selling…" : `Sell for ${sellValue} Gold`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Equip Feedback Toast ─────────────────────────────────────────────────────

function EquipFeedback({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message + Date.now()}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          role="status"
          aria-live="polite"
          className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="flex items-center gap-2 rounded-lg border border-card-border bg-card px-4 py-2.5 shadow-none">
            <CheckCircle2 className="h-4 w-4 text-primary-text shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CharacterPage() {
  const { gold, xp, inventory, equippedItems, equipItem, unequipItem, sellItem } = useGame();
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sell state
  const [pendingSell, setPendingSell] = useState<{ item: OwnedItem; isEquipped: boolean } | null>(null);
  const [isSelling, setIsSelling] = useState(false);

  function openSlot(slot: Slot) {
    setActiveSlot(slot);
    setDialogOpen(true);
  }

  function showFeedback(msg: string) {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedbackMsg(msg);
    feedbackTimer.current = setTimeout(() => setFeedbackMsg(null), 1800);
  }

  function handleEquip(item: OwnedItem) {
    equipItem(item);
    showFeedback(`${item.name} equipped`);
  }

  function handleUnequip(slot: Slot) {
    const item = equippedItems[slot];
    unequipItem(slot);
    showFeedback(item ? `${item.name} unequipped` : "Slot cleared");
  }

  function handleSellRequest(item: OwnedItem) {
    const isEquipped = equippedItems[item.slot]?.instanceId === item.instanceId;
    setPendingSell({ item, isEquipped });
    // Close the item picker so the confirmation is unambiguous
    setDialogOpen(false);
  }

  async function handleSellConfirm() {
    if (!pendingSell || isSelling) return;
    setIsSelling(true);
    try {
      const goldEarned = await sellItem(pendingSell.item.instanceId);
      showFeedback(`Sold for ${goldEarned} Gold`);
      setPendingSell(null);
    } catch (err) {
      console.error("Sell failed", err);
    } finally {
      setIsSelling(false);
    }
  }

  function handleSellCancel() {
    setPendingSell(null);
  }

  return (
    <>
      <div className="px-4 md:px-8 pt-6 md:pt-10 pb-10 max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-black text-3xl md:text-4xl text-foreground text-balance leading-none">
              CHARACTER
            </h1>
            <p className="text-muted-foreground text-sm mt-1 text-pretty">
              Equip gear to boost your attributes.
            </p>
          </div>
          <ResourceBadges gold={gold} xp={xp} />
        </header>

        {/* ── Desktop layout ── */}
        <div className="hidden md:block mb-10">
          {/*
            4-row explicit grid for precise cross-column alignment:
              Row 1: [empty] | head | [empty]
              Row 2: leftHand | silhouette (spans 2-3) | rightHand   ← same baseline
              Row 3: legs     | silhouette (continued)  | body        ← same baseline
              Row 4: [empty]  | feet (self-end)          | attributes (self-end) ← bottoms aligned
          */}
          <div
            className="grid gap-x-6 gap-y-3 mb-3"
            style={{ gridTemplateColumns: "1fr minmax(210px, 230px) 1fr" }}
          >
            {/* Row 1, Col 2 — Head */}
            <div className="col-start-2 row-start-1">
              <SlotButton
                slot="head"
                equippedItem={equippedItems["head"]}
                onClick={() => openSlot("head")}
              />
            </div>

            {/* Row 2, Col 1 — Left Hand */}
            <div className="col-start-1 row-start-2 self-start">
              <SlotButton
                slot="leftHand"
                equippedItem={equippedItems["leftHand"]}
                onClick={() => openSlot("leftHand")}
              />
            </div>

            {/* Rows 2-3, Col 2 — Silhouette (spans both middle rows) */}
            <div
              className="col-start-2 row-start-2 row-span-2 flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="w-[12.42rem] h-[17.94rem]">
                <CharacterSilhouette equippedItems={equippedItems} />
              </div>
            </div>

            {/* Row 2, Col 3 — Right Hand (top-aligned with Left Hand) */}
            <div className="col-start-3 row-start-2 self-start">
              <SlotButton
                slot="rightHand"
                equippedItem={equippedItems["rightHand"]}
                onClick={() => openSlot("rightHand")}
              />
            </div>

            {/* Row 3, Col 1 — Legs */}
            <div className="col-start-1 row-start-3 self-start">
              <SlotButton
                slot="legs"
                equippedItem={equippedItems["legs"]}
                onClick={() => openSlot("legs")}
              />
            </div>

            {/* Row 3, Col 3 — Body (top-aligned with Legs) */}
            <div className="col-start-3 row-start-3 self-start">
              <SlotButton
                slot="body"
                equippedItem={equippedItems["body"]}
                onClick={() => openSlot("body")}
              />
            </div>

            {/* Row 4, Col 2 — Feet (top-aligned with Attributes) */}
            <div className="col-start-2 row-start-4 self-start">
              <SlotButton
                slot="feet"
                equippedItem={equippedItems["feet"]}
                onClick={() => openSlot("feet")}
              />
            </div>

            {/* Row 4, Col 3 — Attributes (top-aligned with Feet) */}
            <div className="col-start-3 row-start-4 self-start">
              <AttributesPanel equippedItems={equippedItems} />
            </div>
          </div>

          {/* Level / XP bar — full width below paperdoll */}
          <LevelBar xp={xp} />
        </div>

        {/* ── Mobile layout ── */}
        <div className="md:hidden mb-8 flex flex-col gap-6">
          {/* Silhouette */}
          <div className="flex justify-center" aria-hidden="true">
            <div className="w-48 h-72">
              <CharacterSilhouette equippedItems={equippedItems} />
            </div>
          </div>

          {/* 2×3 slot grid — paired by body region: Head|Body / L.Hand|R.Hand / Legs|Feet */}
          <div
            className="grid grid-cols-2 gap-3"
            role="group"
            aria-label="Equipment slots"
          >
            {MOBILE_SLOT_PAIRS.flat().map((slot) => (
              <SlotButton
                key={slot}
                slot={slot}
                equippedItem={equippedItems[slot]}
                onClick={() => openSlot(slot)}
              />
            ))}
          </div>

          {/* Stat panel */}
          <StatPanel xp={xp} equippedItems={equippedItems} />
        </div>

        {/* Inventory */}
        <section aria-labelledby="inventory-heading">
          <h2
            id="inventory-heading"
            className="font-display font-bold text-lg text-foreground text-balance mb-3 uppercase tracking-wide"
          >
            My Items
          </h2>
          <InventoryGrid
            inventory={inventory}
            equippedItems={equippedItems}
            onSlotClick={openSlot}
            onSell={handleSellRequest}
          />
        </section>
      </div>

      {/* Item picker dialog */}
      <ItemPickerDialog
        slot={activeSlot}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        inventory={inventory}
        equippedItems={equippedItems}
        onEquip={handleEquip}
        onUnequip={handleUnequip}
        onSell={handleSellRequest}
      />

      {/* Sell confirmation */}
      <SellConfirmDialog
        item={pendingSell?.item ?? null}
        isEquipped={pendingSell?.isEquipped ?? false}
        isSelling={isSelling}
        onConfirm={handleSellConfirm}
        onCancel={handleSellCancel}
      />

      {/* Equip / sell feedback */}
      <EquipFeedback message={feedbackMsg} />
    </>
  );
}
