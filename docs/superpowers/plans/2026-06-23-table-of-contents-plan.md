# Table of Contents Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a floating, toggleable Table of Contents sidebar that automatically scans for page headings and highlights the active section based on scroll position.

**Architecture:** A new `TableOfContents` component in `src/components/ui/` that uses `useEffect` to gather DOM headings (`h2`, `h3`) and an `IntersectionObserver` to track the active section. It will be injected into `PageLayout.tsx`.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Lucide (for icons)

---

### Task 1: Create `TableOfContents` Component

**Files:**
- Create: `web/src/components/ui/TableOfContents.tsx`
- Create: `web/src/components/ui/TableOfContents.test.tsx`
- Modify: `web/src/components/ui/index.ts`

- [ ] **Step 1: Write the failing test**

```tsx
// web/src/components/ui/TableOfContents.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TableOfContents } from './TableOfContents';
import { describe, it, expect, vi } from 'vitest';

describe('TableOfContents', () => {
  it('renders a toggle button and opens to show the title', () => {
    render(<TableOfContents />);
    const toggleBtn = screen.getByRole('button', { name: /תוכן עניינים/i });
    expect(toggleBtn).toBeDefined();
    
    // It should open by default on desktop, but let's assume it can be toggled
    // We'll verify the "תוכן עניינים" title is present
    expect(screen.getByText('תוכן עניינים')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run web/src/components/ui/TableOfContents.test.tsx`
Expected: FAIL with module not found or similar.

- [ ] **Step 3: Write minimal implementation**

```tsx
// web/src/components/ui/TableOfContents.tsx
import React, { useEffect, useState } from 'react';
import { List, X } from 'lucide-react';

interface HeadingData {
  id: string;
  text: string;
  level: number;
}

export const TableOfContents: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [headings, setHeadings] = useState<HeadingData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('main h2, main h3'));
    const parsedHeadings: HeadingData[] = elements.map((el, index) => {
      if (!el.id) {
        el.id = `heading-${index}-${el.textContent?.replace(/\\s+/g, '-').toLowerCase()}`;
      }
      return {
        id: el.id,
        text: el.textContent || '',
        level: el.tagName === 'H2' ? 2 : 3,
      };
    });
    setHeadings(parsedHeadings);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        aria-label="פתח תוכן עניינים"
        className="fixed bottom-6 right-6 md:bottom-auto md:top-24 z-50 p-3 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-full shadow-lg text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors"
      >
        <List size={24} />
      </button>
    );
  }

  return (
    <aside className="fixed bottom-0 right-0 md:bottom-auto md:top-24 md:right-6 z-50 w-full md:w-64 max-h-[50vh] md:max-h-[70vh] bg-[var(--color-surface-raised)] border-t md:border border-[var(--color-border)] md:rounded-xl shadow-2xl flex flex-col overflow-hidden" dir="rtl">
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <h2 className="font-bold text-[var(--color-accent-brass)] text-base m-0 flex items-center gap-2">
          <List size={18} />
          תוכן עניינים
        </h2>
        <button
          onClick={() => setIsExpanded(false)}
          aria-label="סגור תוכן עניינים"
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        {headings.length === 0 ? (
          <p className="text-[var(--color-text-secondary)] text-sm text-center py-4">אין סעיפים בעמוד זה</p>
        ) : (
          <ul className="list-none p-0 m-0 space-y-3 text-sm">
            {headings.map((h) => {
              const isActive = activeId === h.id;
              return (
                <li
                  key={h.id}
                  style={{ paddingRight: h.level === 3 ? '16px' : '0' }}
                  className={`border-r-2 transition-colors ${
                    isActive
                      ? 'border-[var(--color-accent-brass)]'
                      : 'border-transparent'
                  }`}
                >
                  <a
                    href={`#${h.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`block pr-2 transition-colors ${
                      isActive
                        ? 'text-[var(--color-accent-brass)] font-bold'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {h.text}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
};
```

```ts
// web/src/components/ui/index.ts
// Add export to the end of file (or create it if it doesn't exist)
export * from './TableOfContents';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run web/src/components/ui/TableOfContents.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/ui/TableOfContents.tsx web/src/components/ui/TableOfContents.test.tsx web/src/components/ui/index.ts
git commit -m "feat: add auto-scanning TableOfContents component"
```

---

### Task 2: Integrate `TableOfContents` into `PageLayout`

**Files:**
- Modify: `web/src/components/ui/PageLayout.tsx`

- [ ] **Step 1: Write the failing test**

We won't write a full integration test for PageLayout since it relies heavily on scroll position hooks which are complex to mock without breaking existing things. Instead, we'll verify it manually or rely on TypeScript compilation.

- [ ] **Step 2: Modify `PageLayout.tsx`**

```tsx
// Edit web/src/components/ui/PageLayout.tsx
// Add import at the top
import { TableOfContents } from './TableOfContents';

// Find the return statement and add <TableOfContents /> just before <ScrollToTopButton />
// Example:
//      </div>
//
//      <TableOfContents />
//      <ScrollToTopButton visible={showScrollTop} />
//    </div>
```

- [ ] **Step 3: Run TypeScript compiler**

Run: `npm run lint:tsc` or `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add web/src/components/ui/PageLayout.tsx
git commit -m "feat: integrate TableOfContents into PageLayout"
```

---
