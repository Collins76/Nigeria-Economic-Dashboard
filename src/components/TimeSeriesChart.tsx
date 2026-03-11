import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Brush,
} from 'recharts';
import type { DataPoint, EconomicEvent, Indicator } from '../data/types';
import { filterByDateRange, movingAverage } from '../utils/dataHelpers';
import { fmtMonthYear, fmtNumber } from '../utils/format';

interface TimeSeriesChartProps {
  indicators: Indicator[];
  seriesMap: Record<string, DataPoint[]>;
  dateFrom: string;
  dateTo: string;
  events: EconomicEvent[];
  showEvents: boolean;
  showMA: boolean;
  compareMode?: boolean;
  onIndicatorClick?: (id: string) => void;
}

const COLORS = [
  '#22c55e', '#ef4444', '#3b82f6', '#8b5cf6',
  '#f59e0b', '#06b6d4', '#ec4899', '#14b8a6',
];

// Custom tooltip
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string; unit?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 min-w-[160px]">
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-xs mb-1">
          <span className="flex items-center gap-1.5">
            <span style={{ background: entry.color }} className="w-2 h-2 rounded-full inline-block shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{entry.name}</span>
          </span>
          <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
            {fmtNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TimeSeriesChart({
  indicators, seriesMap, dateFrom, dateTo,
  events, showEvents, showMA,
  onIndicatorClick,
}: TimeSeriesChartProps) {

  if (!indicators.length) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
        Select at least one indicator above
      </div>
    );
  }

  // Build merged data keyed by date
  const dateSet = new Set<string>();
  const filteredMap: Record<string, DataPoint[]> = {};

  for (const ind of indicators) {
    const raw = seriesMap[ind.id] ?? [];
    const filtered = filterByDateRange(raw, dateFrom, dateTo);
    filteredMap[ind.id] = showMA ? movingAverage(filtered, 3) : filtered;
    filtered.forEach(p => dateSet.add(p.date));
  }

  const sortedDates = [...dateSet].sort();
  const merged = sortedDates.map(date => {
    const row: Record<string, string | number | null> = { date: fmtMonthYear(date) };
    for (const ind of indicators) {
      const pt = filteredMap[ind.id]?.find(p => p.date === date);
      row[ind.id] = pt ? pt.value : null;
    }
    return row;
  });

  // Visible events in range
  const visibleEvents = showEvents
    ? events.filter(e => e.date >= dateFrom && e.date <= dateTo).slice(0, 8)
    : [];

  // For single-indicator, use area; for multi, use lines
  const useSingleArea = indicators.length === 1;

  const colorFor = (ind: Indicator, i: number) =>
    ind.color || COLORS[i % COLORS.length];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={merged} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
        <defs>
          {indicators.map((ind, i) => (
            <linearGradient key={ind.id} id={`area-${ind.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorFor(ind, i)} stopOpacity={0.25} />
              <stop offset="95%" stopColor={colorFor(ind, i)} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700/50" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'currentColor' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          className="text-slate-500 dark:text-slate-400"
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'currentColor' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmtNumber(v, 1)}
          className="text-slate-500 dark:text-slate-400"
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        {indicators.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value) => {
              const ind = indicators.find(i => i.id === value);
              return ind?.shortName || value;
            }}
          />
        )}

        {/* Event annotations */}
        {visibleEvents.map(evt => (
          <ReferenceLine
            key={evt.id}
            x={fmtMonthYear(evt.date)}
            stroke={evt.severity === 'critical' ? '#ef4444' : evt.severity === 'warning' ? '#f59e0b' : '#6b7280'}
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{
              value: evt.title.length > 20 ? evt.title.slice(0, 18) + '…' : evt.title,
              position: 'insideTopRight',
              fontSize: 9,
              fill: evt.severity === 'critical' ? '#ef4444' : evt.severity === 'warning' ? '#f59e0b' : '#9ca3af',
              angle: -90,
              offset: 5,
            }}
          />
        ))}

        {useSingleArea ? (
          <Area
            key={indicators[0].id}
            type="monotone"
            dataKey={indicators[0].id}
            name={indicators[0].id}
            stroke={colorFor(indicators[0], 0)}
            strokeWidth={2}
            fill={`url(#area-${indicators[0].id})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            connectNulls
            onClick={() => onIndicatorClick?.(indicators[0].id)}
          />
        ) : (
          indicators.map((ind, i) => (
            <Line
              key={ind.id}
              type="monotone"
              dataKey={ind.id}
              name={ind.id}
              stroke={colorFor(ind, i)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls
              onClick={() => onIndicatorClick?.(ind.id)}
            />
          ))
        )}

        <Brush
          dataKey="date"
          height={20}
          stroke="#6b7280"
          fill="transparent"
          travellerWidth={6}
          className="text-slate-400"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
