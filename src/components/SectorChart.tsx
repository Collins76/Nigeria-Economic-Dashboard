import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ComposedChart, Line,
} from 'recharts';
import type { SectorBreakdown, TradeBreakdown } from '../data/types';
import { fmtNumber } from '../utils/format';

interface SectorChartProps {
  gdpSectors: SectorBreakdown[];
  tradeBreakdown: TradeBreakdown[];
}

function SectorTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 text-xs min-w-[160px]">
      <div className="font-semibold text-slate-600 dark:text-slate-300 mb-2">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex justify-between items-center gap-4 mb-1">
          <span className="flex items-center gap-1.5">
            <span style={{ background: p.fill }} className="w-2 h-2 rounded-sm inline-block" />
            <span className="text-slate-700 dark:text-slate-300">{p.name}</span>
          </span>
          <span className="font-mono font-semibold text-slate-900 dark:text-white">
            {fmtNumber(p.value)}
          </span>
        </div>
      ))}
      <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2 flex justify-between text-slate-500 dark:text-slate-400">
        <span>Total</span>
        <span className="font-mono font-semibold">{fmtNumber(total)}</span>
      </div>
    </div>
  );
}

export default function SectorChart({ gdpSectors, tradeBreakdown }: SectorChartProps) {
  const recentSectors = gdpSectors.slice(-12);
  const recentTrade = tradeBreakdown.slice(-12);

  return (
    <div className="space-y-8">
      {/* GDP by Sector */}
      <div>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            GDP by Sector (₦ Trillion, Quarterly)
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Source: National Bureau of Statistics Nigeria
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={recentSectors} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700/50" />
            <XAxis dataKey="period" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={1} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => fmtNumber(v, 0)} width={40} />
            <Tooltip content={<SectorTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="agriculture" name="Agriculture" stackId="a" fill="#4ade80" radius={[0,0,0,0]} />
            <Bar dataKey="industry"    name="Industry"    stackId="a" fill="#3b82f6" radius={[0,0,0,0]} />
            <Bar dataKey="services"    name="Services"    stackId="a" fill="#8b5cf6" radius={[0,0,0,0]} />
            <Bar dataKey="oil"         name="Oil (Crude)" stackId="a" fill="#64748b" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trade Breakdown */}
      <div>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Trade Breakdown ($ Billion, Quarterly)
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Source: National Bureau of Statistics Nigeria / CBN
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={recentTrade} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700/50" />
            <XAxis dataKey="period" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={1} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => fmtNumber(v, 0)} width={40} />
            <Tooltip content={<SectorTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="oilExports"    name="Oil Exports"     stackId="exp" fill="#22c55e" radius={[0,0,0,0]} />
            <Bar dataKey="nonOilExports" name="Non-Oil Exports" stackId="exp" fill="#86efac" radius={[2,2,0,0]} />
            <Line type="monotone" dataKey="imports" name="Imports" stroke="#ef4444" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
