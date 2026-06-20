# Hypothesis Testing Unified Rebuild — Progress Tracker

Last updated: 2026-06-19 checklist review session

## Task status
- [x] Task 1 — Create `src/components/HypothesisTestDisplay.tsx`
- [x] Task 2 — Add `src/components/HypothesisTestDisplay.test.tsx`
- [ ] Task 3 — Wire `unifiedDecision` into `HypothesisTestingCalculator.tsx`
- [ ] Task 4 — Replace Step 6 final decision body with unified display
- [ ] Task 5 — Align math API + lint hygiene
- [ ] Task 6 — Full verification + manual visual check

## Evidence snapshot
- `HypothesisTestDisplay.tsx` exists.
- `HypothesisTestDisplay.test.tsx` exists.
- `HypothesisTestingCalculator.tsx` still contains `conclusionMethod` state.
- `HypothesisTestingCalculator.tsx` still contains the three old Step 6 method labels.
- `HypothesisTestingCalculator.tsx` contains no matches for `HypothesisTestDisplay`, `unifiedDecision`, or `unifiedDecisionResult`.
- This means the new unified display is present in the repo but not wired into Step 6.

## Checklist log
- [x] `npx vitest run src/lib/statistics/hypothesis.test.ts src/components/HypothesisTestDisplay.test.tsx`
  - Result: 2 files passed, 5 tests passed.
- [x] `npm run lint:tsc`
  - Result: exit 0.
- [x] `npm run lint:colors`
  - Result: OK, 26 files scanned, 0 violations.
- [x] `npm run build`
  - Result: exit 0; Vite production build succeeded.
- [ ] Browser/manual Step 6 validation
  - Browser reached `http://127.0.0.1:3000/`, but the app did not render into `#root` in this browser session, so visual verification is still incomplete.

## Targeted plan check
- `גישת סטטיסטי המבחן` = 3
- `גישת אזור הדחייה` = 3
- `גישת מובהקות התוצאה` = 3
- `conclusionMethod` = 7

## Review conclusion
- Automated gates pass, but the feature acceptance criteria are still not met.
- Primary blocker: Step 6 is still the legacy three-method implementation inside `src/components/HypothesisTestingCalculator.tsx`.
- Next required action: engineer should complete plan Tasks 3 and 4, then rerun full verification and browser/manual validation.
