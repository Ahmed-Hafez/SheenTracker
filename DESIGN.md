---
name: SheenTrack 360°
description: Workforce intelligence workspace for Sheen Information Technology, in warm paper, graphite, and signal amber.
colors:
  orange-50: "#fdf0e0"
  orange-300: "#f5a84a"
  orange-500: "#e8821a"
  orange-700: "#b5600e"
  orange-900: "#7a3e06"
  charcoal-50: "#f5f4f0"
  charcoal-100: "#e8e7e3"
  charcoal-400: "#aeada9"
  charcoal-600: "#5c5c59"
  charcoal-800: "#3a3a38"
  charcoal-900: "#1d1d1b"
  page-bg: "#f4f2ef"
  white: "#ffffff"
  success: "#1d9e75"
  success-bg: "#e1f5ee"
  warning: "#ba7517"
  warning-bg: "#faeeda"
  danger-strong: "#ac312c"
  danger-hover: "#a94845"
  info: "#185fa5"
  info-bg: "#e6f1fb"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title-sm:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.06em"
  metric:
    fontFamily: "DM Mono, monospace"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
  mono-sm:
    fontFamily: "DM Mono, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.02em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.orange-500}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  button-primary-hover:
    backgroundColor: "{colors.orange-700}"
  button-secondary:
    backgroundColor: "{colors.page-bg}"
    textColor: "{colors.charcoal-800}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  button-secondary-hover:
    backgroundColor: "{colors.orange-50}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.orange-700}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  button-ghost-hover:
    backgroundColor: "{colors.orange-50}"
  button-danger:
    backgroundColor: "{colors.danger-strong}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  button-danger-hover:
    backgroundColor: "{colors.danger-hover}"
  input:
    backgroundColor: "{colors.page-bg}"
    textColor: "{colors.charcoal-900}"
    rounded: "{rounded.md}"
    padding: "5px 12px"
    height: "38px"
  chip:
    backgroundColor: "{colors.white}"
    textColor: "{colors.charcoal-600}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  chip-selected:
    backgroundColor: "{colors.orange-50}"
    textColor: "{colors.orange-900}"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  kpi-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "16px 20px"
  hours-badge:
    backgroundColor: "{colors.orange-50}"
    textColor: "{colors.orange-500}"
    typography: "{typography.mono-sm}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
  status-badge:
    rounded: "{rounded.full}"
    padding: "3px 10px"
  sidebar:
    backgroundColor: "{colors.charcoal-900}"
    textColor: "{colors.white}"
    width: "200px"
  topbar:
    backgroundColor: "{colors.charcoal-50}"
    height: "64px"
---

# Design System: SheenTrack 360°

## Overview

**Creative North Star: "The Ember Ledger"**

SheenTrack reads like a well-kept ledger on warm paper. The workspace sits on a soft off-white page, surfaces are clean white sheets edged with fine warm hairlines, and every number is set in a monospaced face like an entry in a book. Within that calm, Signal Amber is the ember. It marks the primary action, the selected item, and the hours that matter, so the eye goes to it first.

The shell has two parts: a dark Graphite navigation rail on the left and a light, warm workspace on the right. Information is dense because this is an internal tool used daily, but the density stays readable. The base size is 14px, rows have generous padding, and labels sit small and uppercase above large mono figures. Components are warm and tactile. Corners are softly rounded, buttons give slightly when pressed, and cards lift gently off the page.

**Key Characteristics:**
- Warm neutrals throughout. Page, surfaces, and greys all carry a slight yellow-brown cast.
- One brand accent, Signal Amber, used for action, selection, and highlighted hours.
- Plus Jakarta Sans for interface text, DM Mono for every figure.
- Dark Graphite sidebar against a light paper workspace.
- PrimeNG components themed through `src/primeng-preset.ts`, so third-party controls inherit the same tokens.

## Colors

The palette is warm paper and graphite with a single amber signal, plus a small, conventional set of status hues.

### Primary
- **Signal Amber** (orange-500): Primary buttons, the selected chip and date, the progress fill, KPI icons, sort-icon hover, and the "Track 360°" half of the wordmark. PrimeNG's `primary` maps here.
- **Deep Amber** (orange-700): Hover and pressed states for primary actions, ghost-button text, and highlighted text.
- **Burnt Amber** (orange-900): Text on amber tints, such as selected chips, task badges, and avatar initials.
- **Amber Glow** (orange-300): Hover borders on chips and user rows, avatar rings, hours-badge outlines, and date hover.
- **Amber Wash** (orange-50): Tinted backgrounds for selections, KPI icon tiles, hours badges, and ghost/secondary hover.

