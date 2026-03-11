export function fmtNumber(value: number, decimals = 2): string {
  if (!isFinite(value)) return '—';
  return value.toLocaleString('en-NG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtCompact(value: number): string {
  if (!isFinite(value)) return '—';
  if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (Math.abs(value) >= 1_000) return (value / 1_000).toFixed(1) + 'K';
  return fmtNumber(value);
}

export function fmtDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

export function fmtMonthYear(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NG', { year: 'numeric', month: 'short' });
  } catch { return dateStr; }
}

export function fmtYear(dateStr: string): string {
  return dateStr.slice(0, 4);
}

export function deltaPercent(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function deltaAbs(current: number, previous: number): number {
  return current - previous;
}

export function fmtDelta(delta: number, decimals = 2): string {
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${fmtNumber(delta, decimals)}`;
}

export function fmtDeltaPct(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}
