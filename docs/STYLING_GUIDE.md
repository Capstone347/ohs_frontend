# Styling Guide

This is the source of truth for how OHS Remote looks. All new pages and components must follow these patterns exactly. The app has two distinct visual themes — **dark** (landing/marketing pages) and **light/wizard** (wizard and app pages). Do not mix them.

Tokens live in:

- `src/index.css` — CSS variables and custom utility classes (`.plan-card`, `.split-panel*`, etc.).
- `tailwind.config.ts` — Tailwind color/animation definitions that reference the variables.

Never hardcode hex / rgb / raw hsl values in components. Always go through the tokens below.

---

## 1. Two themes

### Dark theme (landing page, login, header, footer)

- Page background: `bg-bg-dark` (`min-h-screen bg-bg-dark`).
- Card / surface background: `bg-bg-surface`.
- Elevated surface: `bg-bg-surface-light`.
- Text: `text-text-light` (primary), `text-text-muted` (secondary).
- Borders: `border-border-dark`.

### Light / wizard theme (wizard steps, dashboard, admin, success pages)

- Page background: `bg-wizard-bg`.
- Card background: `bg-white`.
- Text: `text-wizard-text` (primary), `text-wizard-text-muted` (secondary).
- Borders: `border-wizard-border`.

### Light panels inside the dark theme (e.g. `.split-panel-light`, landing pricing cards)

- Text: `text-text-dark` (primary), `text-text-dark-muted` (secondary).
- Background: `bg-white` or `bg-stone-200/80`.

---

## 2. Typography

- **Headings** (`h1`–`h6`): `font-heading` (DM Serif Display). It is set globally on heading elements in `index.css`; reinforce the class when you need it on a non-heading element.
- **Body text**: `font-body` (Inter) — the default, no class required.
- **Page title (h1)**:
  - Wizard: `font-heading text-3xl text-wizard-text mb-2`.
  - Landing: `font-heading text-4xl sm:text-5xl lg:text-6xl text-text-light`.
- **Page subtitle**:
  - Wizard: `text-wizard-text-muted text-lg`.
  - Landing: `text-text-muted text-lg`.
- **Section heading (h2)**: `font-heading text-3xl sm:text-4xl` with the appropriate text color for the context.
- **Card heading (h3)**:
  - Wizard: `font-heading text-xl text-wizard-text`.
  - Light panel on dark: `font-heading text-2xl text-text-dark`.
- **Form label**: `block text-sm font-medium text-wizard-text mb-2`.
- **Small muted text**: `text-sm text-wizard-text-muted` or `text-sm text-text-muted`.
- **Section label / eyebrow**:
  - Wizard: `text-sm font-medium text-wizard-text-muted uppercase tracking-wide`.
  - Landing dark: `text-text-muted text-sm uppercase tracking-wide mb-4`.
- **Prices**: `font-heading text-3xl text-wizard-text` with the `CAD` label as `text-sm text-wizard-text-muted`.

---

## 3. Layout patterns

- **Max-width container**: `max-w-7xl mx-auto px-6` (standard), `max-w-5xl mx-auto px-6` (orders), `max-w-4xl mx-auto px-6` (CTA / hero text), `max-w-2xl` (success / payment standalone pages), `max-w-md` (login).
- **Landing page sections**: `py-24 lg:py-32` vertical padding, `bg-bg-dark` background.
- **Landing page header**: sticky, `h-[72px]`, `bg-bg-dark border-b border-border-dark/50 backdrop-blur-sm`.
- **Wizard header**: `h-16 bg-white border-b border-wizard-border`.
- **Wizard step content**: wrap in `<div className="space-y-8">`. Each step starts with a title block (`h1` + `p` subtitle), then content cards.
- **Wizard main grid**: `grid grid-cols-1 lg:grid-cols-3 gap-8` — form area is `lg:col-span-2`, summary sidebar is `lg:col-span-1`.
- **Wizard navigation buttons**: `<div className="flex justify-between pt-4">` with Back (outline, `px-8`) on the left and Continue (default, `size="lg" className="px-8"`) on the right. First step: `justify-end` (Continue only). Last step: `justify-start` (Back only).
- **Horizontal padding**: use `px-6` consistently across breakpoints.

---

## 4. Cards

### Wizard content card (primary card in wizard steps and app pages)

```
bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8
```

### Dark theme card (landing "How It Works", feature blocks, etc.)

```
bg-bg-surface rounded-2xl border border-border-dark p-8
```

### Split panel layout (landing Packages, Trust, etc.)

Use the utility classes defined in `src/index.css`: `.split-panel`, `.split-panel-dark`, `.split-panel-light`. They expand to:

```
.split-panel        → grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden
.split-panel-dark   → bg-bg-surface p-8 lg:p-12
.split-panel-light  → bg-stone-200/80 p-8 lg:p-12
```

### Selectable card (plan selection)

Use the `.plan-card` / `.plan-card-selected` utilities from `src/index.css`. The selected state is:

