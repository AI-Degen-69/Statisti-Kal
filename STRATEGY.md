# STRATEGY.md

This document defines the architectural strategy of Statisti-Kal.

> [!IMPORTANT]
> **Core Principle**: All calculators must be built using the **Global Templating Architecture** defined in `DESIGN.md`. No domain-specific calculator should define its own raw HTML layout grids, chart wrappers, or CSS colors.

## Product Goals
Statisti-Kal is an academic-grade statistics instrument with a **Modern Minimal** aesthetic. It focuses on clarity, accessibility, and visual presentation of statistical concepts.

## Implementation Strategy
1. **Component Reusability**: If a UI pattern (like a parameter input, a formula block, or a chart) appears in more than one calculator, it must be extracted into a generic template inside `web/src/components/ui`.
2. **Visual Consistency**: By forcing all calculators to use shared templates (e.g., `ChartWrapper`, `ChartPrimitives`, `ParameterGrid`), we mathematically guarantee that backgrounds, fonts, mean lines, and spacing remain identical across the entire application.
3. **Domain Isolation**: Calculators like `HypothesisTestingCalculator.tsx` should only be responsible for *math* and *state*. They delegate all rendering to the UI templates.
