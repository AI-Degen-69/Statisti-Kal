# Statisti-Kal — Project Knowledge

Hebrew-first (RTL) academic statistics calculator web app for students. Provides hypothesis testing, normal distribution, point estimation, linear regression, formula/tables reference, exam walkthroughs, and self-testing — all with step-by-step guided workflows and interactive charts.

## Quickstart

All code lives in `web/`. Run from that directory:

```bash
cd web
npm install        # (pnpm also supported)
npm run dev        # Vite dev server on port 3000 (open network: 0.0.0.0)
npm run build      # Production build
npm run preview    # Preview production build
npm test           # Vitest (jsdom)
npm run lint       # tsc --noEmit + color lint
npm run lint:tsc   # TypeScript type-check only
npm run lint:colors # Color token validation (no raw slate/gray/zinc, no magic hex)
```

## Architecture

- **Entry:** `web/src/main.tsx` → `web/src/App.tsx`
- **Pages:** `App.tsx` lazy-loads calculators via React.Suspense. Active page state (`landing`, `hypothesis`, `point-estimation`, `exam-2023`, `normal`, `summary`, `regression`, `test-yourself`) drives routing in-app (no React Router).
- **Calculators:** `HypothesisTestingCalculator`, `NormalDistributionCalculator`, `PointEstimationPage`, `LinearRegressionCalculator`, `Exam2023Page`, `TestYourselfPage`, `SummaryPage` — each is a top-level page component.
- **UI primitives:** `web/src/components/ui/` — shared design-system components (Button, Card, Input, Modal, Heading, Accordion, Tooltip, PageLayout, etc.). **All new UI must use these templates** (per DESIGN.md), never raw `<div>` for foundational elements.
- **Statistics logic:** `web/src/lib/statistics/` — pure functions for hypothesis testing, math helpers, and power calculations.
- **Charts:** `web/src/components/charts/` — D3.js + Recharts-based charts (NormalChart, HypothesisChart, ChartPrimitives).
- **Calc UI widgets:** `web/src/components/calc-ui/` — parameter inputs, mode switches, formula tokens specific to calculator pages.
- **Tables:** `web/src/components/tables/` — ZTable and TTable reference tables.
- **Guided tours:** `web/src/config/tours.ts` + react-joyride for step-by-step Hebrew walkthroughs.
- **Data flow:** No global state library. Calculator state is local React state passed via props. `useLocalStorageState` hook for persistence. Tour state managed in `App.tsx`.
- **Navigation:** `handleNavigate` in `App.tsx` accepts a `SitePage` value. Normal-distribution sub-modes are stored to localStorage as `ND_mode`. Add new pages by extending the `ActivePage` type and `SitePage` type.

## Design & Styling

- **Aesthetic:** "Editorial Academic" (DESIGN.md v2.0) — warm, clean, narrative-first, like a high-end printed textbook.
- **Theme:** Light mode. Background = warm paper `#F9F9F6`, surface = pure white `#FFFFFF`.
- **Accent colors:** Indigo `#4361EE` (primary/H₁), brass `#D4A843` (H₀/warning, retained from prior system), teal-green `#10B981` (success/acceptance), crimson `#EF4444` (error/rejection).
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`). Design tokens defined in `web/src/index.css` via CSS custom properties (`:root`) and `@theme` block.
- **Fonts:** Assistant (body + headings, weights 400–800), Plus Jakarta Sans (alt sans), Frank Ruhl Libre (serif accents), Geist Mono (code/data), Gveret Levin (handwriting annotations via `HandwrittenNote`).
- **Motion:** Framer Motion (`motion` package) for page transitions, staggered entrances, and glow effects. Motion tokens (`--motion-duration-*`, `--motion-easing-*`) defined in `index.css`.
- **Math rendering:** KaTeX via `react-katex`. Formula display uses `FormulaBlock` component.
- **RTL:** Full Hebrew right-to-left interface. KaTeX blocks are force-isolated to LTR (critical — do not modify the `.katex` rules in `index.css`).
- **Icons:** `lucide-react`. **Mega-menu:** `@radix-ui/react-navigation-menu`.

## Conventions

- **TypeScript:** `noEmit: true`, ESNext modules, ES2022 target. `strict` is not enabled.
- **Imports:** Path alias `@/*` maps to `web/*` root. Use it for absolute imports within `web/`.
- **File naming:** PascalCase for components, camelCase for hooks/utils/tests. Test files use `.test.ts(x)` suffix.
- **Testing:** Vitest + jsdom + Testing Library. Setup file: `web/src/test-setup.ts`. Test files colocated with source.
- **Package manager:** `npm` is primary (scripts reference npm). `pnpm` lockfile + workspace config also present — use `pnpm` if preferred.
- **Components must use design tokens:** Colors via `var(--color-*)`, spacing via `var(--spacing-*)`, rounded corners via `var(--rounded-*)`. No raw hex, no Tailwind slate/gray/zinc utilities.
- **Headings:** Use `<Heading>` component (from `web/src/components/ui/Heading.tsx`), never raw `<h1>`/`<h2>`/`<h3>`. ESLint `react/forbid-elements` enforces this in calculator files (`*Calculator.tsx`, `calc-ui/**/*.tsx`).
- **KaTeX strings:** ALWAYS use `String.raw\`...\`` template literals for KaTeX math props. Standard string literals silently consume escape sequences (`\b`→backspace, `\m`→ignored, `\s`→ignored). Never inject raw Unicode math chars (σ, μ, x̄) — use LaTeX macros (`\sigma`, `\mu`, `\bar{x}`).

## Gotchas

- **KaTeX RTL isolation is sacred.** The `!important` LTR rules in `index.css` are essential for correct math rendering in an RTL page. Never remove or weaken these.
- **HMR disabled in AI Studio:** `vite.config.ts` checks `DISABLE_HMR` env var — file watching is turned off during agent edits to prevent flickering.
- **`npm run lint:colors`** validates color token usage — flags `slate-*`/`gray-*`/`zinc-*` Tailwind classes, raw hex in TS/TSX (excluding comments and `\textcolor{#hex}`), and `border-*-NNN` patterns. Run it after adding new colored UI.
- **The `@theme` block and `:root` tokens in `index.css` serve different purposes.** `@theme` exposes font families and text scales as Tailwind utilities (e.g., `text-body-base`, `font-sans`). Colors, spacing, and rounded tokens are in `:root` and consumed via `var()` directly — e.g. `bg-[var(--color-primary)]`, not `bg-primary`. Don't conflate the two.
- **`tokens.json` and `tailwind.theme.json` are STALE.** They contain the OLD dark-theme palette (brass primary, `#0d0f14` background). The source of truth is `web/src/index.css` + `DESIGN.md`. Do not reference the JSON files for current color values.
- **No React Router.** Navigation is managed through `activePage` state in `App.tsx` and callbacks passed down.
- **`stagger-in`, `curve-glow`, `pulse-brass`, `pulse-success`, `pulse-error`, `accent-bar`, `toc-target-flash`, `math-chip-drift`** are signature CSS classes defined in `index.css` — reuse these for consistent entrance animations and glow effects.
- **DESIGN.md is the authoritative design spec.** Read it before making any visual or UI decisions. The aesthetic, color palette, typography, and component rules are all defined there.
- **Throwaway files go in `.scratch/`.** Do not pollute the project root or `web/src/` with temp scripts, patches, or debug logs. `.scratch/` is gitignored.
- **Chunk splitting:** `vite.config.ts` defines manual chunks (`charts-vendor`, `math-vendor`, `ui-vendor`, `react-vendor`) for build optimization.
