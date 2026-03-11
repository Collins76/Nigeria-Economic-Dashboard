import { useEffect } from 'react';
import { LayoutDashboard, LineChart, ScatterChart, PieChart, Table2, Bell, CalendarClock, ChevronRight } from 'lucide-react';
import Header from './components/Header';
import KPICard from './components/KPICard';
import TimeSeriesChart from './components/TimeSeriesChart';
import FilterBar from './components/FilterBar';
import IndicatorSelector from './components/IndicatorSelector';
import CorrelationMatrix from './components/CorrelationMatrix';
import SectorChart from './components/SectorChart';
import DataTable from './components/DataTable';
import DrilldownPanel from './components/DrilldownPanel';
import AlertsPanel from './components/AlertsPanel';
import EventsTimeline from './components/EventsTimeline';
import { useDashboardStore } from './store/dashboardStore';
import { INDICATORS, INDICATOR_MAP } from './data/indicators';
import { TS_MAP, GDP_SECTORS, TRADE_BREAKDOWN } from './data/timeseries';
import { ECONOMIC_EVENTS } from './data/events';
import { fmtNumber, fmtDeltaPct, deltaPercent } from './utils/format';
import { getLatest, getPrevious, filterByDateRange } from './utils/dataHelpers';

// KPI ids shown in the top row
const KPI_IDS = [
  'gdp_growth', 'inflation_headline', 'fx_usd',
  'mpr', 'fx_reserves', 'oil_price', 'ngx_index', 'unemployment',
];

const TABS = [
  { id: 'overview',     label: 'Overview',     icon: LayoutDashboard },
  { id: 'timeseries',   label: 'Time Series',  icon: LineChart },
  { id: 'correlation',  label: 'Correlation',  icon: ScatterChart },
  { id: 'sectors',      label: 'Sectors',      icon: PieChart },
  { id: 'table',        label: 'Data Table',   icon: Table2 },
  { id: 'events',       label: 'Events',       icon: CalendarClock },
  { id: 'alerts',       label: 'Alerts',       icon: Bell },
] as const;

