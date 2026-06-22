# Design: Floating Table of Contents (Ruler)

## Overview
A floating sidebar component that automatically scans the page for headings, creating a sticky table of contents on the right side of the screen. It allows users to quickly navigate between sections of long calculators or pages.

## Architecture
- **Component**: `TableOfContents` in `web/src/components/ui/TableOfContents.tsx`
- **Integration**: Added to `web/src/components/ui/PageLayout.tsx` so it's consistently available across the app.
- **Data Gathering**: 
  - Mounts and queries the DOM for `h2` and `h3` elements inside the main content area.
  - Automatically generates an `id` attribute for any heading that lacks one (using a slugified version of its text or a random string).
  - Builds an array of `{ id: string, text: string, level: number }`.

## State Management
- `isExpanded` (boolean): Controls whether the full list is visible or if it's collapsed into a floating button. Defaults to `true` on wide screens and `false` on smaller screens.
- `activeId` (string | null): The `id` of the currently visible section, updated dynamically via an `IntersectionObserver`.

## UI & Styling
- **Positioning**: Fixed or sticky to the right side of the viewport (`right-4`).
- **Collapsed State**: A small floating action button (FAB) with a list icon (`☰`).
- **Expanded State**: A side panel (`w-64`) with a header (Title + Close button) and a list of internal anchor links.
- **Tokens (from DESIGN.md)**:
  - Background: `surface-raised`
  - Text: `text-primary` for general text, `text-secondary` for inactive links.
  - Active Highlight: `accent-brass` text and a prominent `accent-brass` border indicator on the right side of the active item (respecting RTL).

## Accessibility & RTL
- Ensures full RTL support.
- Uses the `<aside>` and `<nav>` semantic elements.
- Accessible keyboard navigation for the anchor links.

## Verification
- Component renders correctly on both `HypothesisTestingCalculator` and `NormalDistributionCalculator` pages.
- Correctly highlights sections as the user scrolls.
- Collapsing works smoothly and keeps the screen clean.
