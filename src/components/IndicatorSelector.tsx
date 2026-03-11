import { Check } from 'lucide-react';
import { INDICATORS, CATEGORIES } from '../data/indicators';
import type { Category } from '../data/types';

interface IndicatorSelectorProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export default function IndicatorSelector({ selected, onToggle }: IndicatorSelectorProps) {
  return (
    <div className="space-y-3">
      {(CATEGORIES as Category[]).map(cat => {
        const catIndicators = INDICATORS.filter(i => i.category === cat);
        return (
          <div key={cat}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 px-1">
              {cat}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {catIndicators.map(ind => {
                const isSelected = selected.includes(ind.id);
                return (
                  <button
                    key={ind.id}
                    onClick={() => onToggle(ind.id)}
                    aria-pressed={isSelected}
                    className={[
                      'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-100 border',
                      isSelected
                        ? 'border-transparent text-white'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600',
                    ].join(' ')}
                    style={isSelected ? { backgroundColor: ind.color, borderColor: ind.color } : {}}
                  >
                    {isSelected && <Check size={10} />}
                    {ind.shortName}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
