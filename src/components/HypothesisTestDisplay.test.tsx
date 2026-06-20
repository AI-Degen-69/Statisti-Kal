import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import HypothesisTestDisplay from './HypothesisTestDisplay';
import type { UnifiedResult } from '../lib/statistics/hypothesis';

function renderDisplay(result: UnifiedResult) {
  return renderToStaticMarkup(
    <HypothesisTestDisplay
      result={result}
      alpha={0.05}
      sample={115}
      nullMean={100}
      tail="right"
      varianceKnown={true}
      statisticSymbol="Z"
      parameterSymbol="μ"
    />,
  );
}

describe('HypothesisTestDisplay', () => {
  it('renders one unified reject decision with critical-value and p-value sections', () => {
    const html = renderDisplay({
      reject: true,
      stat: 6,
      critical: 1.6449,
      pValue: 0.00001,
      decisionLabel: 'reject',
      ruleLabel: 'הוחלט לדחות את השערת האפס (H0)',
      summary: 'reject',
    });

    expect(html).toContain('החלטה מאוחדת');
    expect(html).toContain('דוחים את השערת האפס');
    expect(html).toContain('כלל הערך הקריטי');
    expect(html).toContain('כלל P-value');
    expect(html).toContain('שתי הגישות מובילות לאותה החלטה');
  });

  it('renders statistic symbols and decision rules through KaTeX instead of visible raw LaTeX text', () => {
    const html = renderToStaticMarkup(
      <HypothesisTestDisplay
        result={{
          reject: false,
          stat: 0.3912,
          critical: 2.3268,
          pValue: 0.3478,
          decisionLabel: 'fail-to-reject',
          ruleLabel: 'לא הוכחו ראיות מספיקות לדחיית H0',
          summary: 'fail',
        }}
        alpha={0.01}
        sample={41}
        nullMean={40}
        tail="right"
        varianceKnown={true}
        statisticSymbol="Z"
        parameterSymbol={'\\bar{X}'}
      />,
    );

    expect(html).toContain('class="katex"');
    expect(html).toContain('annotation encoding="application/x-tex">\\bar{X} = 40');
    expect(html).toContain('annotation encoding="application/x-tex">Z = 0.3912');
    expect(html).toContain('annotation encoding="application/x-tex">Z \\ge 2.3268');
    expect(html).toContain('annotation encoding="application/x-tex">\\text{P-value} = 0.3478');
    expect(html).not.toContain('class="font-mono text-[var(--color-text-primary)]"');
  });

  it('renders a fail-to-reject decision', () => {
    const html = renderDisplay({
      reject: false,
      stat: 0.8,
      critical: [-1.96, 1.96],
      pValue: 0.4237,
      decisionLabel: 'fail-to-reject',
      ruleLabel: 'לא הוכחו ראיות מספיקות לדחיית H0',
      summary: 'fail',
    });

    expect(html).toContain('אין לדחות את השערת האפס');
    expect(html).toContain('annotation encoding="application/x-tex">\\text{P-value} \\ge \\alpha');
  });
});
