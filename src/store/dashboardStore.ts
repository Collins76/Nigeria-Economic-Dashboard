import { useState, useCallback } from 'react';
import type { AlertThreshold } from '../data/types';

export interface DashboardState {
  darkMode: boolean;
  dateFrom: string;
  dateTo: string;
  selectedIndicators: string[];
  activeIndicator: string | null;
  compareMode: boolean;
  showEvents: boolean;
  showMA: boolean;
  activeTab: 'overview' | 'timeseries' | 'correlation' | 'sectors' | 'table' | 'events' | 'alerts';
  alerts: AlertThreshold[];
  drilldownOpen: boolean;
  drilldownIndicator: string | null;
}

export function useDashboardStore() {
  const [state, setState] = useState<DashboardState>({
    darkMode: true,
    dateFrom: '2019-01-01',
    dateTo: '2025-03-01',
    selectedIndicators: [
      'gdp_growth',
      'inflation_headline',
      'fx_usd',
      'mpr',
      'fx_reserves',
      'oil_price',
    ],
    activeIndicator: 'inflation_headline',
    compareMode: false,
    showEvents: true,
    showMA: false,
    activeTab: 'overview',
    alerts: [
      { indicatorId: 'inflation_headline', above: 30, label: 'High inflation alert' },
      { indicatorId: 'fx_reserves', below: 30, label: 'Low reserves warning' },
    ],
    drilldownOpen: false,
    drilldownIndicator: null,
  });

  const update = useCallback((patch: Partial<DashboardState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  const toggleDark = useCallback(() => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const setDateRange = useCallback((from: string, to: string) => {
    setState(prev => ({ ...prev, dateFrom: from, dateTo: to }));
  }, []);

  const toggleIndicator = useCallback((id: string) => {
    setState(prev => {
      const has = prev.selectedIndicators.includes(id);
      const next = has
        ? prev.selectedIndicators.filter(x => x !== id)
        : [...prev.selectedIndicators, id];
      return { ...prev, selectedIndicators: next };
    });
  }, []);

  const openDrilldown = useCallback((id: string) => {
    setState(prev => ({ ...prev, drilldownOpen: true, drilldownIndicator: id }));
  }, []);

  const closeDrilldown = useCallback(() => {
    setState(prev => ({ ...prev, drilldownOpen: false, drilldownIndicator: null }));
  }, []);

  const addAlert = useCallback((alert: AlertThreshold) => {
    setState(prev => ({ ...prev, alerts: [...prev.alerts.filter(a => a.indicatorId !== alert.indicatorId || (a.above !== alert.above && a.below !== alert.below)), alert] }));
  }, []);

  const removeAlert = useCallback((indicatorId: string) => {
    setState(prev => ({ ...prev, alerts: prev.alerts.filter(a => a.indicatorId !== indicatorId) }));
  }, []);

  return { state, update, toggleDark, setDateRange, toggleIndicator, openDrilldown, closeDrilldown, addAlert, removeAlert };
}
