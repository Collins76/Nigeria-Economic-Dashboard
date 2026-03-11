import {
  Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Line, ComposedChart,
} from 'recharts';
import { INDICATOR_MAP } from '../data/indicators';
import type { DataPoint } from '../data/types';
import { correlationCoefficient, filterByDateRange, linearRegression } from '../utils/dataHelpers';
import { fmtNumber } from '../utils/format';

interface CorrelationMatrixProps {
  indicatorIds: string[];
  seriesMap: Record<string, DataPoint[]>;
  dateFrom: string;
  dateTo: string;
}

function correlColor(r: number): string {
  const abs = Math.abs(r);
  if (abs > 0.8) return r > 0 ? '#15803d' : '#dc2626';
  if (abs > 0.5) return r > 0 ? '#4ade80' : '#f87171';
  if (abs > 0.2) return r > 0 ? '#bbf7d0' : '#fecaca';
  return '#e2e8f0';
}

interface ScatterPanelProps {
  idA: string;
  idB: string;
  seriesMap: Record<string, DataPoint[]>;
  dateFrom: string;
  dateTo: string;
}

function ScatterPanel({ idA, idB, seriesMap, dateFrom, dateTo }: ScatterPanelProps) {
  const indA = INDICATOR_MAP[idA];
  const indB = INDICATOR_MAP[idB];
  if (!indA || !indB) return null;

  const rawA = filterByDateRange(seriesMap[idA] ?? [], dateFrom, dateTo);
  const rawB = filterByDateRange(seriesMap[idB] ?? [], dateFrom, dateTo);

  // Align on dates
  const pairs: { x: number; y: number }[] = [];
  for (const pa of rawA) {
    const pb = rawB.find(p => p.date.slice(0, 7) === pa.date.slice(0, 7));
    if (pb) pairs.push({ x: pa.value, y: pb.value });
  }

  if (pairs.length < 5) return (
    <div className="text-xs text-slate-400 p-3 text-center">Insufficient data</div>
  );

  const xs = pairs.map(p => p.x);
  const ys = pairs.map(p => p.y);
  const { slope, intercept, r2 } = linearRegression(xs, ys);
  const r = correlationCoefficient(xs, ys);

  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const regressionLine = [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept },
  ];

  return (
    <div className="p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {indA.shortName} vs {indB.shortName}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            {indA.unit} / {indB.unit}
          </div>
        </div>
        <div className="text-right">
          <div className={[
            'text-xs font-bold',
            Math.abs(r) > 0.7 ? 'text-emerald-600 dark:text-emerald-400' :
            Math.abs(r) > 0.4 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500',
          ].join(' ')}>
            r = {r.toFixed(3)}
          </div>
          <div className="text-[10px] text-slate-400">R² = {r2.toFixed(3)}</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700/50" />
          <XAxis
            type="number"
            dataKey="x"
            name={indA.shortName}
            tick={{ fontSize: 10 }}
            tickLine={false}
            tickFormatter={v => fmtNumber(v, 1)}
            label={{ value: indA.shortName, position: 'insideBottom', fontSize: 10, offset: -2 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={indB.shortName}
            tick={{ fontSize: 10 }}
            tickLine={false}
            tickFormatter={v => fmtNumber(v, 1)}
            width={45}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as { x: number; y: number };
              return (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow p-2 text-xs">
                  <div>{indA.shortName}: <b>{fmtNumber(d.x)}</b></div>
                  <div>{indB.shortName}: <b>{fmtNumber(d.y)}</b></div>
                </div>
              );
            }}
          />
          <Scatter data={pairs} fill={indA.color} opacity={0.7} />
          <Line
            data={regressionLine}
            type="linear"
            dataKey="y"
            stroke="#ef4444"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 3"
            legendType="none"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="text-[10px] text-slate-400 mt-1 text-center">
        y = {slope.toFixed(3)}x + {fmtNumber(intercept, 2)} | n={pairs.length} obs
      </div>
    </div>
  );
}

export default function CorrelationMatrix({ indicatorIds, seriesMap, dateFrom, dateTo }: CorrelationMatrixProps) {
  const ids = indicatorIds.slice(0, 6); // max 6 for matrix

  if (ids.length < 2) {
    return (
      <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">
        Select at least 2 indicators in the Indicator Selector to view the correlation matrix.
      </div>
    );
  }

  // Build correlation grid
  const matrix: { idA: string; idB: string; r: number }[] = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = 0; j < ids.length; j++) {
      const rawA = filterByDateRange(seriesMap[ids[i]] ?? [], dateFrom, dateTo);
      const rawB = filterByDateRange(seriesMap[ids[j]] ?? [], dateFrom, dateTo);
      const aligned: { a: number; b: number }[] = [];
      for (const pa of rawA) {
        const pb = rawB.find(p => p.date.slice(0, 7) === pa.date.slice(0, 7));
        if (pb) aligned.push({ a: pa.value, b: pb.value });
      }
      matrix.push({
        idA: ids[i],
        idB: ids[j],
        r: aligned.length >= 5
          ? correlationCoefficient(aligned.map(x => x.a), aligned.map(x => x.b))
          : 0,
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Heatmap grid */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Correlation Heatmap
        </h3>
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse">
            <thead>
              <tr>
                <th className="w-24 p-1" />
                {ids.map(id => (
                  <th key={id} className="p-1 text-center font-medium text-slate-600 dark:text-slate-400 w-20">
                    {INDICATOR_MAP[id]?.shortName || id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ids.map(rowId => (
                <tr key={rowId}>
                  <td className="p-1 font-medium text-slate-600 dark:text-slate-400 text-right pr-2">
                    {INDICATOR_MAP[rowId]?.shortName || rowId}
                  </td>
                  {ids.map(colId => {
                    const cell = matrix.find(m => m.idA === rowId && m.idB === colId);
                    const r = cell?.r ?? 0;
                    const isDiag = rowId === colId;
                    return (
                      <td
                        key={colId}
                        className="p-1 text-center w-20 h-9 rounded font-mono text-xs font-semibold"
                        style={{
                          backgroundColor: isDiag ? '#1e293b' : correlColor(r),
                          color: isDiag ? '#94a3b8' : Math.abs(r) > 0.5 ? '#fff' : '#1e293b',
                        }}
                      >
                        {isDiag ? '—' : r.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
          <span>Strong negative</span>
          <div className="flex gap-0.5">
            {[-1, -0.7, -0.4, 0, 0.4, 0.7, 1].map(v => (
              <div key={v} style={{ backgroundColor: correlColor(v) }} className="w-4 h-3 rounded-sm" />
            ))}
          </div>
          <span>Strong positive</span>
        </div>
      </div>

      {/* Scatter pairs (top 3 combos) */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Scatter Plots (top pairs)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ids.slice(0, 3).flatMap((idA, i) =>
            ids.slice(i + 1, i + 2).map(idB => (
              <div key={`${idA}-${idB}`} className="card overflow-hidden">
                <ScatterPanel
                  idA={idA}
                  idB={idB}
                  seriesMap={seriesMap}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