export default function App() {
  const {
    state, update, toggleDark, setDateRange,
    toggleIndicator, openDrilldown, closeDrilldown,
    addAlert, removeAlert,
  } = useDashboardStore();

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  const selectedInds = state.selectedIndicators
    .map(id => INDICATOR_MAP[id])
    .filter(Boolean);

  const activeTab = state.activeTab;

  // Triggered alerts count
  const triggeredAlerts = state.alerts.filter(a => {
    const latest = getLatest(TS_MAP[a.indicatorId] ?? []);
    return latest && (
      (a.above !== undefined && latest.value > a.above) ||
      (a.below !== undefined && latest.value < a.below)
    );
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header
        darkMode={state.darkMode}
        onToggleDark={toggleDark}
        lastRefreshed={new Date().toLocaleString('en-NG', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
      />

      <main className="max-w-[1600px] mx-auto px-3 sm:px-5 py-5 space-y-5">

        {/* ── KPI Row ──────────────────────────────────────────── */}
        <section aria-label="Key Performance Indicators">
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
            {KPI_IDS.map(id => {
              const ind = INDICATOR_MAP[id];
              if (!ind) return null;
              return (
                <KPICard
                  key={id}
                  indicator={ind}
                  data={TS_MAP[id] ?? []}
                  alerts={state.alerts}
                  onClick={openDrilldown}
                  active={state.activeIndicator === id}
                />
              );
            })}
          </div>
        </section>

        {/* ── Summary Band ────────────────────────────────────── */}
        <section className="card px-5 py-4 bg-gradient-to-r from-nigeria-green/5 to-brand-600/5 border-brand-200 dark:border-brand-900/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Nigeria Economic Dashboard
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
                Real-time macroeconomic indicators sourced from NBS, CBN, World Bank, NGX, NNPC and IMF.
                Data shown is canonical/simulated for demonstration. All 23 indicators available with full history from 2010.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              {['GDP', 'Inflation', 'FX Rate', 'Oil Price'].map(metric => {
                const idMap: Record<string, string> = {
                  GDP: 'gdp_growth', Inflation: 'inflation_headline',
                  'FX Rate': 'fx_usd', 'Oil Price': 'oil_price',
                };
                const id = idMap[metric];
                const latest = getLatest(TS_MAP[id] ?? []);
                const prev = getPrevious(TS_MAP[id] ?? [], 1);
                const delta = latest && prev ? deltaPercent(latest.value, prev.value) : null;
                const ind = INDICATOR_MAP[id];
                return (
                  <button
                    key={metric}
                    onClick={() => openDrilldown(id)}
                    className="text-center hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    aria-label={`View ${metric} details`}
                  >
                    <div className="font-mono font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                      {latest ? fmtNumber(latest.value, 1) : '—'}
                      <span className="text-xs font-normal text-slate-400 ml-0.5">{ind?.unit}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <span>{metric}</span>
                      {delta !== null && (
                        <span className={delta >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                          {fmtDeltaPct(delta)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Tabs ────────────────────────────────────────────── */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => update({ activeTab: tab.id as typeof activeTab })}
                aria-selected={isActive}
                role="tab"
                className={[
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                ].join(' ')}
              >
                <Icon size={14} />
                {tab.label}
                {tab.id === 'alerts' && triggeredAlerts > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {triggeredAlerts}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ─────────────────────────────────────── */}

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
            <div className="space-y-5">
              <FilterBar
                dateFrom={state.dateFrom}
                dateTo={state.dateTo}
                onDateChange={setDateRange}
                compareMode={state.compareMode}
                onToggleCompare={() => update({ compareMode: !state.compareMode })}
                showEvents={state.showEvents}
                onToggleEvents={() => update({ showEvents: !state.showEvents })}
                showMA={state.showMA}
                onToggleMA={() => update({ showMA: !state.showMA })}
              />
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Selected Indicators · Time Series
                  </h2>
                  <span className="text-xs text-slate-400">
                    {selectedInds.length} indicator{selectedInds.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <TimeSeriesChart
                  indicators={selectedInds}
                  seriesMap={TS_MAP}
                  dateFrom={state.dateFrom}
                  dateTo={state.dateTo}
                  events={ECONOMIC_EVENTS}
                  showEvents={state.showEvents}
                  showMA={state.showMA}
                  compareMode={state.compareMode}
                  onIndicatorClick={openDrilldown}
                />
              </div>
              {/* Recent Events preview */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Recent Major Events
                  </h2>
                  <button
                    onClick={() => update({ activeTab: 'events' })}
                    className="text-xs text-brand-600 dark:text-brand-400 flex items-center gap-0.5 hover:underline"
                  >
                    See all <ChevronRight size={12} />
                  </button>
                </div>
                <div className="space-y-2">
                  {ECONOMIC_EVENTS.filter(e => e.date >= state.dateFrom && e.date <= state.dateTo)
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 3)
                    .map(evt => (
                      <div key={evt.id} className={[
                        'flex gap-2 items-start rounded-xl px-3 py-2.5 border text-xs',
                        evt.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' :
                        evt.severity === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' :
                        'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
                      ].join(' ')}>
                        <span className="font-mono tabular-nums shrink-0">{evt.date.slice(0, 7)}</span>
                        <div>
                          <span className="font-semibold">{evt.title}</span>
                          <span className="ml-2 text-slate-500 dark:text-slate-400">{evt.description}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="card p-4">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Indicator Selector
                </h2>
                <IndicatorSelector
                  selected={state.selectedIndicators}
                  onToggle={toggleIndicator}
                />
              </div>
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Alerts
                    {triggeredAlerts > 0 && (
                      <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {triggeredAlerts}
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={() => update({ activeTab: 'alerts' })}
                    className="text-xs text-brand-600 dark:text-brand-400 flex items-center gap-0.5 hover:underline"
                  >
                    Manage <ChevronRight size={12} />
                  </button>
                </div>
                <AlertsPanel
                  alerts={state.alerts}
                  seriesMap={TS_MAP}
                  onAdd={addAlert}
                  onRemove={removeAlert}
                />
              </div>
            </div>
          </div>
        )}

        {/* TIME SERIES */}
        {activeTab === 'timeseries' && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
            <div className="space-y-5">
              <FilterBar
                dateFrom={state.dateFrom}
                dateTo={state.dateTo}
                onDateChange={setDateRange}
                compareMode={state.compareMode}
                onToggleCompare={() => update({ compareMode: !state.compareMode })}
                showEvents={state.showEvents}
                onToggleEvents={() => update({ showEvents: !state.showEvents })}
                showMA={state.showMA}
                onToggleMA={() => update({ showMA: !state.showMA })}
              />
              {INDICATORS.map(ind => {
                if (!state.selectedIndicators.includes(ind.id)) return null;
                const data = filterByDateRange(TS_MAP[ind.id] ?? [], state.dateFrom, state.dateTo);
                const latest = getLatest(data);
                return (
                  <div key={ind.id} className="card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ind.name}</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{ind.unit} · {ind.source}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {latest && (
                          <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                            {fmtNumber(latest.value)}
                          </span>
                        )}
                        <button
                          onClick={() => openDrilldown(ind.id)}
                          className="btn-outline text-xs gap-1"
                          aria-label={`Open ${ind.name} details`}
                        >
                          Details <ChevronRight size={11} />
                        </button>
                      </div>
                    </div>
                    <TimeSeriesChart
                      indicators={[ind]}
                      seriesMap={TS_MAP}
                      dateFrom={state.dateFrom}
                      dateTo={state.dateTo}
                      events={ECONOMIC_EVENTS}
                      showEvents={state.showEvents}
                      showMA={state.showMA}
                      compareMode={false}
                    />
                  </div>
                );
              })}
              {state.selectedIndicators.length === 0 && (
                <div className="card p-10 text-center text-slate-400 dark:text-slate-500">
                  Select indicators from the panel to the right.
                </div>
              )}
            </div>
            <div className="card p-4 h-fit sticky top-20">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Indicator Selector
              </h2>
              <IndicatorSelector
                selected={state.selectedIndicators}
                onToggle={toggleIndicator}
              />
            </div>
          </div>
        )}

        {/* CORRELATION */}
        {activeTab === 'correlation' && (
          <div className="space-y-5">
            <FilterBar
              dateFrom={state.dateFrom}
              dateTo={state.dateTo}
              onDateChange={setDateRange}
              compareMode={state.compareMode}
              onToggleCompare={() => update({ compareMode: !state.compareMode })}
              showEvents={state.showEvents}
              onToggleEvents={() => update({ showEvents: !state.showEvents })}
              showMA={state.showMA}
              onToggleMA={() => update({ showMA: !state.showMA })}
            />
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Correlation Analysis
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Pearson correlation and scatter plots for selected indicator pairs
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  Select 2–6 indicators to compare
                </span>
              </div>
              <CorrelationMatrix
                indicatorIds={state.selectedIndicators}
                seriesMap={TS_MAP}
                dateFrom={state.dateFrom}
                dateTo={state.dateTo}
              />
            </div>
            <div className="card p-4">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Indicator Selector
              </h2>
              <IndicatorSelector selected={state.selectedIndicators} onToggle={toggleIndicator} />
            </div>
          </div>
        )}

        {/* SECTORS */}
        {activeTab === 'sectors' && (
          <div className="space-y-5">
            <div className="card p-5">
              <SectorChart gdpSectors={GDP_SECTORS} tradeBreakdown={TRADE_BREAKDOWN} />
            </div>
            {/* CPI Category heatmap-like table */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Inflation by Component (illustrative)
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                Monthly CPI contributions by category. Source: NBS Nigeria
              </p>
              <div className="overflow-x-auto">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2 px-3 text-left font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                      {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                        <th key={m} className="py-2 px-2 text-center font-semibold text-slate-500 uppercase tracking-wide w-12">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { label: 'Food & Non-Alc.', base: 42, var: 5 },
                      { label: 'Housing & Utilities', base: 28, var: 4 },
                      { label: 'Transport', base: 35, var: 6 },
                      { label: 'Healthcare', base: 22, var: 3 },
                      { label: 'Education', base: 18, var: 2.5 },
                      { label: 'Clothing', base: 15, var: 2 },
                      { label: 'Communication', base: 12, var: 1.5 },
                    ].map(cat => {
                      const rand = (seed: number) => {
                        let s = seed;
                        s = (s * 1664525 + 1013904223) & 0xffffffff;
                        return (s >>> 0) / 4294967296;
                      };
                      const vals = Array.from({ length: 12 }, (_, i) => {
                        const r = rand(cat.base * 100 + i * 37);
                        return Math.round((cat.base + (r - 0.5) * cat.var * 2) * 10) / 10;
                      });
                      const min = Math.min(...vals), max = Math.max(...vals);
                      return (
                        <tr key={cat.label} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="py-1.5 px-3 font-medium text-slate-700 dark:text-slate-300">{cat.label}</td>
                          {vals.map((v, i) => {
                            const intensity = (v - min) / (max - min || 1);
                            const bg = `rgba(239,68,68,${intensity * 0.6})`;
                            return (
                              <td
                                key={i}
                                className="py-1.5 px-2 text-center font-mono tabular-nums"
                                style={{ backgroundColor: bg, color: intensity > 0.5 ? '#fff' : 'inherit' }}
                              >
                                {v}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DATA TABLE */}
        {activeTab === 'table' && (
          <div className="space-y-5">
            <FilterBar
              dateFrom={state.dateFrom}
              dateTo={state.dateTo}
              onDateChange={setDateRange}
              compareMode={state.compareMode}
              onToggleCompare={() => update({ compareMode: !state.compareMode })}
              showEvents={state.showEvents}
              onToggleEvents={() => update({ showEvents: !state.showEvents })}
              showMA={state.showMA}
              onToggleMA={() => update({ showMA: !state.showMA })}
            />
            <div className="card p-5">
              <DataTable
                indicatorIds={state.selectedIndicators}
                seriesMap={TS_MAP}
                dateFrom={state.dateFrom}
                dateTo={state.dateTo}
              />
            </div>
          </div>
        )}

        {/* EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-5">
            <FilterBar
              dateFrom={state.dateFrom}
              dateTo={state.dateTo}
              onDateChange={setDateRange}
              compareMode={state.compareMode}
              onToggleCompare={() => update({ compareMode: !state.compareMode })}
              showEvents={state.showEvents}
              onToggleEvents={() => update({ showEvents: !state.showEvents })}
              showMA={state.showMA}
              onToggleMA={() => update({ showMA: !state.showMA })}
            />
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Nigeria Economic Events Timeline
              </h2>
              <EventsTimeline dateFrom={state.dateFrom} dateTo={state.dateTo} />
            </div>
          </div>
        )}

        {/* ALERTS */}
        {activeTab === 'alerts' && (
          <div className="max-w-2xl">
            <div className="card p-5">
              <AlertsPanel
                alerts={state.alerts}
                seriesMap={TS_MAP}
                onAdd={addAlert}
                onRemove={removeAlert}
              />
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 py-6">
        <div className="max-w-[1600px] mx-auto px-5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-nigeria-green to-brand-700 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">NG</span>
            </div>
            <span>Nigeria Economic Dashboard · Data sourced from NBS, CBN, NGX, World Bank, IMF</span>
          </div>
          <div className="flex gap-4">
            {['NBS Nigeria', 'CBN Nigeria', 'World Bank', 'NGX Group'].map(src => (
              <span key={src} className="hover:text-slate-600 dark:hover:text-slate-300 cursor-default">{src}</span>
            ))}
          </div>
          <span>© {new Date().getFullYear()} · For informational purposes only</span>
        </div>
      </footer>

      {/* Drilldown modal */}
      {state.drilldownOpen && state.drilldownIndicator && (
        <DrilldownPanel
          indicatorId={state.drilldownIndicator}
          seriesMap={TS_MAP}
          dateFrom={state.dateFrom}
          dateTo={state.dateTo}
          alerts={state.alerts}
          onClose={closeDrilldown}
        />
      )}
    </div>
  );
}
