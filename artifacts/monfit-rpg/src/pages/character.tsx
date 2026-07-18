import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Shield, Hand, Swords, Layers, Footprints, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useGame, type OwnedItem } from "@/lib/game-context";
import { SLOT_LABELS, RARITY_LABELS, type Slot, type Rarity } from "@/data/lootTable";
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

const LEFT_SLOTS: Slot[] = ["head", "leftHand", "legs"];
const RIGHT_SLOTS: Slot[] = ["body", "rightHand", "feet"];

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
        "w-full min-h-11 flex flex-col gap-1 rounded-lg border px-3 py-3 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        equippedItem
          ? "bg-card border-card-border hover:border-primary/50"
          : "bg-card border-card-border hover:border-muted-foreground/40",
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="text-xs font-medium text-muted-foreground">
          {SLOT_LABELS[slot]}
        </span>
      </div>
      {equippedItem ? (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground leading-snug line-clamp-1">
            {equippedItem.name}
          </span>
          <span
            className={cn(
              "text-xs font-semibold uppercase tracking-wide",
              RARITY_TEXT_CLASS[equippedItem.rarity],
            )}
          >
            {RARITY_LABELS[equippedItem.rarity]}
          </span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground/70">+ Add gear</span>
      )}
    </button>
  );
}

// ─── Stat Panel ───────────────────────────────────────────────────────────────

function StatPanel({
  xp,
  gold,
  equippedItems,
}: {
  xp: number;
  gold: number;
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

      {/* Gold */}
      <div className="flex items-center justify-between border-t border-card-border pt-3">
        <span className="text-xs text-muted-foreground">
          Gold
        </span>
        <span className="text-sm font-bold text-gold tabular-nums">{gold}</span>
      </div>

      {/* Stats */}
      <div className="border-t border-card-border pt-3 flex flex-col gap-2">
        <span className="text-xs text-muted-foreground mb-0.5">
          Attributes
        </span>
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
}: {
  slot: Slot | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  inventory: OwnedItem[];
  equippedItems: Partial<Record<Slot, OwnedItem>>;
  onEquip: (item: OwnedItem) => void;
  onUnequip: (slot: Slot) => void;
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
                <button
                  key={item.instanceId}
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
                  aria-label={
                    isEquipped
                      ? `Unequip ${item.name}`
                      : `Equip ${item.name}`
                  }
                  className={cn(
                    "w-full min-h-11 flex items-center gap-3 px-5 py-3 text-left transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:z-10 relative",
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
              );
            })}
          </div>
        )}

        {equipped && slotItems.some((i) => i.instanceId === equipped.instanceId) === false && (
          /* equipped item is in inventory but its slot-filter already covers it */
          null
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
}: {
  inventory: OwnedItem[];
  equippedItems: Partial<Record<Slot, OwnedItem>>;
  onSlotClick: (slot: Slot) => void;
}) {
  const [tooltipId, setTooltipId] = useState<string | null>(null);

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
        const SlotIcon = SLOT_ICONS[item.slot];
        const rarityColor = RARITY_COLOR_VAR[item.rarity];

        return (
          <div key={item.instanceId} className="relative" role="listitem">
            <button
              type="button"
              onClick={() => onSlotClick(item.slot)}
              onMouseEnter={() => setTooltipId(item.instanceId)}
              onMouseLeave={() => setTooltipId(null)}
              onFocus={() => setTooltipId(item.instanceId)}
              onBlur={() => setTooltipId(null)}
              aria-label={`${item.name}${isEquipped ? " (equipped)" : ""} — ${RARITY_LABELS[item.rarity]} ${SLOT_LABELS[item.slot]}, +${item.statValue} ${item.statLabel}. Click to manage.`}
              aria-describedby={slotTooltipId}
              className={cn(
                "relative w-full aspect-square min-h-[44px] rounded-lg flex flex-col items-center justify-center gap-1 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isEquipped ? "border-2" : "border",
              )}
              style={{
                borderColor: rarityColor,
                backgroundColor: isEquipped
                  ? `hsl(var(--rarity-${item.rarity}) / 0.12)`
                  : "hsl(var(--card))",
              }}
            >
              <SlotIcon
                className="h-5 w-5 shrink-0"
                style={{ color: rarityColor }}
                aria-hidden="true"
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

            {/* Tooltip — always in DOM for aria-describedby; visually toggled */}
            <div
              id={slotTooltipId}
              role="tooltip"
              aria-hidden={!showTooltip}
              className={cn(
                "absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2",
                "w-max max-w-[12rem] rounded-lg border border-card-border px-3 py-2",
                "flex flex-col gap-0.5 pointer-events-none select-none",
                "transition-opacity duration-150",
                showTooltip ? "opacity-100" : "opacity-0",
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
            </div>
          </div>
        );
      })}
    </div>
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
  const { gold, xp, inventory, equippedItems, equipItem, unequipItem } = useGame();
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:gap-6 mb-10">
          {/* Left slots */}
          <div className="flex flex-col gap-3">
            {LEFT_SLOTS.map((slot) => (
              <SlotButton
                key={slot}
                slot={slot}
                equippedItem={equippedItems[slot]}
                onClick={() => openSlot(slot)}
              />
            ))}
          </div>

          {/* Silhouette */}
          <div className="flex items-start justify-center pt-1">
            <div className="w-36 h-56" aria-hidden="true">
              <CharacterSilhouette equippedItems={equippedItems} />
            </div>
          </div>

          {/* Right slots + stat panel */}
          <div className="flex flex-col gap-3">
            {RIGHT_SLOTS.map((slot) => (
              <SlotButton
                key={slot}
                slot={slot}
                equippedItem={equippedItems[slot]}
                onClick={() => openSlot(slot)}
              />
            ))}
            <StatPanel xp={xp} gold={gold} equippedItems={equippedItems} />
          </div>
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
          <StatPanel xp={xp} gold={gold} equippedItems={equippedItems} />
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
      />

      {/* Equip feedback */}
      <EquipFeedback message={feedbackMsg} />
    </>
  );
}
