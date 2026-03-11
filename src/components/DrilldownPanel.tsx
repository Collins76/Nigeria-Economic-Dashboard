import { X, Download, ExternalLink } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { DataPoint, AlertThreshold } from '../data/types';
import { INDICATOR_MAP } from '../data/indicators';
import { filterByDateRange, getLatest, getPrevious, downloadCSV } from '../utils/dataHelpers';
import { fmtNumber, fmtMonthYear, fmtDeltaPct, deltaPercent } from '../utils/format';
import { NARRATIVES } from '../data/narratives';
import { ECONOMIC_EVENTS } from '../data/events';

interface DrilldownPanelProps {
  indicatorId: string;
  seriesMap: Record<string, DataPoint[]>;
  dateFrom: string;
  dateTo: string;
  alerts: AlertThreshold[];
  onClose: () => void;
}

export default function DrilldownPanel({
  indicatorId, seriesMap, dateFrom, dateTo, alerts, onClose,
}: DrilldownPanelProps) {
  const ind = INDICATOR_MAP[indicatorId];
  if (!ind) return null;

  const allData = seriesMap[indicatorId] ?? [];
  const filtered = filterByDateRange(allData, dateFrom, dateTo);
  const latest = getLatest(filtered);
  const prev = getPrevious(filtered, 1);
  const prevYear = getPrevious(filtered, Math.min(12, filtered.length - 1));

  const delta1p = latest && prev ? deltaPercent(latest.value, prev.value) : null;
  const deltaYoY = latest && prevYear ? deltaPercent(latest.value, prevYear.value) : null;

  const alert = alerts.find(a => a.indicatorId === indicatorId);
  const isAlerted = alert && latest && (
    (alert.above !== undefined && latest.value > alert.above) ||
    (alert.below !== undefined && latest.value < alert.below)
  );

  const narrative = NARRATIVES[indicatorId];

  // Relevant events
  const relEvents = ECONOMIC_EVENTS
    .filter(e => e.date >= dateFrom && e.date <= dateTo && e.tags.some(t =>
      indicatorId.includes(t) ||
      (indicatorId.includes('fx') && t === 'fx') ||
      (indicatorId.includes('inflation') && t === 'inflation') ||
      (indicatorId.includes('gdp') && t === 'gdp') ||
      (indicatorId.includes('oil') && t === 'oil') ||
      (indicatorId.includes('mpr') && t === 'monetary-policy') ||
      (indicatorId.includes('govt') && t === 'fiscal')
    ))
    .slice(0, 6);

  // Stats
  const vals = filtered.map(p => p.value);
  const min = vals.length ? Math.min(...vals) : 0;
  const max = vals.length ? Math.max(...vals) : 0;
  const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;

  const handleDownload = () => {
    downloadCSV(
      ['Date', ind.name, `Unit: ${ind.unit}`, `Source: ${ind.source}`],
      filtered.map(p => [p.date, p.value, ind.unit, ind.source]),
      `${indicatorId}_${dateFrom}_${dateTo}.csv`,
    );
  };

  const chartData = filtered.map(p => ({ date: fmtMonthYear(p.date), value: p.value, rawDate: p.date }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Drilldown: ${ind.name}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl">
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-3xl"
          style={{ borderTop: `4px solid ${ind.color}` }}
        >
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">{ind.category}</div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{ind.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ind.description}</p>
          </div>
          <div className="flex items-center gap-2 ml-3 shrink-0">
            <button onClick={handleDownload} className="btn-outline text-xs gap-1">
              <Download size={12} />
              CSV
            </button>
            <a
              href={ind.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-xs gap-1"
              aria-label={`Open ${ind.source} in new tab`}
            >
              <ExternalLink size={12} />
              Source
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              aria-label="Close panel"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* KPI stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Latest',
                value: latest ? fmtNumber(latest.value) : '—',
                sub: latest ? fmtMonthYear(latest.date) : '',
                accent: isAlerted ? 'text-red-600' : 'text-slate-900 dark:text-white',
              },
              {
                label: 'Period Change',
                value: delta1p !== null ? fmtDeltaPct(delta1p) : '—',
                sub: 'vs prev period',
                accent: delta1p !== null
                  ? (ind.positiveDirection === 'up' ? (delta1p >= 0 ? 'text-emerald-600' : 'text-red-500') :
                     ind.positiveDirection === 'down' ? (delta1p <= 0 ? 'text-emerald-600' : 'text-red-500') : 'text-slate-700')
                  : 'text-slate-700',
              },
              {
                label: 'YoY Change',
                value: deltaYoY !== null ? fmtDeltaPct(deltaYoY) : '—',
                sub: 'year-on-year',
                accent: deltaYoY !== null
                  ? (ind.positiveDirection === 'up' ? (deltaYoY >= 0 ? 'text-emerald-600' : 'text-red-500') :
                     ind.positiveDirection === 'down' ? (deltaYoY <= 0 ? 'text-emerald-600' : 'text-red-500') : 'text-slate-700')
                  : 'text-slate-700',
              },
              {
                label: 'Avg (period)',
                value: fmtNumber(avg),
                sub: ind.unit,
                accent: 'text-slate-700 dark:text-slate-300',
              },
            ].map((s, i) => (
              <div key={i} className="card p-3">
                <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-1">{s.label}</div>
                <div className={`text-xl font-bold font-mono tabular-nums ${s.accent}`}>{s.value}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Min / Max */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-2">
            <span>Range:</span>
            <span className="font-mono font-semibold text-red-500">{fmtNumber(min)} (min)</span>
            <span>→</span>
            <span className="font-mono font-semibold text-emerald-500">{fmtNumber(max)} (max)</span>
            <span className="ml-auto">{ind.unit} | {ind.frequency} | {ind.updateCadence}</span>
          </div>

          {/* Alert badge */}
          {isAlerted && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5 text-sm text-red-700 dark:text-red-400">
              <span className="font-semibold">Alert:</span>
              <span>{alert?.label} — current value ({fmtNumber(latest?.value ?? 0)}) exceeds threshold</span>
            </div>
          )}

          {/* Chart */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-3">
              Time Series ({dateFrom.slice(0, 4)} – {dateTo.slice(0, 4)})
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="dd-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ind.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={ind.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700/50" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={50} tickFormatter={v => fmtNumber(v, 1)} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow p-2.5 text-xs">
                        <div className="text-slate-500 mb-1">{label}</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {fmtNumber(payload[0].value as number)} {ind.unit}
                        </div>
                      </div>
                    );
                  }}
                />
                {/* Alert line */}
                {alert?.above !== undefined && (
                  <ReferenceLine y={alert.above} stroke="#ef4444" strokeDasharray="4 3"
                    label={{ value: `Alert: ${alert.above}`, position: 'insideTopRight', fontSize: 9, fill: '#ef4444' }} />
                )}
                {alert?.below !== undefined && (
                  <ReferenceLine y={alert.below} stroke="#f59e0b" strokeDasharray="4 3"
                    label={{ value: `Alert: ${alert.below}`, position: 'insideBottomRight', fontSize: 9, fill: '#f59e0b' }} />
                )}
                {/* Event lines */}
                {relEvents.map(evt => (
                  <ReferenceLine
                    key={evt.id}
                    x={fmtMonthYear(evt.date)}
                    stroke={evt.severity === 'critical' ? '#ef4444' : '#f59e0b'}
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                ))}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={ind.color}
                  strokeWidth={2}
                  fill="url(#dd-area)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Events in period */}
          {relEvents.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
                Key Events
              </h3>
              <div className="space-y-2">
                {relEvents.map(evt => (
                  <div
                    key={evt.id}
                    className={[
                      'flex gap-3 rounded-xl px-3 py-2.5 text-xs',
                      evt.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30' :
                      evt.severity === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30' :
                      'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700',
                    ].join(' ')}
                  >
                    <span className="font-mono text-slate-500 shrink-0 tabular-nums">{evt.date.slice(0, 7)}</span>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{evt.title}</div>
                      <div className="text-slate-500 dark:text-slate-400 mt-0.5">{evt.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Narrative */}
          {narrative && (
            <div className="bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/30 rounded-xl p-4">
              <div className="text-[10px] font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1.5">
                Analyst Summary
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{narrative}</p>
            </div>
          )}

          {/* Raw data mini-table */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
              Recent Data Points
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-3 py-2 text-left font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500 uppercase tracking-wide">Value</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500 uppercase tracking-wide">PoP Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.slice(-15).reverse().map((pt, i, arr) => {
                    const prevPt = arr[i + 1];
                    const delta = prevPt ? deltaPercent(pt.value, prevPt.value) : null;
                    return (
                      <tr key={pt.date} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-3 py-1.5 font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                          {fmtMonthYear(pt.date)}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                          {fmtNumber(pt.value)}
                        </td>
                        <td className={[
                          'px-3 py-1.5 text-right font-mono tabular-nums',
                          delta === null ? 'text-slate-400' :
                          delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
                        ].join(' ')}>
                          {delta !== null ? `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}%` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-400">
            {[
              ['Source', ind.source],
              ['Frequency', ind.frequency],
              ['Unit', ind.unit],
              ['Update Cadence', ind.updateCadence],
              ['Last Updated', ind.lastUpdated],
              ['Positive Direction', ind.positiveDirection === 'up' ? 'Higher is better' :
                ind.positiveDirection === 'down' ? 'Lower is better' : 'Neutral'],
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">{k}</div>
                <div className="text-slate-700 dark:text-slate-300 font-medium">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
