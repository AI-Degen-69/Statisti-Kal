So tell me what is now configured in your memory. What's written there? # CONTEXT.md

This file documents the current state of the application's component architecture.

## Global Templating Architecture
The application has recently undergone a major architectural UI revamp to enforce the **Modern Minimal** design system.

### Template Hierarchy
All user-facing calculators are built using these templates:

1. **Layout Primitives (`web/src/components/ui/`)**
   - `PageLayout`: The outermost page container.
   - `CalculatorPanel`: The main container for a calculator.
   - `CalculatorSectionHeader`: The header for distinct calculator sections.
   - `ParameterGrid`: The unified responsive grid for numeric inputs.
   - `ChartWrapper`: The standardized container for Recharts visualizers.

2. **Domain Calculators (`web/src/components/`)**
   - `HypothesisTestingCalculator.tsx`
   - `NormalDistributionCalculator.tsx`
   These components handle math and state, passing their results down to the layout primitives. They **do not** define their own raw HTML structures.

### Design System Integration
The project uses Tailwind v4 with a custom `@theme` mapped to the Modern Minimal palette defined in `web/src/index.css` (e.g., `--color-primary`, `--chart-1`). All template components use these CSS custom properties.
