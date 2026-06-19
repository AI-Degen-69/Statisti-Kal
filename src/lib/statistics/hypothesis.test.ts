import { describe, it, expect } from 'vitest';
import { unifiedDecision } from './hypothesis';

describe('hypothesis.unifiedDecision', () => {
  it('right-tailed known variance: rejects and p-value agrees with critical-value rule', () => {
    const result = unifiedDecision({
      sample: 115,
      nullMean: 100,
      stdDev: 15,
      n: 36,
      alpha: 0.05,
      tail: 'right',
      varianceKnown: true,
    });

    expect(result.reject).toBe(true);
    expect(result.stat).toBeCloseTo(6, 4);
    expect(result.pValue).toBeLessThan(0.05);
    expect(result.critical).toBeCloseTo(1.645, 3);
    expect(result.decisionLabel).toBe('reject');
  });

  it('two-tailed unknown variance: p-value and critical reject agree and p-value > .01', () => {
    const result = unifiedDecision({
      sample: 102,
      nullMean: 100,
      stdDev: 15,
      n: 36,
      alpha: 0.1,
      tail: 'two-tailed',
      varianceKnown: false,
    });

    expect(result.reject).toBe(false);
    expect(result.stat).toBeCloseTo(0.8, 4);
    expect(result.pValue).toBeGreaterThan(0.01);
    expect(result.critical).toBeDefined();
    expect(result.decisionLabel).toBe('fail-to-reject');
  });

  it('left-tailed produces valid summary and decision label', () => {
    const result = unifiedDecision({
      sample: 98,
      nullMean: 100,
      stdDev: 15,
      n: 36,
      alpha: 0.05,
      tail: 'left',
      varianceKnown: true,
    });

    expect(result.decisionLabel).toBe('fail-to-reject');
    expect(result.summary).toContain('שמאלי');
  });
});
