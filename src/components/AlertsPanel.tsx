import { useState } from 'react';
import { Bell, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { INDICATORS, INDICATOR_MAP } from '../data/indicators';
import type { AlertThreshold, DataPoint } from '../data/types';
import { getLatest } from '../utils/dataHelpers';
import { fmtNumber } from '../utils/format';

interface AlertsPanelProps {
  alerts: AlertThreshold[];
  seriesMap: Record<string, DataPoint[]>;
  onAdd: (alert: AlertThreshold) => void;
  onRemove: (indicatorId: string) => void;
}

export default function AlertsPanel({ alerts, seriesMap, onAdd, onRemove }: AlertsPanelProps) {
  const [newId, setNewId] = useState('');
  const [newAbove, setNewAbove] = useState('');
  const [newBelow, setNewBelow] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const handleAdd = () => {
    if (!newId || !newLabel) return;
    onAdd({
      indicatorId: newId,
      above: newAbove ? parseFloat(newAbove) : undefined,
      below: newBelow ? parseFloat(newBelow) : undefined,
      label: newLabel,
    });
    setNewId(''); setNewAbove(''); setNewBelow(''); setNewLabel('');
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
          <Bell size={14} className="text-amber-500" />
          Active Alerts
        </h3>
        {alerts.length === 0 && (
          <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-5">
            No alerts configured.
          </div>
        )}
        <div className="space-y-2">
          {alerts.map((alert) => {
            const ind = INDICATOR_MAP[alert.indicatorId];
            const latest = getLatest(seriesMap[alert.indicatorId] ?? []);
            const isTriggered = latest && (
              (alert.above !== undefined && latest.value > alert.above) ||
              (alert.below !== undefined && latest.value < alert.below)
            );
            return (
              <div
                key={alert.indicatorId + String(alert.above) + String(alert.below)}
                className={[
                  'flex items-start gap-3 rounded-xl px-4 py-3 border',
                  isTriggered
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
                ].join(' ')}
              >
                <AlertTriangle
                  size={15}
                  className={isTriggered ? 'text-red-500 shrink-0 mt-0.5' : 'text-slate-400 shrink-0 mt-0.5'}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{alert.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {ind?.shortName} —
                    {alert.above !== undefined && ` Alert if above ${fmtNumber(alert.above)} ${ind?.unit}`}
                    {alert.below !== undefined && ` Alert if below ${fmtNumber(alert.below)} ${ind?.unit}`}
                  </div>
                  {latest && (
                    <div className={[
                      'text-xs font-mono font-semibold mt-1',
                      isTriggered ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300',
                    ].join(' ')}>
                      Current: {fmtNumber(latest.value)} {ind?.unit}
                      {isTriggered && ' — TRIGGERED'}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onRemove(alert.indicatorId)}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 shrink-0"
                  aria-label="Remove alert"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add new alert */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
          <Plus size={14} />
          Add New Alert
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Indicator</label>
            <select
              value={newId}
              onChange={e => setNewId(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Select indicator…</option>
              {INDICATORS.map(i => (
                <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Alert Label</label>
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="e.g. High inflation"
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Alert if above</label>
            <input
              type="number"
              value={newAbove}
              onChange={e => setNewAbove(e.target.value)}
              placeholder="e.g. 30"
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Alert if below</label>
            <input
              type="number"
              value={newBelow}
              onChange={e => setNewBelow(e.target.value)}
              placeholder="e.g. 30"
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={!newId || !newLabel}
          className="btn-primary mt-3 text-xs w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={13} />
          Add Alert
        </button>
      </div>
    </div>
  );
}
