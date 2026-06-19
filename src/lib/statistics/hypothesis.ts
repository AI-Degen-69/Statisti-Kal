import {
  normalCDF,
  normalPDF,
  studentTCDF,
  studentTPDF,
  studentTPPF,
  inverseNormalCDF,
} from './math';

export type Tail = 'left' | 'right' | 'two-tailed';
export type Variance = 'known' | 'unknown';

export interface UnifiedInput {
  sample: number;
  nullMean: number;
  stdDev: number;
  n: number;
  alpha: number;
  tail: Tail;
  varianceKnown: boolean;
  alternativeMean?: number;
}

export interface UnifiedResult {
  reject: boolean;
  stat: number;
  critical: [number, number] | number;
  pValue: number;
  decisionLabel: 'reject' | 'fail-to-reject';
  ruleLabel: string;
  summary: string;
}

export function unifiedDecision(input: UnifiedInput): UnifiedResult {
  const {
    sample,
    nullMean,
    stdDev,
    n,
    alpha,
    tail,
    varianceKnown,
    alternativeMean,
  } = input;

  const se = varianceKnown ? stdDev / Math.sqrt(n) : stdDev / Math.sqrt(n);
  const stat = (sample - nullMean) / se;
  const df = n <= 1 ? 1 : n - 1;

  let critical: [number, number] | number;
  let pValue: number;

  if (varianceKnown) {
    if (tail === 'right') {
      critical = inverseNormalCDF(1 - alpha);
      pValue = 1 - normalCDF(stat, 0, 1);
    } else if (tail === 'left') {
      critical = inverseNormalCDF(alpha);
      pValue = normalCDF(stat, 0, 1);
    } else {
      const z = inverseNormalCDF(1 - alpha / 2);
      critical = [-z, z];
      pValue = 2 * Math.min(normalCDF(stat, 0, 1), 1 - normalCDF(stat, 0, 1));
    }
  } else {
    if (tail === 'right') {
      critical = studentTPPF(1 - alpha, df);
      pValue = 1 - studentTCDF(stat, df);
    } else if (tail === 'left') {
      critical = studentTPPF(alpha, df);
      pValue = studentTCDF(stat, df);
    } else {
      const t = studentTPPF(1 - alpha / 2, df);
      critical = [-t, t];
      pValue = 2 * Math.min(studentTCDF(stat, df), 1 - studentTCDF(stat, df));
    }
  }

  let reject = false;
  if (tail === 'right') reject = stat >= (critical as number);
  else if (tail === 'left') reject = stat <= (critical as number);
  else reject = stat <= (critical as [number, number])[0] || stat >= (critical as [number, number])[1];

  const decisionLabel = reject ? 'reject' : 'fail-to-reject';
  const option = reject
    ? 'הוחלט לדחות את השערת האפס (H0)'
    : 'לא הוכחו ראיות מספיקות לדחיית H0';
  const tailWord =
    tail === 'right' ? 'ימני' : tail === 'left' ? 'שמאלי' : 'דו-צדדי';

  const evidence =
    alternativeMean !== undefined
      ? `. בדוגמה זו, X̄ = ${sample.toFixed(3)} נבדל ${stat.toFixed(3)} יחידות MAE מ-H0.`
      : '';

  const summary = `${option} במבחן ${tailWord}.reveal:${stat.toFixed(3)}`;
  return { reject, stat, critical, pValue, decisionLabel, ruleLabel: option, summary };
}