### Neutral
- **Graphite** (charcoal-900): Primary text, and the sidebar background.
- **Dark Graphite** (charcoal-800): Dividers inside the sidebar, and secondary-button text.
- **Slate Graphite** (charcoal-600): Secondary text, KPI labels, input labels, and placeholders.
- **Ash** (charcoal-400): Disabled text, zero-hour badges, and inactive sort icons.
- **Hairline** (charcoal-100): The default border on cards, inputs, chips, table cells, and progress tracks.
- **Linen** (charcoal-50): Topbar background, table-row hover, and disabled field fill.
- **Warm Paper** (page-bg): The page canvas. Inputs, selects, and tabs also sit on it, so fields read as inset into the white cards.
- **White** (white): Cards and KPI tiles.

### Status
- **Success** (success / success-bg): Resolved work items and positive deltas.
- **Warning** (warning / warning-bg): Caution states.
- **Info** (info / info-bg): Active work items.
- **Danger** (danger-strong / danger-hover): Destructive buttons. The CSS variable `--danger-bg` holds this strong red despite its name, and `--danger` is referenced by `.kpi-delta.negative` and the Tailwind `danger` color but is **not defined** in `styles.css`. Fix both before relying on danger tokens.

### Named Rules
**The Single Ember Rule.** Signal Amber is the only brand hue. Status colors communicate state and never decorate. Any other emphasis comes from Graphite weight, not a new color.

**The Warm Neutral Rule.** Every grey comes from the charcoal scale. Tailwind's cool greys (`gray-*`, `slate-*`, `#6b7280`, `#e5e7eb`) still appear in places. They are drift, not system.

## Typography

**Body Font:** Plus Jakarta Sans (with sans-serif)
**Mono Font:** DM Mono (with monospace)

**Character:** A friendly geometric sans for everything a person reads, and a ledger-like mono for everything a person counts. The two never swap roles.

### Hierarchy
- **Display** (700, 36px, 1.1, -0.03em): Rare hero numbers or page-level statements. Use the `.display` class.
- **Headline** (700, 24px, 1.2, -0.02em): `h1`, page titles.
- **Title** (600, 18px, 1.3, -0.01em): `h2`, section heads.
- **Title Small** (600, 15px, 1.4): `h3`, card titles, and the topbar page title.
- **Body** (400, 14px, 1.6): Default text. The app's base size is 14px.
- **Body Small** (400, 12px, 1.5): Hints, captions, and sublines. Use the `.small` class.
- **Label** (700, 11px, 0.06em, uppercase): Field and KPI labels. Use the `.label` class. Sidebar section labels shrink to 9px at 0.1em.
- **Metric** (DM Mono 700, 24px, -0.03em, tabular): KPI values. The `.mono-metric` class sets the same figure at 20px.
- **Mono Small** (DM Mono 500, 13px, 0.02em): Hours in badges and tables.

### Named Rules
**The Ledger Rule.** Every count, hour total, or percentage is set in DM Mono with `tabular-nums` so columns line up. Text that describes a number stays in Jakarta Sans.

## Layout

The shell is fixed. A 200px Graphite sidebar (`--sidebar-width`) sits on the left and collapses to an icon rail. A 64px Linen topbar (`--topbar-height`) shows the page title, the date-range picker or quarter selector, and Refresh. Content scrolls in the remaining area with 24px padding (`--space-xl`). On phones the sidebar becomes an off-canvas overlay with a dimmed scrim, and the layout motion is disabled under `prefers-reduced-motion`.

Spacing uses a 4px base unit: xs 4, sm 8, md 12, lg 16, xl 24, 2xl 32, 3xl 48. Within a page, a KPI row runs one column on phones, two on tablets, and five on desktop (`grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4`). Chart pairs split two-thirds and one-third and stack on small screens. Cards are separated by 16px. Form grids auto-fit columns of at least 200px with 16px gaps.

## Elevation & Depth

