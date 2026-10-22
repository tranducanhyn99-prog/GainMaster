# Design System — GainMaster (Clean Daylight / Style B)

## Mode & Platform Authority

- **Mode:** `Operate` (Task completion, high scanability in gym and kitchen contexts, native iOS expectations).
- **Platform:** `ios` (HIG-aligned 4-tab bottom bar, modal sheets for self-contained profile/settings tasks, 44×44pt minimum touch targets, safe-area inset compliance).

## Color Palette (Style B — Clean Daylight)

| Token | Hex | Role |
|---|---|---|
| `background` | `#F6F5F2` | Warm Alabaster app canvas (avoids harsh `#FFFFFF` glare under gym lights) |
| `surface` | `#FFFFFF` | Primary elevated card surface |
| `surfaceMuted` | `#F1F5F9` | Secondary pill/input/track surface |
| `border` | `#E2E8F0` | Subtle 1px structural divider & card border |
| `primary` | `#10B981` | Emerald — primary interactive tint, protein bar, active completion state |
| `primaryDark` | `#059669` | Deep Emerald for high-contrast text labels on light emerald surfaces |
| `primarySoft` | `#ECFDF5` | Tinted surface for AI insights and active goal badges |
| `sky` | `#0EA5E9` | Sky Blue — carbohydrate indicator & workout phase accent |
| `coral` | `#F97316` | Warm Coral — dietary fat indicator, rest timer & streak highlight |
| `textPrimary` | `#0F172A` | Deep Slate primary ink (contrast > 14:1 on `#FFFFFF`) |
| `textSecondary` | `#475569` | Slate secondary copy (contrast > 7:1 on `#FFFFFF`) |
| `textMuted` | `#64748B` | Supporting captions and timestamps (contrast >= 4.6:1) |
| `danger` | `#EF4444` | Destructive action / validation alert |

## Typography & Numeric Discipline

- **Font Family:** iOS System (`SF Pro Text` / `SF Pro Display` via `System` font family on React Native, with clean sans fallback on Web).
- **Scale:**
  - `largeTitle`: `26px`, weight `800`, tracking `-0.5px`
  - `title`: `20px`, weight `700`, tracking `-0.3px`
  - `sectionHeading`: `16px`, weight `700`
  - `body`: `15px`, weight `500`, line-height `22px`
  - `caption`: `13px`, weight `600`, line-height `18px`
  - `small`: `11.5px`, weight `600`
- **Tabular Numerals:** Every calorie count, gram target, weight (`kg`), measurement (`cm`), rep range, and countdown timer MUST apply `fontVariant: ['tabular-nums']` so vertical columns and live timers never jitter.

## Layout, Spacing & Touch Targets

- **Touch Targets:** Minimum `44×44pt` (`minHeight: 44`, `minWidth: 44`) on all buttons, tab items, swap triggers, checkboxes, and the top-right `⚙️` settings button.
- **Card Rhythm:** `16px` horizontal screen padding, `16px` internal card padding, `12px–16px` vertical gap between cards, `20px` border radius on primary cards.
- **Depth:** Soft, natural elevation (`shadowOffset: { width: 0, height: 4 }`, `shadowOpacity: 0.05`, `shadowRadius: 12`) paired with a crisp `1px` `#E2E8F0` border. No hard neobrutalist shadows, no thick colored side borders, no decorative glassmorphism.
- **Craft Floor Bans Enforced:**
  - No eyebrow/kicker labels above section headings.
  - No gradient text.
  - Drawn SVG icons in navigation and key controls rather than raw emoji strings standing in for a system icon set.
