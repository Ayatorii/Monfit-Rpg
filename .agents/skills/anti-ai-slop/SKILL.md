---
name: anti-ai-slop
description: AVE's ANTI-AI-SLOP DESIGN RULES for MONFIT RPG. Load this skill whenever building, refining, or reviewing any UI screen in this project. Contains a mandatory self-check checklist to run before presenting finished UI work.
---

# AVE's ANTI-AI-SLOP DESIGN RULES

A mandatory checklist for every UI screen built in this project. Run the self-check at the bottom before marking any screen as done.

## The Rules

### 1. No glows or drop-shadows on text, buttons, or icons
Dark glows and soft drop-shadows on interactive elements are the single most common AI UI tell. Use flat, crisp edges. The only permitted glow is the intentional `--primary-glow` box-shadow on the **selected goal card** in the Train screen — that exception is documented and deliberate.

### 2. No gradient backgrounds
No `radial-gradient`, no `linear-gradient` as a surface or background fill — especially the purple-to-blue / violet vignette pattern. Use a single flat solid color from the token system (`--background`, `--card`, `--surface`).

### 3. No bounce or elastic easing
Use `ease-out`, `easeOut`, or `linear` only. No `spring` physics with bounce, no `elastic`, no `back` easing. The Framer Motion spring used on goal card scale in Train is the only permitted spring — it has `damping: 22` which is critically damped (no bounce).

### 4. No pure black or flat gray surfaces
Never use `#000000`, `bg-black`, or an unmodified neutral gray as a background or card surface. Dark surfaces must carry a slight tint toward the brand hue. The project background is `hsl(258 59% 8%)` — a deep violet-black, not a flat black. Match or derive from that.

### 5. No cards nested inside cards
A card inside a card is always wrong. Nested elevation creates visual noise and breaks hierarchy. Use borders, spacing, and typography weight instead of a second card layer.

### 6. No default rounded-square icon tiles above headings
The pattern of a rounded-square tile containing an icon sitting above every section heading is pure AI scaffold. Icons belong inline with text, in buttons, or as part of data — not as decoration above every heading.

### 7. No gray text on dark/colored backgrounds
Gray text on dark surfaces loses contrast and looks like a design mistake. Use the defined tokens: `text-foreground` (white), `text-muted-foreground` (`#DDD7FE` light violet), or `text-primary-text` (lighter violet, ≥5.8:1 on card). Never reach for arbitrary gray.

### 8. Do not default to Inter, Arial, or system-ui
The project fonts are **Onest** (body/UI) and **Barlow Condensed** (display/headings). Use them. Never fall back to Inter or system-ui as a first choice — those are the generic AI defaults.

### 9. Use existing assets as-is — never redraw them
The MONFIT RPG emblem (`06a9ab81-...removalai_preview_1784032498122.png`) and all goal images (`build-muscle.png`, `lose-weight.png`, `endurance.png`, `general-fitness.png`) must be used as the actual image files. Do not substitute an inline SVG, a lucide icon, or a simplified reinterpretation — that destroys brand identity.

---

## Mandatory Self-Check

Run this before presenting any finished screen. Answer each line:

```
[ ] No glow/shadow on text, buttons, or icons (except the documented goal-card glow)
[ ] No gradient background — solid color tokens only
[ ] No bounce/elastic easing — only ease-out or critically-damped springs
[ ] Dark surfaces tinted toward brand hue, not flat black or gray
[ ] No nested cards
[ ] No rounded-square icon tiles above headings
[ ] Gray text only on light surfaces — dark surfaces use foreground/muted-foreground/primary-text tokens
[ ] Fonts are Onest (body) and Barlow Condensed (display) — not Inter / Arial / system-ui
[ ] Existing image assets used as <img> files, not redrawn as SVG or icons
```

If any box is unchecked, fix it before presenting.

---

## Project Token Quick Reference

| Token | Value | Use |
|---|---|---|
| `--background` | `hsl(258 59% 8%)` | Page background |
| `--card` | `hsl(258 40% 13%)` | Card surfaces |
| `--surface` | `hsl(258 45% 11%)` | Nav / sidebar chrome |
| `--foreground` | `hsl(0 0% 100%)` | Primary text (white) |
| `--muted-foreground` | `hsl(251 91% 92%)` | Secondary text (#DDD7FE) |
| `--primary` | `hsl(249 100% 66%)` | Brand violet (#6E54FF) — accents/borders only |
| `--primary-text` | `hsl(249 85% 75%)` | Small violet text (≥5.8:1 on card) |
| `--gold` | `hsl(43 96% 56%)` | Gold reward accent |
| `--xp` | `hsl(189 94% 70%)` | XP / cyan accent |
| `--primary-glow` | `hsl(var(--primary) / 0.35)` | Selected card glow only |