```
border-2 border-primary bg-primary/5 shadow-xl shadow-primary/10
```

### Sticky sidebar card (order summary)

Wizard content card pattern plus `sticky top-24`.

### Visual hierarchy inside a card

Strict internal order: optional eyebrow/label → heading → description → content (list / form / preview). Action buttons sit at the card bottom, separated by spacing, never by a divider. Never place actions mid-card.

---

## 5. Buttons

Use `<Button>` from `@/components/ui/button`. Variants:

- **`default`** (primary blue with shadow + subtle scale hover): main CTAs — Continue, Pay, Submit.
  ```tsx
  <Button size="lg" className="px-8">Continue</Button>
  ```
- **`outline`** (wizard-themed border): Back navigation, secondary actions.
  ```tsx
  <Button variant="outline" className="px-8">Back</Button>
  ```
- **Dark CTA on a light panel** (landing pricing cards): override outline —
  ```tsx
  <Button
    variant="outline"
    className="w-full bg-text-dark text-white border-text-dark hover:bg-text-dark/90 hover:text-white"
  >
    Choose plan
  </Button>
  ```
- **`ghost`**: subtle hover-only actions.
- **`link`**: text links styled as buttons.
- **Full-width payment button**: `size="lg" className="w-full h-14 text-lg"`.
- **Landing hero buttons**: `size="lg" className="text-base px-8 py-6"`. Outline variant for the secondary hero CTA:
  ```tsx
  className="bg-transparent border-text-light/30 text-text-light hover:bg-text-light/10 hover:text-text-light"
  ```

Disabled state: opacity 50%, pointer events removed. Hover on clickable cards: elevated shadow + subtle border color shift. Hover on buttons: subtle scale-up.

---

## 6. Form inputs

- Input height: `h-12`.
- Wizard input styling: `bg-white border-wizard-border text-wizard-text`.
- Placeholder: `placeholder:text-wizard-text-muted`.
- Error state: `border-error focus:border-error focus:ring-error`.
- Error message: `<p className="text-error text-sm mt-1">{error}</p>`.
- Required marker: `<span className="text-error">*</span>` after the label text.
- Select trigger: same as the input (`h-12 bg-white border-wizard-border text-wizard-text`).
- Textarea: native `<textarea>` with
  ```
  w-full rounded-md border border-wizard-border bg-white px-3 py-3 text-sm text-wizard-text placeholder:text-wizard-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20
  ```

All new form fields must match existing input height, border, background, placeholder, and error patterns exactly.

---

## 7. Icons

Use **`lucide-react`** exclusively.

```tsx
import { Check, ArrowRight, Loader2 } from 'lucide-react';
```

Standard sizes:

- `w-4 h-4` — inline, buttons.
- `w-5 h-5` — hero buttons, medium standalone.
- `w-6 h-6` — card headers.
- `w-8 h-8` — loading spinners, empty states.
- `w-10 h-10` — large success / error icons.

Common usage:

- Feature list checkmark:
  ```tsx
  <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
  ```
- Loading spinner in a button:
  ```tsx
  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
  ```
- Page-level loading spinner: `<Loader2 className="w-8 h-8 animate-spin text-primary" />`.

Do not install another icon library.

---

## 8. Animations (framer-motion)

All content cards and sections use `framer-motion` for entrance animations. Use these exact patterns.

- **Standard card entrance**:
  ```tsx
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
  ```
- **Staggered list items**: same, plus `delay: index * 0.1`.
- **Subsequent cards on a page**: increment delay by 0.1 (first card: no delay, second: `delay: 0.1`, third: `delay: 0.2`).
- **Landing hero stagger**: `transition={{ duration: 0.6, delay: 0.1 }}`, incrementing by 0.1 per element.
- **Landing sections (whileInView)**:
  ```tsx
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
  ```
- **Success page icon**:
  ```tsx
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5 }}
  ```

Every new section or card must include a framer-motion entrance animation following one of the patterns above.

---

## 9. Status indicators

- **Status badges** (pill): `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium`.
  - Success: `bg-success/10 text-success`.
  - Warning / processing: `bg-warning/10 text-warning`.
  - Error / failed: `bg-destructive/10 text-destructive`.
- **Success icon circle**: `w-20 h-20 rounded-full bg-success/10` with `<CheckCircle className="w-10 h-10 text-success" />`.
- **Error icon circle**: `w-16 h-16 rounded-full bg-destructive/10` with `<AlertCircle className="w-8 h-8 text-destructive" />`.

---

## 10. Toasts

Use `sonner`:

```tsx
import { toast } from 'sonner';

toast.success('Order created');
toast.error('Could not upload logo');
toast.warning('Preview will expire in 24h');
```

The `<Toaster />` is configured at `position="bottom-right"` in `src/App.tsx`. Do not mount another toaster.

---

## 11. Summary / detail rows

Used in order summaries, success pages, and sidebars.

