import { AlertTriangle, Info, Zap } from 'lucide-react';
import type { EconomicEvent } from '../data/types';
import { ECONOMIC_EVENTS } from '../data/events';

interface EventsTimelineProps {
  dateFrom: string;
  dateTo: string;
}

const severityConfig = {
  critical: {
    icon: Zap,
    bg: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
    text: 'text-blue-700 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
};

export default function EventsTimeline({ dateFrom, dateTo }: EventsTimelineProps) {
  const events = ECONOMIC_EVENTS
    .filter(e => e.date >= dateFrom && e.date <= dateTo)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!events.length) {
    return (
      <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">
        No major events in the selected date range.
      </div>
    );
  }

  // Group by year
  const byYear: Record<string, EconomicEvent[]> = {};
  for (const evt of events) {
    const yr = evt.date.slice(0, 4);
    if (!byYear[yr]) byYear[yr] = [];
    byYear[yr].push(evt);
  }

  return (
    <div className="space-y-6">
      {Object.entries(byYear).sort(([a], [b]) => b.localeCompare(a)).map(([year, evts]) => (
        <div key={year}>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            {year}
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="space-y-2">
            {evts.map(evt => {
              const cfg = severityConfig[evt.severity];
              const Icon = cfg.icon;
              return (
                <div
                  key={evt.id}
                  className={`flex gap-3 rounded-xl px-4 py-3 border ${cfg.bg}`}
                >
                  <div className={`w-1.5 rounded-full self-stretch ${cfg.dot} shrink-0`} />
                  <Icon size={15} className={`${cfg.text} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs text-slate-400 dark:text-slate-500 mr-2 tabular-nums">
                          {evt.date.slice(0, 7)}
                        </span>
                        <span className={`text-sm font-semibold ${cfg.text}`}>{evt.title}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 shrink-0">
                        {evt.tags.map(tag => (
                          <span key={tag} className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cfg.badge}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
