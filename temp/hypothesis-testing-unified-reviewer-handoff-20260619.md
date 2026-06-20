To: reviewer (Hermes reviewer profile)
From: engineer (Hermes engineer profile)
Subject: Re-review handoff — HypothesisTestingCalculator Step 6 unified decision integration fixes
Date: 2026-06-19

## Review verdict addressed

Previous reviewer verdict: FAIL.

Addressed issues:

1. CRITICAL — single-item + unknown-variance mode was passing persisted `n` into `unifiedDecision`, causing `df = n - 1` instead of calculator semantics `df = 1`.
2. MAJOR — prior integration test was source-grep only and did not render calculator behavior.
3. MAJOR — sample statistic input label was hardcoded as `ממוצע מדגם (X̄)` even when the selected mode was single (`X`) or sum (`ΣX`).

## Completed changes

### `src/components/HypothesisTestingCalculator.tsx`

- Kept Step 6 on shared unified logic/display:
  - `unifiedDecision`
  - `HypothesisTestDisplay`
- Added single-mode decision sizing:
  - `const decisionSampleSize = testType === 'single' ? 1 : n;`
  - `unifiedDecision` now receives `n: decisionSampleSize`.
  - `stdDev` is derived as `stats.se * Math.sqrt(decisionSampleSize)` so the helper recomputes the same SE used by the calculator.
- Result: single-observation unknown-variance mode now preserves the calculator’s `df = 1` semantics inside shared logic.
- Made the sample statistic input label and tooltip mode-aware:
  - single: `ערך בודד (X)`
  - mean: `ממוצע מדגם (X̄)`
  - sum: `סכום מדגם (ΣX)`
- Reused `statSymbol` in Step 6’s `parameterSymbol` prop to avoid divergent mode logic.

### `src/components/HypothesisTestingCalculator.integration.test.tsx`

- Removed obsolete source-grep integration test (`.test.ts`) and replaced it with runtime SSR coverage (`.test.tsx`).
- New runtime tests render the actual calculator with localStorage-backed state and assert:
  1. The reproduced boundary case `single + unknown variance + right-tailed + sample=125.4 + n persisted as 36` renders `data-decision="fail-to-reject"`, not reject.
  2. All three modes render the correct sample statistic label: single / mean / sum.
- Recharts chart components are mocked in the runtime test so the test exercises calculator/rendered decision behavior without chart container sizing noise.
- Known existing React SSR warning for legacy `<linearGradient />` casing is filtered in this test only; unexpected console errors still fail the test.

## Grounding paths

- Main implementation: `src/components/HypothesisTestingCalculator.tsx`
- Runtime integration regression: `src/components/HypothesisTestingCalculator.integration.test.tsx`
- Shared display: `src/components/HypothesisTestDisplay.tsx`
- Shared decision logic: `src/lib/statistics/hypothesis.ts`

## Self-check evidence

```text
HypothesisTestDisplay=3
unifiedDecision=6
unifiedDecisionResult=4
decisionSampleSize=3
conclusionMethod=0
source-grep-test=0
```

## Verification

All commands run from `C:/Users/Tiger/Agents/Projects/statistics`.

```bash
npx vitest run src/components/HypothesisTestingCalculator.integration.test.tsx
```

Result: PASS — `1 passed` file, `2 passed` tests. auto-verified ✓

```bash
npx vitest run src/lib/statistics/hypothesis.test.ts src/components/HypothesisTestDisplay.test.tsx src/components/HypothesisTestingCalculator.integration.test.tsx
```

Result: PASS — `3 passed` files, `7 passed` tests. auto-verified ✓

```bash
npm run lint:tsc
```

Result: PASS. auto-verified ✓

```bash
npm run lint:colors
```

Result: PASS — `27 files scanned, 0 violations`. auto-verified ✓

```bash
npm run build
```

Result: PASS — Vite production build succeeded. Existing chunk-size warning remains. auto-verified ✓

## Git / workspace state

No commit created.

Relevant files for this review pass:

- Modified: `src/components/HypothesisTestingCalculator.tsx`
- Added: `src/components/HypothesisTestingCalculator.integration.test.tsx`
- Removed locally: obsolete `src/components/HypothesisTestingCalculator.integration.test.ts` source-grep test
- Updated: `temp/hypothesis-testing-unified-reviewer-handoff-20260619.md`

Working tree still includes unrelated broader-branch changes/untracked files from the surrounding feature work; do not attribute those all to this pass.

## Reviewer ask

Please re-review specifically:

1. Runtime boundary test coverage for the reproduced single/unknown variance decision flip.
2. Whether `decisionSampleSize = 1` is the correct adapter for preserving calculator semantics while using `unifiedDecision` unchanged.
3. Mode-aware sample statistic label/tooltip wording in Hebrew for single / mean / sum.
4. Whether sum-mode unified decision remains semantically correct under the existing adapter (`stdDev = stats.se * sqrt(n)`) or should be made explicit in a future extraction.

## Recommended next step

Reviewer should rerun the targeted runtime test and inspect `unifiedDecisionResult` around the `decisionSampleSize` adapter plus the mode-aware input label block.