```tsx
<div className="flex justify-between py-3 border-b border-wizard-border">
  <span className="text-wizard-text-muted text-sm">Label</span>
  <span className="text-wizard-text font-medium">Value</span>
</div>
```

The last row omits `border-b`. The total row uses `font-heading text-2xl` or `text-3xl` for the price. Add-ons appear as their own row with a `+` prefix.

---

## 12. Standalone page pattern (Success, Payment, Login)

Pages that sit outside the wizard shell but still use the light theme:

```tsx
<div className="min-h-screen bg-wizard-bg flex items-center justify-center p-6">
  <div className="w-full max-w-2xl">
    {/* Hero / icon section with framer-motion */}
    {/* White content card(s) */}
    {/* Bottom link: Return to Home */}
  </div>
</div>
```

"Return to Home" link: `text-wizard-text-muted hover:text-wizard-text transition-colors text-sm`.

### Login page

Dark background (`min-h-screen bg-bg-dark`) but a white card centered at `max-w-md`:

```
bg-white rounded-2xl shadow-2xl shadow-black/20 p-8
```

Text inside the card uses `text-text-dark` / `text-text-dark-muted`.

---

## 13. Color token quick reference

| Token | Usage |
|---|---|
| `bg-bg-dark` | Dark page backgrounds |
| `bg-bg-surface` | Dark cards, footer |
| `bg-bg-surface-light` | Dark elevated surfaces, icon containers |
| `bg-wizard-bg` | Light page backgrounds |
| `bg-white` | Light cards |
| `text-text-light` | Primary text on dark |
| `text-text-muted` | Secondary text on dark |
| `text-text-dark` | Primary text on light panels within dark sections |
| `text-text-dark-muted` | Secondary text on light panels |
| `text-wizard-text` | Primary text on wizard / app pages |
| `text-wizard-text-muted` | Secondary text on wizard / app pages |
| `border-border-dark` | Borders on dark theme |
| `border-wizard-border` | Borders on wizard / light theme |
| `text-primary` / `bg-primary` | Blue accent, CTAs |
| `text-success` / `bg-success` | Green — checkmarks, completed states |
| `text-warning` / `bg-warning` | Amber — processing states |
| `text-error` / `bg-error` | Red — errors, required markers |

---

## 14. Behavioral UI patterns

These are product-level rules about how certain interactions should feel. They are as binding as the visual rules above.

### Selection and add-ons

When presenting purchasable options, use a two-tier approach: primary choices as side-by-side selectable cards, then a conditional upsell / add-on section that animates in only after a primary selection is made. Add-ons appear as highlight cards with gradient backgrounds and a toggle mechanism. Never nest selections more than two levels deep.

### Document / content previews

When showing previews of gated content, render real content at the top with progressive blur increasing downward. Overlay a gradient fade from transparent to solid white at the bottom third. Place a floating pill-shaped CTA centered over the blur zone to drive conversion. The preview container has a fixed max-height with `overflow-hidden`.

### Pricing display

Prices always use the heading font at a large size. The `CAD` label is small muted text beside or below the price. When a total is composed of multiple line items, show each as a summary row with a divider, then a bold total row **without** a bottom border. Add-ons appear as their own line item with a `+` prefix.

### Progressive disclosure

Never show all options or fields at once. Reveal secondary UI (add-ons, optional fields, advanced settings) only after the user completes a prerequisite action. Use `framer-motion` to animate newly revealed sections in from below with opacity fade.

### Empty and loading states

Every data-dependent view needs both a loading skeleton and an empty state. Loading uses pulse-animated skeleton blocks matching the layout shape. Empty states use a centered icon (muted color, medium size), a heading, and a single line of helper text with an optional action button.

### Responsive stacking

Multi-column layouts (grids, split panels, sidebar + content) collapse to single-column on mobile. Sidebars stack below main content on small screens. Sticky sidebars lose their sticky behavior on mobile. Navigation collapses to a hamburger menu at the `lg` breakpoint.

### Interaction feedback

All clickable cards have hover states with elevated shadow and subtle border color shift. Selected states use a primary-colored border, a light primary background tint, and a visible indicator (checkmark or radio dot). Buttons use subtle scale-up on hover. Disabled elements reduce opacity to 50% and remove pointer events.

### Section separation

Sections on landing pages are separated by generous vertical padding alone — **never** by horizontal rules or visible dividers. Within wizard steps, content groups are separated by distinct cards rather than dividers inside a single card.

---

## 15. Consistency rules for new components

- Always derive colors from semantic tokens. Never hardcode hex / rgb / raw hsl values.
- Every new section or card must include a framer-motion entrance animation following §8.
- Icon usage is `lucide-react` only.
- All text must use the theme tokens that match the page context (dark vs wizard).
- New form fields must match existing input height, border, background, placeholder, and error patterns exactly.
- When in doubt about spacing, borders, or shadows, reference the nearest existing sibling component and match it — do not invent a new variant.
