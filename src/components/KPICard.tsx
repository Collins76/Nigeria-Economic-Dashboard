import { TrendingUp, TrendingDown, Minus, AlertTriangle, Info } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { Indicator, DataPoint, AlertThreshold } from '../data/types';
import { fmtNumber, fmtDeltaPct, deltaPercent, fmtMonthYear } from '../utils/format';
import { getLatest, getPrevious } from '../utils/dataHelpers';

interface KPICardProps {
  indicator: Indicator;
  data: DataPoint[];
  alerts: AlertThreshold[];
  onClick: (id: string) => void;
  active: boolean;
}

export default function KPICard({ indicator, data, alerts, onClick, active }: KPICardProps) {
  const latest = getLatest(data);
  const prev = getPrevious(data, 1);
  const prevYear = getPrevious(data, 12);

  const delta1p = latest && prev ? deltaPercent(latest.value, prev.value) : null;
  const deltaYoY = latest && prevYear ? deltaPercent(latest.value, prevYear.value) : null;
  const displayDelta = deltaYoY ?? delta1p;

  // Alert check
  const alert = alerts.find(a => a.indicatorId === indicator.id);
  const isAlerted = alert && latest && (
    (alert.above !== undefined && latest.value > alert.above) ||
    (alert.below !== undefined && latest.value < alert.below)
  );

  // Trend direction
  const isPositiveTrend = displayDelta !== null && (
    indicator.positiveDirection === 'up' ? displayDelta >= 0 : displayDelta <= 0
  );
  const isNeutral = indicator.positiveDirection === 'neutral' || displayDelta === null;

  // Sparkline (last 20 pts)
  const sparkData = data.slice(-20).map(p => ({ v: p.value }));

  const DeltaIcon = displayDelta !== null
    ? (displayDelta > 0 ? TrendingUp : displayDelta < 0 ? TrendingDown : Minus)
    : Minus;

  const deltaClass = isNeutral ? 'badge-neutral' : isPositiveTrend ? 'badge-positive' : 'badge-negative';

  return (
    <button
      onClick={() => onClick(indicator.id)}
      aria-label={`View ${indicator.name} details`}
      className={[
        'card p-4 text-left w-full transition-all duration-150 group',
        'hover:shadow-md hover:border-brand-400 dark:hover:border-brand-600',
        active ? 'ring-2 ring-brand-500 border-brand-400 dark:border-brand-600' : '',
        isAlerted ? 'border-red-400 dark:border-red-600' : '',
      ].join(' ')}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              {indicator.category}
            </span>
            {isAlerted && (
              <span title={alert?.label} className="text-amber-500 dark:text-amber-400 shrink-0">
                <AlertTriangle size={12} />
              </span>
            )}
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate mt-0.5">
            {indicator.shortName}
          </div>
        </div>
        <div className="shrink-0">
          <span className={deltaClass + ' flex items-center gap-0.5'}>
            <DeltaIcon size={10} />
            {displayDelta !== null ? fmtDeltaPct(displayDelta) : '—'}
          </span>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 text-right mt-0.5">
            {deltaYoY !== null ? 'YoY' : 'PoP'}
          </div>
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
          {latest ? fmtNumber(latest.value) : '—'}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">{indicator.unit}</span>
      </div>

      {/* Sparkline */}
      <div className="h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`sg-${indicator.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={indicator.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={indicator.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={indicator.color}
              strokeWidth={1.5}
              fill={`url(#sg-${indicator.id})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          {latest ? fmtMonthYear(latest.date) : '—'}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
          <Info size={9} />
          {indicator.source}
        </span>
      </div>
    </button>
  );
}