Surfaces are gently lifted. Warm Paper is the ground, white cards rest just above it on a soft ambient shadow, and a 1px Hairline border defines each edge. Shadows are structural cues: they tell you which surface is a container or an interactive control. They stay low and diffuse and never become dramatic.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 2px 4px rgba(0,0,0,0.05)`): Cards and chart containers.
- **Button rest** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): All `.btn` variants at rest.
- **Amber focus halo** (`box-shadow: 0 0 0 3px rgba(232,130,26,0.2)`): Focus on secondary and ghost buttons. Inputs use the softer 0.12 alpha.

### Named Rules
**The Paper Stack Rule.** There are only two levels: paper and sheet. Overlays (dialogs, menus, selects) are the only surfaces allowed above a card, and they come from PrimeNG.

## Shapes

Corners are softly rounded and consistent. Inputs, buttons, chips, KPI icon tiles, and hours badges use 8px. Cards, KPI tiles, user rows, and large buttons use 12px. Menus use 14px. Status badges and avatars are pills or circles. Progress bars are thin 4px tracks with 4px ends. Borders are 1px on surfaces and 1.5px on interactive controls (fields, chips), so controls read slightly firmer than containers.

## Components

### Buttons
Warm and tactile. Each press visibly gives.
- **Shape:** gently rounded (8px). Large buttons use 12px.
- **Primary:** Signal Amber fill, white text, 15px/500, 6px 12px padding, 6px icon gap. Hover shifts to Deep Amber, and pressed scales to 0.98.
- **Secondary:** Warm Paper fill with a warm border (#e3e1de) and dark text. Hover warms to a pale amber (#ffefd9), and focus shows the amber halo.
- **Ghost:** Transparent with Deep Amber text. Hover fills with Amber Wash. Used for the sidebar toggle and low-emphasis actions.
- **Danger:** Strong red fill, white text. Hover darkens and presses in.
- **Sizes:** small (5px 12px, 12px text) and large (12px 28px, 12px radius).
- **Disabled:** 45% opacity with a not-allowed cursor.

### Chips
- **Style:** White background, 1.5px Hairline border, 8px radius, 13px Slate Graphite text.
- **State:** Hover warms the border to Amber Glow. Selected uses an Amber Wash fill, a Signal Amber border, and Burnt Amber text.

### Badges
- **Status badge:** A pill with a 6px leading dot, 11px/600 text, and a tinted background. Active uses Info, Resolved uses Success, Closed uses Hairline/Slate, and Task uses Amber.
- **Hours badge:** A DM Mono figure on Amber Wash with an Amber Glow outline. "High" inverts to solid Signal Amber with white text. "Zero" falls back to Hairline fill with Ash text and no border. It comes in sm, md, and lg sizes.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** White on Warm Paper.
- **Shadow Strategy:** Card lift (see Elevation & Depth).
- **Border:** 1px Hairline.
- **Internal Padding:** 16px. KPI cards use 16px 20px.

### KPI Card
This is the system's signature tile. An uppercase 11px Slate label sits above a 24px DM Mono figure with tabular numbers, with an optional 12px hint below. A 32px Amber Wash icon tile with a Signal Amber glyph sits in the top-right corner. Units inside a value turn amber.

### Inputs / Fields
- **Style:** 38px tall, Warm Paper fill, 1.5px Hairline border, 8px radius, 13px text, Slate placeholder. Search fields add a leading PrimeIcons magnifier at 36px inset.
- **Focus:** The border turns Signal Amber and a soft 3px amber halo appears (alpha 0.12).
- **Disabled:** Linen fill, Ash text.
- **PrimeNG:** inputtext, textarea, select, and inputgroup are themed to the same Warm Paper fill, Hairline border, and 8px radius.

### Data Tables (PrimeNG)
Header cells sit on near-white (#f9f8f7) with Graphite text at weight 400 and 0.5rem 1rem padding. Body cells use 0.75rem 1rem padding with Hairline row borders. Hover rows go to Linen, and sort icons turn amber on hover.

### Navigation
- **Sidebar:** Graphite, 200px wide, collapsible. The logo and wordmark sit at the top, with "Track 360°" in amber. Section labels are 9px uppercase at 25% white. Menu items (PrimeNG panelmenu) are 70% white text and get a 10% white wash on focus or hover. The user block at the bottom has an amber avatar and a round logout button with an amber 2px focus outline.
- **Topbar:** Linen with a Hairline bottom border. It holds the sidebar toggle, a 1px divider, the page title and subtitle, then right-aligned controls: a date range or quarter select, and a secondary Refresh button.

### Avatar
A 40px circle with Amber Wash fill, Burnt Amber initials (13px/700), and a 2px Amber Glow ring.

## Do's and Don'ts

### Do:
- **Do** reference tokens (`var(--orange-500)`, Tailwind `bg-primary`, `text-(--charcoal-600)`) rather than raw hex.
- **Do** set every figure in DM Mono with `tabular-nums`.
- **Do** keep fields on Warm Paper inside white cards, so inputs read as inset.
- **Do** theme PrimeNG components through `src/primeng-preset.ts` instead of overriding their CSS.
- **Do** give interactive controls the amber focus treatment (3px halo or 2px outline).
- **Do** use 12px radius for containers and 8px for controls.

### Don't:
- **Don't** introduce a second brand hue. Status colors are for state only.
- **Don't** use Tailwind's cool greys (`gray-*`, `slate-*`) or `#6b7280` and `#e5e7eb`. Use the charcoal scale.
- **Don't** hardcode chart colors outside the palette. Several ECharts option files currently do this and should move to tokens.
- **Don't** stack shadows or raise cards above the card-lift shadow. Only PrimeNG overlays sit higher.
- **Don't** use `--danger` until it is defined in `styles.css`.
