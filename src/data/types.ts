export type Frequency = 'daily' | 'monthly' | 'quarterly' | 'annual';
export type Category =
  | 'GDP'
  | 'Inflation'
  | 'Labour'
  | 'Exchange Rate'
  | 'Interest Rates'
  | 'Trade'
  | 'Fiscal'
  | 'External'
  | 'Commodities'
  | 'Financial Markets'
  | 'Leading Indicators';

export interface Indicator {
  id: string;
  name: string;
  shortName: string;
  category: Category;
  unit: string;
  frequency: Frequency;
  source: string;
  sourceUrl: string;
  description: string;
  positiveDirection: 'up' | 'down' | 'neutral'; // up = higher is good
  lastUpdated: string;
  updateCadence: string;
  color: string;
}

export interface DataPoint {
  date: string; // ISO string YYYY-MM-DD or YYYY-MM or YYYY-Qn
  value: number;
  label?: string;
}

export interface TimeSeries {
  indicatorId: string;
  data: DataPoint[];
}

export interface EconomicEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  tags: string[];
  severity: 'info' | 'warning' | 'critical';
}

export interface AlertThreshold {
  indicatorId: string;
  above?: number;
  below?: number;
  label: string;
}

export interface SectorBreakdown {
  period: string;
  agriculture: number;
  industry: number;
  services: number;
  oil: number;
}

export interface TradeBreakdown {
  period: string;
  oilExports: number;
  nonOilExports: number;
  imports: number;
}
