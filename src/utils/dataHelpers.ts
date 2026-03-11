import type { DataPoint } from '../data/types';

export function filterByDateRange(data: DataPoint[], from: string, to: string): DataPoint[] {
  return data.filter(p => p.date >= from && p.date <= to);
}

export function resampleMonthly(data: DataPoint[]): DataPoint[] {
  const groups: Record<string, number[]> = {};
  for (const p of data) {
    const key = p.date.slice(0, 7); // YYYY-MM
    if (!groups[key]) groups[key] = [];
    groups[key].push(p.value);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, vals]) => ({
      date: key + '-01',
      value: vals.reduce((s, v) => s + v, 0) / vals.length,
    }));
}

export function movingAverage(data: DataPoint[], window: number): DataPoint[] {
  return data.map((p, i) => {
    const slice = data.slice(Math.max(0, i - window + 1), i + 1);
    const avg = slice.reduce((s, d) => s + d.value, 0) / slice.length;
    return { ...p, value: Math.round(avg * 100) / 100 };
  });
}

export function correlationCoefficient(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const meanA = a.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const meanB = b.slice(0, n).reduce((s, v) => s + v, 0) / n;
  let num = 0, varA = 0, varB = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - meanA) * (b[i] - meanB);
    varA += (a[i] - meanA) ** 2;
    varB += (b[i] - meanB) ** 2;
  }
  const denom = Math.sqrt(varA * varB);
  return denom === 0 ? 0 : num / denom;
}

export function linearRegression(xs: number[], ys: number[]): { slope: number; intercept: number; r2: number } {
  const n = Math.min(xs.length, ys.length);
  const mx = xs.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const my = ys.slice(0, n).reduce((s, v) => s + v, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = my - slope * mx;
  const r = correlationCoefficient(xs.slice(0, n), ys.slice(0, n));
  return { slope, intercept, r2: r * r };
}

export function getLatest(data: DataPoint[]): DataPoint | null {
  if (!data.length) return null;
  return data[data.length - 1];
}

export function getPrevious(data: DataPoint[], n = 1): DataPoint | null {
  if (data.length < n + 1) return null;
  return data[data.length - 1 - n];
}

export function downloadCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const lines = [
    headers.join(','),
    ...rows.map(r => r.map(v => `"${v}"`).join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
