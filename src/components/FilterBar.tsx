import { Calendar, SlidersHorizontal, Eye, EyeOff, GitCompare, TrendingUp } from 'lucide-react';

interface FilterBarProps {
  dateFrom: string;
  dateTo: string;
  onDateChange: (from: string, to: string) => void;
  compareMode: boolean;
  onToggleCompare: () => void;
  showEvents: boolean;
  onToggleEvents: () => void;
  showMA: boolean;
  onToggleMA: () => void;
}

const PRESETS = [
  { label: '1Y', from: '2024-03-01', to: '2025-03-01' },
  { label: '3Y', from: '2022-01-01', to: '2025-03-01' },
  { label: '5Y', from: '2020-01-01', to: '2025-03-01' },
  { label: '10Y', from: '2015-01-01', to: '2025-03-01' },
  { label: 'All', from: '2010-01-01', to: '2025-03-01' },
];

export default function FilterBar({
  dateFrom, dateTo, onDateChange,
  compareMode, onToggleCompare,
  showEvents, onToggleEvents,
  showMA, onToggleMA,
}: FilterBarProps) {
  return (
    <div className="card px-4 py-3 flex flex-wrap items-center gap-3">
      {/* Date presets */}
      <div className="flex items-center gap-1.5">
        <Calendar size={14} className="text-slate-400 shrink-0" />
        <div className="flex gap-1">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => onDateChange(p.from, p.to)}
              className={[
                'px-2 py-1 text-xs font-medium rounded transition-colors',
                dateFrom === p.from && dateTo === p.to
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
              ].join(' ')}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 hidden sm:block" />

      {/* Custom date range */}
      <div className="flex items-center gap-1.5">
        <SlidersHorizontal size={13} className="text-slate-400 shrink-0" />
        <input
          type="date"
          value={dateFrom}
          onChange={e => onDateChange(e.target.value, dateTo)}
          className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          aria-label="Start date"
        />
        <span className="text-xs text-slate-400">–</span>
        <input
          type="date"
          value={dateTo}
          onChange={e => onDateChange(dateFrom, e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          aria-label="End date"
        />
      </div>

      <div className="flex-1" />

      {/* Toggles */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleEvents}
          aria-pressed={showEvents}
          className={['btn text-xs gap-1', showEvents ? 'btn-primary' : 'btn-outline'].join(' ')}
        >
          {showEvents ? <Eye size={12} /> : <EyeOff size={12} />}
          Events
        </button>
        <button
          onClick={onToggleMA}
          aria-pressed={showMA}
          className={['btn text-xs gap-1', showMA ? 'btn-primary' : 'btn-outline'].join(' ')}
        >
          <TrendingUp size={12} />
          3-period MA
        </button>
        <button
          onClick={onToggleCompare}
          aria-pressed={compareMode}
          className={['btn text-xs gap-1', compareMode ? 'btn-primary' : 'btn-outline'].join(' ')}
        >
          <GitCompare size={12} />
          Compare
        </button>
      </div>
    </div>
  );
}
