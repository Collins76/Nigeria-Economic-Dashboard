import { Moon, Sun, RefreshCw, BarChart2, Bell } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
  lastRefreshed: string;
}

export default function Header({ darkMode, onToggleDark, lastRefreshed }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nigeria-green to-brand-700 flex items-center justify-center">
              <BarChart2 size={16} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Nigeria Economic Dashboard</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Macroeconomic Indicators</div>
            </div>
          </div>
          {/* Flag pill */}
          <span className="hidden md:inline-flex items-center gap-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800 font-medium">
            🇳🇬 Nigeria
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <span className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <RefreshCw size={12} />
            Updated {lastRefreshed}
          </span>
          <span className="hidden sm:flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
            <Bell size={10} />
            Live data (simulated)
          </span>
          <button
            onClick={onToggleDark}
            aria-label="Toggle dark mode"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
